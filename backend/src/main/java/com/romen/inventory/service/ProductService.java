// service/ProductService.java
package com.romen.inventory.service;

import com.romen.inventory.dto.ProductRequest;
import com.romen.inventory.dto.ProductResponse;
import com.romen.inventory.entity.Category;
import com.romen.inventory.entity.Inventory;
import com.romen.inventory.entity.Product;
import com.romen.inventory.entity.User;
import com.romen.inventory.exception.ResourceNotFoundException;
import com.romen.inventory.repository.CategoryRepository;
import com.romen.inventory.repository.InventoryRepository;
import com.romen.inventory.repository.ProductRepository;
import com.romen.inventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;
    private final SupplierRepository supplierRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public ProductResponse createProduct(ProductRequest request, User createdBy) {
        // Validate category
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        // Check if product code already exists
        if (request.getProductCode() != null && !request.getProductCode().isEmpty()) {
            if (productRepository.existsByProductCode(request.getProductCode())) {
                throw new IllegalArgumentException("Product code already exists");
            }
        }

        // Handle image upload
        String imageUrl = null;
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            try {
                imageUrl = fileStorageService.storeFile(request.getImage(), "products");
            } catch (IOException e) {
                log.error("Failed to upload product image", e);
                throw new RuntimeException("Failed to upload image");
            }
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .productCode(request.getProductCode())
                .category(category)
                .productType(request.getProductType())
                .unitOfMeasure(request.getUnitOfMeasure())
                .price(request.getPrice())
                .costPrice(request.getCostPrice())
                .imageUrl(imageUrl)
                .minStockLevel(request.getMinStockLevel())
                .maxStockLevel(request.getMaxStockLevel())
                .reorderPoint(request.getReorderPoint())
                .expiryDays(request.getExpiryDays())
                .isActive(request.getIsActive())
                .isSellable(request.getIsSellable())
                .createdBy(createdBy)
                .supplier(request.getSupplierId() != null
                        ? supplierRepository.findById(request.getSupplierId()).orElse(null)
                        : null)
                .build();

        product = productRepository.save(product);

        // Get initial stock or default to 0
        Integer initialStock = request.getInitialStock();
        if (initialStock == null) {
            initialStock = 0;
        }

        // Create initial inventory record with initial stock
        Inventory inventory = Inventory.builder()
                .product(product)
                .currentQuantity(initialStock)
                .availableQuantity(initialStock)
                .isOutOfStock(initialStock <= 0)
                .isLowStock(initialStock > 0 && initialStock <= product.getMinStockLevel())
                .build();
        inventoryRepository.save(inventory);

        return mapToProductResponse(product, inventory);
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        Inventory inventory = inventoryRepository.findByProductId(id).orElse(null);
        return mapToProductResponse(product, inventory);
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findByIsActiveTrue().stream()
                .map(product -> {
                    Inventory inventory = inventoryRepository.findByProductId(product.getId()).orElse(null);
                    return mapToProductResponse(product, inventory);
                })
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryIdAndIsActiveTrue(categoryId).stream()
                .map(product -> {
                    Inventory inventory = inventoryRepository.findByProductId(product.getId()).orElse(null);
                    return mapToProductResponse(product, inventory);
                })
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getProductsByType(Product.ProductType type) {
        return productRepository.findActiveByProductType(type).stream()
                .map(product -> {
                    Inventory inventory = inventoryRepository.findByProductId(product.getId()).orElse(null);
                    return mapToProductResponse(product, inventory);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        // Validate category if changed
        if (request.getCategoryId() != null && !request.getCategoryId().equals(product.getCategory().getId())) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            product.setCategory(category);
        }

        // Check product code uniqueness if changed
        if (request.getProductCode() != null && !request.getProductCode().equals(product.getProductCode())) {
            if (productRepository.existsByProductCode(request.getProductCode())) {
                throw new IllegalArgumentException("Product code already exists");
            }
            product.setProductCode(request.getProductCode());
        }

        // Handle image upload if new image provided
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            try {
                // Delete old image if exists
                if (product.getImageUrl() != null) {
                    fileStorageService.deleteFile(product.getImageUrl());
                }
                // Upload new image
                String imageUrl = fileStorageService.storeFile(request.getImage(), "products");
                product.setImageUrl(imageUrl);
            } catch (IOException e) {
                log.error("Failed to update product image", e);
                throw new RuntimeException("Failed to update image");
            }
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setProductType(request.getProductType());
        product.setUnitOfMeasure(request.getUnitOfMeasure());
        product.setPrice(request.getPrice());
        product.setCostPrice(request.getCostPrice());
        product.setMinStockLevel(request.getMinStockLevel());
        product.setMaxStockLevel(request.getMaxStockLevel());
        product.setReorderPoint(request.getReorderPoint());
        product.setExpiryDays(request.getExpiryDays());
        product.setIsActive(request.getIsActive());
        product.setIsSellable(request.getIsSellable());

        if (request.getSupplierId() != null) {
            product.setSupplier(supplierRepository.findById(request.getSupplierId()).orElse(null));
        }

        product = productRepository.save(product);
        Inventory inventory = inventoryRepository.findByProductId(id).orElse(null);
        return mapToProductResponse(product, inventory);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        // Soft delete the product
        product.setIsActive(false);
        productRepository.save(product);

        // Zero out the inventory to reflect deletion
        inventoryRepository.findByProductId(id).ifPresent(inventory -> {
            inventory.setCurrentQuantity(0);
            inventory.setAvailableQuantity(0);
            inventory.setIsOutOfStock(true);
            inventory.setIsLowStock(false);
            inventoryRepository.save(inventory);
        });

        // Delete image if exists
        if (product.getImageUrl() != null) {
            fileStorageService.deleteFile(product.getImageUrl());
        }
    }

    public List<ProductResponse> searchProducts(String keyword) {
        return productRepository.searchActiveProducts(keyword).stream()
                .map(product -> {
                    Inventory inventory = inventoryRepository.findByProductId(product.getId()).orElse(null);
                    return mapToProductResponse(product, inventory);
                })
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream()
                .map(product -> {
                    Inventory inventory = inventoryRepository.findByProductId(product.getId()).orElse(null);
                    return mapToProductResponse(product, inventory);
                })
                .collect(Collectors.toList());
    }

    public List<ProductResponse> filterProducts(Long categoryId, String brandName, String flavor,
            Product.ProductType productType, BigDecimal minPrice, BigDecimal maxPrice) {
        return productRepository.findAll().stream()
                .filter(product -> {
                    if (!product.getIsActive())
                        return false;
                    if (categoryId != null && !product.getCategory().getId().equals(categoryId))
                        return false;
                    if (brandName != null && !brandName.isEmpty() &&
                            (product.getBrandName() == null
                                    || !product.getBrandName().toLowerCase().contains(brandName.toLowerCase())))
                        return false;
                    if (flavor != null && !flavor.isEmpty() &&
                            (product.getFlavor() == null
                                    || !product.getFlavor().toLowerCase().contains(flavor.toLowerCase())))
                        return false;
                    if (productType != null && product.getProductType() != productType)
                        return false;
                    if (minPrice != null && (product.getPrice() == null || product.getPrice().compareTo(minPrice) < 0))
                        return false;
                    if (maxPrice != null && (product.getPrice() == null || product.getPrice().compareTo(maxPrice) > 0))
                        return false;
                    return true;
                })
                .map(product -> {
                    Inventory inventory = inventoryRepository.findByProductId(product.getId()).orElse(null);
                    return mapToProductResponse(product, inventory);
                })
                .collect(Collectors.toList());
    }

    private ProductResponse mapToProductResponse(Product product, Inventory inventory) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .sku(product.getSku())
                .barcode(product.getBarcode())
                .hsnCode(product.getHsnCode())
                .productCode(product.getProductCode())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .productType(product.getProductType())
                .unitOfMeasure(product.getUnitOfMeasure())
                .price(product.getPrice())
                .costPrice(product.getCostPrice())
                .taxRate(product.getTaxRate())
                .brandName(product.getBrandName())
                .flavor(product.getFlavor())
                .weight(product.getWeight())
                .imageUrl(product.getImageUrl())
                .minStockLevel(product.getMinStockLevel())
                .maxStockLevel(product.getMaxStockLevel())
                .reorderPoint(product.getReorderPoint())
                .expiryDays(product.getExpiryDays())
                .isPerishable(product.getIsPerishable())
                .isActive(product.getIsActive())
                .isSellable(product.getIsSellable())
                .supplierId(product.getSupplier() != null ? product.getSupplier().getId() : null)
                .supplierName(product.getSupplier() != null ? product.getSupplier().getName() : null)
                .createdByName(product.getCreatedBy() != null ? product.getCreatedBy().getFullName() : null)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .currentStock(inventory != null ? inventory.getCurrentQuantity() : 0)
                .availableStock(inventory != null ? inventory.getAvailableQuantity() : 0)
                .isLowStock(inventory != null ? inventory.getIsLowStock() : false)
                .isOutOfStock(inventory != null ? inventory.getIsOutOfStock() : true)
                .build();
    }
}
