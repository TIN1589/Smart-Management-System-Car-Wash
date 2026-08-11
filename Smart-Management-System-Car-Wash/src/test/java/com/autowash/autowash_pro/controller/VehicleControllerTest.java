package com.autowash.autowash_pro.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import com.autowash.autowash_pro.dto.request.vehicle.VehicleRequest;
import com.autowash.autowash_pro.dto.response.vehicle.VehicleResponse;
import com.autowash.autowash_pro.service.VehicleService;

@ExtendWith(MockitoExtension.class)
class VehicleControllerTest {

    @Mock
    private VehicleService vehicleService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private VehicleController vehicleController;

    @Test
    void getMyVehicles_returnsOkWithBody() {
        when(authentication.getName()).thenReturn("0123456789");

        VehicleResponse resp = VehicleResponse.builder()
            .licensePlate("ABC123")
            .vehicleType("Car")
            .brand("B")
            .color("C")
            .primary(true)
            .build();

        when(vehicleService.getMyVehicles("0123456789")).thenReturn(List.of(resp));

        ResponseEntity<List<VehicleResponse>> result = vehicleController.getMyVehicles(authentication);

        assertEquals(200, result.getStatusCode().value());
        assertEquals(1, result.getBody().size());
    }

    @Test
    void createVehicle_returnsCreated() {
        when(authentication.getName()).thenReturn("0123456789");

        var req = new VehicleRequest("ABC123", "Car", "B", "C", true);

        VehicleResponse resp = VehicleResponse.builder()
            .licensePlate("ABC123")
            .primary(true)
            .build();

        when(vehicleService.createVehicle("0123456789", req)).thenReturn(resp);

        ResponseEntity<VehicleResponse> result = vehicleController.createVehicle(authentication, req);

        assertEquals(201, result.getStatusCode().value());
        assertEquals("ABC123", result.getBody().getLicensePlate());
    }

    @Test
    void deleteVehicle_returnsNoContent() {
        when(authentication.getName()).thenReturn("0123456789");

        java.util.UUID vehicleId = java.util.UUID.randomUUID();

        ResponseEntity<Void> result = vehicleController.deleteVehicle(authentication, vehicleId);

        assertEquals(204, result.getStatusCode().value());
    }
}
