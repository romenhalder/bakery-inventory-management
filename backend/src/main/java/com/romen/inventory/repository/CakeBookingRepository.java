package com.romen.inventory.repository;

import com.romen.inventory.entity.CakeBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CakeBookingRepository extends JpaRepository<CakeBooking, Long> {

    Optional<CakeBooking> findByBookingNumber(String bookingNumber);

    List<CakeBooking> findByStatusOrderByDeliveryDateAsc(CakeBooking.BookingStatus status);

    List<CakeBooking> findByDeliveryDateBetweenOrderByDeliveryDateAscDeliveryTimeAsc(LocalDate start, LocalDate end);

    @Query("SELECT b FROM CakeBooking b WHERE b.deliveryDate = :date AND b.status NOT IN ('DELIVERED', 'CANCELLED') ORDER BY b.deliveryTime ASC")
    List<CakeBooking> findUpcomingForDate(@Param("date") LocalDate date);

    @Query("SELECT b FROM CakeBooking b WHERE b.deliveryDate BETWEEN :start AND :end AND b.status NOT IN ('DELIVERED', 'CANCELLED') ORDER BY b.deliveryDate ASC, b.deliveryTime ASC")
    List<CakeBooking> findUpcomingDeliveries(@Param("start") LocalDate start, @Param("end") LocalDate end);

    List<CakeBooking> findByCustomerMobileOrderByCreatedAtDesc(String customerMobile);

    @Query("SELECT b FROM CakeBooking b ORDER BY b.createdAt DESC")
    List<CakeBooking> findAllOrderByCreatedAtDesc();

    long countByStatus(CakeBooking.BookingStatus status);

    @Query("SELECT b FROM CakeBooking b WHERE b.status NOT IN ('DELIVERED', 'CANCELLED') ORDER BY b.deliveryDate ASC")
    List<CakeBooking> findActiveBookings();
}
