// service/CategoryService.java
package com.romen.inventory.service;

import com.romen.inventory.dto.CategoryRequest;
import com.romen.inventory.dto.CategoryResponse;
import com.romen.inventory.dto.CategoryTreeResponse;
import com.romen.inventory.entity.Category;
import com.romen.inventory.entity.User;
import com.romen.inventory.exception.ResourceNotFoundException;
import com.romen.inventory.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request, User createdBy) {
        // Check if category name already exists for the same parent
        if (categoryRepository.existsByNameAndParentId(
                request.getName(),
                request.getParentId())) {
            throw new IllegalArgumentException("Category with this name already exists");
        }

        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
        }

        // Handle image upload
        String imageUrl = null;
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            try {
                imageUrl = fileStorageService.storeFile(request.getImage(), "categories");
            } catch (IOException e) {
                log.error("Failed to upload category image", e);
                throw new RuntimeException("Failed to upload image");
            }
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .imageUrl(imageUrl)
                .parent(parent)
                .expiryDays(request.getExpiryDays())
                .displayOrder(request.getDisplayOrder())
                .isActive(request.getIsActive())
                .createdBy(createdBy)
                .build();

        category = categoryRepository.save(category);
        return mapToCategoryResponse(category);
    }

    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return mapToCategoryResponse(category);
    }

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAllActiveOrdered().stream()
                .map(this::mapToCategoryResponse)
                .collect(Collectors.toList());
    }

    public List<CategoryResponse> getMainCategories() {
        return categoryRepository.findActiveMainCategories().stream()
                .map(this::mapToCategoryResponse)
                .collect(Collectors.toList());
    }

    public List<CategoryResponse> getSubcategories(Long parentId) {
        return categoryRepository.findByParentIdAndIsActiveTrue(parentId).stream()
                .map(this::mapToCategoryResponse)
                .collect(Collectors.toList());
    }

    public List<CategoryTreeResponse> getCategoryTree() {
        List<Category> mainCategories = categoryRepository.findActiveMainCategories();
        return mainCategories.stream()
                .map(this::mapToCategoryTreeResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        // Check if category name already exists (excluding current category)
        if (categoryRepository.existsByNameAndParentIdAndIdNot(
                request.getName(),
                request.getParentId(),
                id)) {
            throw new IllegalArgumentException("Category with this name already exists");
        }

        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
            // Prevent circular reference
            if (parent.getId().equals(id)) {
                throw new IllegalArgumentException("Category cannot be its own parent");
            }
        }

        // Handle image upload if new image provided
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            try {
                // Delete old image if exists
                if (category.getImageUrl() != null) {
                    fileStorageService.deleteFile(category.getImageUrl());
                }
                // Upload new image
                String imageUrl = fileStorageService.storeFile(request.getImage(), "categories");
                category.setImageUrl(imageUrl);
            } catch (IOException e) {
                log.error("Failed to update category image", e);
                throw new RuntimeException("Failed to update image");
            }
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setParent(parent);
        category.setExpiryDays(request.getExpiryDays());
        category.setDisplayOrder(request.getDisplayOrder());
        category.setIsActive(request.getIsActive());

        category = categoryRepository.save(category);
        return mapToCategoryResponse(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        // Check if category has subcategories
        List<Category> subcategories = categoryRepository.findByParentId(id);
        if (!subcategories.isEmpty()) {
            throw new IllegalArgumentException("Cannot delete category with subcategories");
        }

        // Delete image if exists
        if (category.getImageUrl() != null) {
            fileStorageService.deleteFile(category.getImageUrl());
        }

        categoryRepository.delete(category);
    }

    @Transactional
    public CategoryResponse toggleCategoryStatus(Long id, boolean isActive) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        category.setIsActive(isActive);
        category = categoryRepository.save(category);

        return mapToCategoryResponse(category);
    }

    public List<CategoryResponse> searchCategories(String keyword) {
        return categoryRepository.searchActiveCategories(keyword).stream()
                .map(this::mapToCategoryResponse)
                .collect(Collectors.toList());
    }

    private CategoryResponse mapToCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                .expiryDays(category.getExpiryDays())
                .displayOrder(category.getDisplayOrder())
                .isActive(category.getIsActive())
                .createdBy(category.getCreatedBy() != null ? category.getCreatedBy().getFullName() : null)
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .subCategories(category.getSubCategories() != null ?
                        category.getSubCategories().stream()
                                .map(this::mapToCategoryResponse)
                                .collect(Collectors.toList()) : null)
                .build();
    }

    private CategoryTreeResponse mapToCategoryTreeResponse(Category category) {
        List<CategoryTreeResponse> children = category.getSubCategories() != null ?
                category.getSubCategories().stream()
                        .map(this::mapToCategoryTreeResponse)
                        .collect(Collectors.toList()) : null;

        return CategoryTreeResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .imageUrl(category.getImageUrl())
                .children(children)
                .build();
    }
}