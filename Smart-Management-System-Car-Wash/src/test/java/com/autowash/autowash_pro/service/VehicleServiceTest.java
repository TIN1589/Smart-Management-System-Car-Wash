package com.autowash.autowash_pro.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.autowash.autowash_pro.dto.response.vehicle.VehicleResponse;
import com.autowash.autowash_pro.entity.Customer;
import com.autowash.autowash_pro.entity.Vehicle;
import com.autowash.autowash_pro.exception.BusinessException;
import com.autowash.autowash_pro.repository.BookingRepository;
import com.autowash.autowash_pro.repository.CustomerRepository;
import com.autowash.autowash_pro.repository.VehicleRepository;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private VehicleService vehicleService;

    @Test
    void getMyVehicles_returnsMappedResponses() {
        String phone = "0123456789";
        UUID customerId = UUID.randomUUID();
        Customer customer = Customer.builder().customerId(customerId).phone(phone).build();

        Vehicle v = Vehicle.builder()
            .vehicleId(UUID.randomUUID())
            .customer(customer)
            .licensePlate("ABC123")
            .vehicleType("Car")
            .brand("Brand")
            .color("Blue")
            .isPrimary(true)
            .build();

        when(customerRepository.findByPhone(phone)).thenReturn(Optional.of(customer));
        when(vehicleRepository.findByCustomer_CustomerIdOrderByCreatedAtDesc(customerId))
            .thenReturn(List.of(v));

        List<VehicleResponse> responses = vehicleService.getMyVehicles(phone);

        assertEquals(1, responses.size());
        assertEquals("ABC123", responses.get(0).getLicensePlate());
    }

    @Test
    void createVehicle_whenLicenseExists_throwsBusinessException() {
        String phone = "0123456789";
        UUID customerId = UUID.randomUUID();
        Customer customer = Customer.builder().customerId(customerId).phone(phone).build();

        when(customerRepository.findByPhone(phone)).thenReturn(Optional.of(customer));
        when(vehicleRepository.existsByLicensePlate("ABC123")).thenReturn(true);

        var req = new com.autowash.autowash_pro.dto.request.vehicle.VehicleRequest("ABC123", "Car", "B", "C", false);

        assertThrows(BusinessException.class, () -> vehicleService.createVehicle(phone, req));
    }

    @Test
    void deleteVehicle_whenHasBookings_throwsBusinessException() {
        String phone = "0123456789";
        UUID customerId = UUID.randomUUID();
        UUID vehicleId = UUID.randomUUID();

        Customer customer = Customer.builder().customerId(customerId).phone(phone).build();
        Vehicle vehicle = Vehicle.builder().vehicleId(vehicleId).customer(customer).build();

        when(customerRepository.findByPhone(phone)).thenReturn(Optional.of(customer));
        when(vehicleRepository.findByVehicleIdAndCustomer_CustomerId(vehicleId, customerId))
            .thenReturn(Optional.of(vehicle));
        when(bookingRepository.existsByVehicle_VehicleId(vehicleId)).thenReturn(true);

        assertThrows(BusinessException.class, () -> vehicleService.deleteVehicle(phone, vehicleId));
    }
}
