// service/SupplierService.java
package com.romen.inventory.service;

import com.romen.inventory.entity.Supplier;
import com.romen.inventory.exception.ResourceNotFoundException;
import com.romen.inventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    @Transactional
    @CacheEvict(value = "suppliers", allEntries = true)
    public Supplier createSupplier(Supplier supplier) {
        // Validate email uniqueness
        if (supplier.getEmail() != null && !supplier.getEmail().isEmpty()) {
            if (supplierRepository.existsByEmail(supplier.getEmail())) {
                throw new IllegalArgumentException("Supplier with this email already exists");
            }
        }
        return supplierRepository.save(supplier);
    }

    public Supplier getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
    }

    @Cacheable(value = "suppliers")
    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findByIsActiveTrue();
    }

    @Cacheable(value = "suppliers", key = "'search_' + #keyword")
    public List<Supplier> searchSuppliers(String keyword) {
        return supplierRepository.searchActiveSuppliers(keyword);
    }

    @Transactional
    @CacheEvict(value = "suppliers", allEntries = true)
    public Supplier updateSupplier(Long id, Supplier supplierDetails) {
        Supplier supplier = getSupplierById(id);

        // Check email uniqueness if changed
        if (supplierDetails.getEmail() != null && !supplierDetails.getEmail().equals(supplier.getEmail())) {
            if (supplierRepository.existsByEmail(supplierDetails.getEmail())) {
                throw new IllegalArgumentException("Supplier with this email already exists");
            }
            supplier.setEmail(supplierDetails.getEmail());
        }

        supplier.setName(supplierDetails.getName());
        supplier.setAddress(supplierDetails.getAddress());
        supplier.setPhone(supplierDetails.getPhone());
        supplier.setContactPerson(supplierDetails.getContactPerson());
        supplier.setContactPersonPhone(supplierDetails.getContactPersonPhone());
        supplier.setDescription(supplierDetails.getDescription());
        supplier.setLicenseNumber(supplierDetails.getLicenseNumber());
        if (supplierDetails.getActive() != null) {
            supplier.setActive(supplierDetails.getActive());
        }

        return supplierRepository.save(supplier);
    }

    @Transactional
    @CacheEvict(value = "suppliers", allEntries = true)
    public void deleteSupplier(Long id) {
        Supplier supplier = getSupplierById(id);
        supplier.setActive(false);
        supplierRepository.save(supplier);
    }

    public Long getActiveSupplierCount() {
        return supplierRepository.countByIsActiveTrue();
    }
}
