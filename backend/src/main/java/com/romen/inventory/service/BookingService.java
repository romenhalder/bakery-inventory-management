package com.romen.inventory.service;

import com.romen.inventory.dto.*;
import com.romen.inventory.entity.*;
import com.romen.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final CakeBookingRepository bookingRepository;
    private final CakeCatalogRepository catalogRepository;
    private final UserRepository userRepository;

    // ====================== CATALOG ======================

    public List<CatalogResponse> getAllCatalogItems() {
        return catalogRepository.findByIsActiveTrueOrderByNameAsc().stream()
                .map(this::mapToCatalogResponse)
                .collect(Collectors.toList());
    }

    public List<CatalogResponse> getCatalogByCategory(String category) {
        CakeCatalog.CakeCategory cat = CakeCatalog.CakeCategory.valueOf(category.toUpperCase());
        return catalogRepository.findByCategoryAndIsActiveTrue(cat).stream()
                .map(this::mapToCatalogResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CatalogResponse createCatalogItem(CatalogRequest request) {
        CakeCatalog catalog = CakeCatalog.builder()
                .name(request.getName())
                .description(request.getDescription())
                .category(CakeCatalog.CakeCategory.valueOf(request.getCategory().toUpperCase()))
                .basePrice(request.getBasePrice())
                .pricePerKg(request.getPricePerKg())
                .imageUrl(request.getImageUrl())
                .flavors(request.getFlavors())
                .availableWeights(request.getAvailableWeights())
                .availableTiers(request.getAvailableTiers())
                .minOrderHours(request.getMinOrderHours() != null ? request.getMinOrderHours() : 24)
                .build();
        return mapToCatalogResponse(catalogRepository.save(catalog));
    }

    @Transactional
    public CatalogResponse updateCatalogItem(Long id, CatalogRequest request) {
        CakeCatalog catalog = catalogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catalog item not found"));
        if (request.getName() != null)
            catalog.setName(request.getName());
        if (request.getDescription() != null)
            catalog.setDescription(request.getDescription());
        if (request.getCategory() != null)
            catalog.setCategory(CakeCatalog.CakeCategory.valueOf(request.getCategory().toUpperCase()));
        if (request.getBasePrice() != null)
            catalog.setBasePrice(request.getBasePrice());
        if (request.getPricePerKg() != null)
            catalog.setPricePerKg(request.getPricePerKg());
        if (request.getImageUrl() != null)
            catalog.setImageUrl(request.getImageUrl());
        if (request.getFlavors() != null)
            catalog.setFlavors(request.getFlavors());
        if (request.getAvailableWeights() != null)
            catalog.setAvailableWeights(request.getAvailableWeights());
        if (request.getAvailableTiers() != null)
            catalog.setAvailableTiers(request.getAvailableTiers());
        if (request.getMinOrderHours() != null)
            catalog.setMinOrderHours(request.getMinOrderHours());
        return mapToCatalogResponse(catalogRepository.save(catalog));
    }

    @Transactional
    public void deleteCatalogItem(Long id) {
        CakeCatalog catalog = catalogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catalog item not found"));
        catalog.setIsActive(false);
        catalogRepository.save(catalog);
    }

    @Transactional
    public void updateCatalogImage(Long id, String imageUrl) {
        CakeCatalog catalog = catalogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catalog item not found"));
        catalog.setImageUrl(imageUrl);
        catalogRepository.save(catalog);
    }

    // ====================== BOOKINGS ======================

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllOrderByCreatedAtDesc().stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getActiveBookings() {
        return bookingRepository.findActiveBookings().stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getBookingsByStatus(String status) {
        CakeBooking.BookingStatus bs = CakeBooking.BookingStatus.valueOf(status.toUpperCase());
        return bookingRepository.findByStatusOrderByDeliveryDateAsc(bs).stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getUpcomingDeliveries() {
        LocalDate today = LocalDate.now();
        LocalDate threeDaysLater = today.plusDays(3);
        return bookingRepository.findUpcomingDeliveries(today, threeDaysLater).stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    public BookingResponse getBookingById(Long id) {
        CakeBooking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return mapToBookingResponse(booking);
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CakeBooking booking = CakeBooking.builder()
                .customerName(request.getCustomerName())
                .customerMobile(request.getCustomerMobile())
                .customerEmail(request.getCustomerEmail())
                .eventType(CakeBooking.EventType.valueOf(request.getEventType().toUpperCase()))
                .cakeDescription(request.getCakeDescription())
                .flavor(request.getFlavor())
                .weightKg(request.getWeightKg() != null ? request.getWeightKg() : new BigDecimal("1.0"))
                .tierCount(request.getTierCount() != null ? request.getTierCount() : 1)
                .messageOnCake(request.getMessageOnCake())
                .deliveryDate(request.getDeliveryDate() != null ? LocalDate.parse(request.getDeliveryDate()) : null)
                .deliveryTime(request.getDeliveryTime() != null ? LocalTime.parse(request.getDeliveryTime()) : null)
                .deliveryAddress(request.getDeliveryAddress())
                .designNotes(request.getDesignNotes())
                .estimatedPrice(request.getEstimatedPrice())
                .depositPercentage(request.getDepositPercentage() != null ? request.getDepositPercentage() : 50)
                .isCustom(request.getIsCustom() != null ? request.getIsCustom() : false)
                .notes(request.getNotes())
                .createdBy(user)
                .build();

        // Calculate deposit
        if (request.getEstimatedPrice() != null && request.getDepositPercentage() != null) {
            BigDecimal deposit = request.getEstimatedPrice()
                    .multiply(new BigDecimal(request.getDepositPercentage()))
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            booking.setDepositAmount(deposit);
            booking.setRemainingAmount(request.getEstimatedPrice().subtract(deposit));
        }

        if (request.getDepositPaid() != null)
            booking.setDepositPaid(request.getDepositPaid());
        if (request.getPaymentMethod() != null) {
            booking.setPaymentMethod(SalesOrder.PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()));
        }

        // Link catalog item
        if (request.getCatalogItemId() != null) {
            CakeCatalog catalog = catalogRepository.findById(request.getCatalogItemId()).orElse(null);
            booking.setCatalogItem(catalog);
        }

        return mapToBookingResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse updateBooking(Long id, BookingRequest request) {
        CakeBooking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (request.getCustomerName() != null)
            booking.setCustomerName(request.getCustomerName());
        if (request.getCustomerMobile() != null)
            booking.setCustomerMobile(request.getCustomerMobile());
        if (request.getCustomerEmail() != null)
            booking.setCustomerEmail(request.getCustomerEmail());
        if (request.getEventType() != null)
            booking.setEventType(CakeBooking.EventType.valueOf(request.getEventType().toUpperCase()));
        if (request.getCakeDescription() != null)
            booking.setCakeDescription(request.getCakeDescription());
        if (request.getFlavor() != null)
            booking.setFlavor(request.getFlavor());
        if (request.getWeightKg() != null)
            booking.setWeightKg(request.getWeightKg());
        if (request.getTierCount() != null)
            booking.setTierCount(request.getTierCount());
        if (request.getMessageOnCake() != null)
            booking.setMessageOnCake(request.getMessageOnCake());
        if (request.getDeliveryDate() != null)
            booking.setDeliveryDate(LocalDate.parse(request.getDeliveryDate()));
        if (request.getDeliveryTime() != null)
            booking.setDeliveryTime(LocalTime.parse(request.getDeliveryTime()));
        if (request.getDeliveryAddress() != null)
            booking.setDeliveryAddress(request.getDeliveryAddress());
        if (request.getDesignNotes() != null)
            booking.setDesignNotes(request.getDesignNotes());
        if (request.getNotes() != null)
            booking.setNotes(request.getNotes());

        if (request.getEstimatedPrice() != null) {
            booking.setEstimatedPrice(request.getEstimatedPrice());
            int pct = request.getDepositPercentage() != null ? request.getDepositPercentage()
                    : booking.getDepositPercentage();
            BigDecimal deposit = request.getEstimatedPrice()
                    .multiply(new BigDecimal(pct))
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            booking.setDepositAmount(deposit);
            booking.setRemainingAmount(request.getEstimatedPrice().subtract(deposit));
        }
        if (request.getDepositPercentage() != null)
            booking.setDepositPercentage(request.getDepositPercentage());
        if (request.getDepositPaid() != null)
            booking.setDepositPaid(request.getDepositPaid());
        if (request.getPaymentMethod() != null)
            booking.setPaymentMethod(SalesOrder.PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()));

        if (request.getStatus() != null) {
            CakeBooking.BookingStatus newStatus = CakeBooking.BookingStatus.valueOf(request.getStatus().toUpperCase());
            booking.setStatus(newStatus);
            if (newStatus == CakeBooking.BookingStatus.DELIVERED) {
                booking.setFinalAmount(booking.getEstimatedPrice());
                booking.setFullyPaid(true);
                booking.setRemainingAmount(BigDecimal.ZERO);
            }
        }

        return mapToBookingResponse(bookingRepository.save(booking));
    }

    public java.util.Map<String, Object> getBookingStats() {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("pending", bookingRepository.countByStatus(CakeBooking.BookingStatus.PENDING));
        stats.put("confirmed", bookingRepository.countByStatus(CakeBooking.BookingStatus.CONFIRMED));
        stats.put("inProgress", bookingRepository.countByStatus(CakeBooking.BookingStatus.IN_PROGRESS));
        stats.put("ready", bookingRepository.countByStatus(CakeBooking.BookingStatus.READY));
        stats.put("delivered", bookingRepository.countByStatus(CakeBooking.BookingStatus.DELIVERED));
        stats.put("cancelled", bookingRepository.countByStatus(CakeBooking.BookingStatus.CANCELLED));
        stats.put("catalogCount", catalogRepository.countByIsActiveTrue());

        // Today's deliveries
        List<CakeBooking> todayDeliveries = bookingRepository.findUpcomingForDate(LocalDate.now());
        stats.put("todayDeliveries", todayDeliveries.size());

        return stats;
    }

    // ====================== MAPPERS ======================

    private CatalogResponse mapToCatalogResponse(CakeCatalog c) {
        return CatalogResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .description(c.getDescription())
                .category(c.getCategory() != null ? c.getCategory().name() : null)
                .basePrice(c.getBasePrice())
                .pricePerKg(c.getPricePerKg())
                .imageUrl(c.getImageUrl())
                .flavors(c.getFlavors())
                .availableWeights(c.getAvailableWeights())
                .availableTiers(c.getAvailableTiers())
                .minOrderHours(c.getMinOrderHours())
                .isActive(c.getIsActive())
                .createdAt(c.getCreatedAt())
                .build();
    }

    private BookingResponse mapToBookingResponse(CakeBooking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .bookingNumber(b.getBookingNumber())
                .customerName(b.getCustomerName())
                .customerMobile(b.getCustomerMobile())
                .customerEmail(b.getCustomerEmail())
                .eventType(b.getEventType() != null ? b.getEventType().name() : null)
                .cakeDescription(b.getCakeDescription())
                .flavor(b.getFlavor())
                .weightKg(b.getWeightKg())
                .tierCount(b.getTierCount())
                .messageOnCake(b.getMessageOnCake())
                .deliveryDate(b.getDeliveryDate())
                .deliveryTime(b.getDeliveryTime())
                .deliveryAddress(b.getDeliveryAddress())
                .designNotes(b.getDesignNotes())
                .estimatedPrice(b.getEstimatedPrice())
                .depositPercentage(b.getDepositPercentage())
                .depositAmount(b.getDepositAmount())
                .depositPaid(b.getDepositPaid())
                .remainingAmount(b.getRemainingAmount())
                .finalAmount(b.getFinalAmount())
                .fullyPaid(b.getFullyPaid())
                .paymentMethod(b.getPaymentMethod() != null ? b.getPaymentMethod().name() : null)
                .status(b.getStatus() != null ? b.getStatus().name() : null)
                .catalogItemId(b.getCatalogItem() != null ? b.getCatalogItem().getId() : null)
                .catalogItemName(b.getCatalogItem() != null ? b.getCatalogItem().getName() : null)
                .isCustom(b.getIsCustom())
                .createdByName(b.getCreatedBy() != null ? b.getCreatedBy().getFullName() : null)
                .notes(b.getNotes())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }
}
