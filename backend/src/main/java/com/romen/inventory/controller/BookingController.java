package com.romen.inventory.controller;

import com.romen.inventory.dto.*;
import com.romen.inventory.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.io.IOException;

@RestController
@RequestMapping("/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private com.romen.inventory.service.FileStorageService fileStorageService;

    // ====================== IMAGE UPLOAD ======================

    @PostMapping("/catalog/{id}/image")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, String>> uploadCatalogImage(
            @PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestParam("image") org.springframework.web.multipart.MultipartFile image) {
        try {
            String imagePath = fileStorageService.storeFile(image, "catalog");
            String imageUrl = "/bookings/images/" + imagePath;
            bookingService.updateCatalogImage(id, imageUrl);
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to upload image"));
        }
    }

    @GetMapping("/images/{subDir}/{filename}")
    public ResponseEntity<byte[]> serveImage(@PathVariable String subDir, @PathVariable String filename) {
        try {
            byte[] imageBytes = fileStorageService.getFile(subDir + "/" + filename);
            String contentType = "image/jpeg";
            if (filename.endsWith(".png"))
                contentType = "image/png";
            else if (filename.endsWith(".gif"))
                contentType = "image/gif";
            return ResponseEntity.ok()
                    .header("Content-Type", contentType)
                    .header("Cache-Control", "max-age=86400")
                    .body(imageBytes);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ====================== CATALOG ======================

    @GetMapping("/catalog")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<CatalogResponse>> getCatalog() {
        return ResponseEntity.ok(bookingService.getAllCatalogItems());
    }

    @GetMapping("/catalog/category/{category}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<CatalogResponse>> getCatalogByCategory(@PathVariable String category) {
        return ResponseEntity.ok(bookingService.getCatalogByCategory(category));
    }

    @PostMapping("/catalog")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<CatalogResponse> createCatalogItem(@RequestBody CatalogRequest request) {
        return ResponseEntity.ok(bookingService.createCatalogItem(request));
    }

    @PutMapping("/catalog/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<CatalogResponse> updateCatalogItem(@PathVariable Long id,
            @RequestBody CatalogRequest request) {
        return ResponseEntity.ok(bookingService.updateCatalogItem(id, request));
    }

    @DeleteMapping("/catalog/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteCatalogItem(@PathVariable Long id) {
        bookingService.deleteCatalogItem(id);
        return ResponseEntity.ok().build();
    }

    // ====================== BOOKINGS ======================

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<BookingResponse>> getActiveBookings() {
        return ResponseEntity.ok(bookingService.getActiveBookings());
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<BookingResponse>> getBookingsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(bookingService.getBookingsByStatus(status));
    }

    @GetMapping("/upcoming")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<BookingResponse>> getUpcomingDeliveries() {
        return ResponseEntity.ok(bookingService.getUpcomingDeliveries());
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(bookingService.getBookingStats());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<BookingResponse> getBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<BookingResponse> createBooking(@RequestBody BookingRequest request, Authentication auth) {
        return ResponseEntity.ok(bookingService.createBooking(request, auth.getName()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<BookingResponse> updateBooking(@PathVariable Long id, @RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.updateBooking(id, request));
    }
}
