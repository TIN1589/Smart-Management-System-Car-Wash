package com.autowash.autowash_pro.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.autowash.autowash_pro.config.JwtUtil;
import com.autowash.autowash_pro.dto.request.auth.LoginRequest;
import com.autowash.autowash_pro.dto.request.auth.RefreshTokenRequest;
import com.autowash.autowash_pro.dto.request.auth.RegisterRequest;
import com.autowash.autowash_pro.dto.response.auth.AuthResponse;
import com.autowash.autowash_pro.entity.Customer;
import com.autowash.autowash_pro.exception.BusinessException;
import com.autowash.autowash_pro.exception.ResourceNotFoundException;
import com.autowash.autowash_pro.repository.CustomerRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String phone = request.getPhone().trim();

        String email = request.getEmail() == null || request.getEmail().isBlank()
                ? null
                : request.getEmail().trim().toLowerCase(java.util.Locale.ROOT);

        if (customerRepository.existsByPhone(phone)) {
            throw new BusinessException("Số điện thoại đã được đăng ký");
        }

        if (email != null && customerRepository.existsByEmail(email)) {
            throw new BusinessException("Email đã được sử dụng");
        }

        Customer customer = Customer.builder()
                .fullName(request.getFullName().trim())
                .phone(phone)
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        Customer savedCustomer = customerRepository.save(customer);
        return buildAuthResponse(savedCustomer);
    }

    public AuthResponse login(LoginRequest request) {
        String identifier = request.getEmailOrPhone().trim();

        if (identifier.contains("@")) {
            identifier = identifier.toLowerCase(java.util.Locale.ROOT);
        }

        Customer customer = findCustomerByEmailOrPhone(identifier)
                .orElseThrow(() -> new BusinessException(
                        "Email hoặc số điện thoại hoặc mật khẩu không đúng"));

        if (!customer.isActive()) {
            throw new BusinessException("Tài khoản đã bị khóa");
        }

        if (!passwordEncoder.matches(request.getPassword(), customer.getPassword())) {
            throw new BusinessException(
                    "Email hoặc số điện thoại hoặc mật khẩu không đúng");
        }

        return buildAuthResponse(customer);
    }

    private Optional<Customer> findCustomerByEmailOrPhone(String identifier) {
        if (isEmail(identifier)) {
            return customerRepository.findByEmail(identifier);
        }
        return customerRepository.findByPhone(identifier);
    }

    private boolean isEmail(String value) {
        return value != null && value.contains("@");
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        if (!jwtUtil.isTokenValid(request.getRefreshToken())) {
            throw new BusinessException("Refresh token không hợp lệ");
        }

        String phone = jwtUtil.extractPhone(request.getRefreshToken());
        Customer customer = customerRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));

        return buildAuthResponse(customer);
    }

    private AuthResponse buildAuthResponse(Customer customer) {
        String role = customer.isAdmin() ? "ADMIN" : "CUSTOMER";

        return AuthResponse.builder()
                .id(customer.getCustomerId())
                .accessToken(jwtUtil.generateAccessToken(customer.getPhone(), role))
                .refreshToken(jwtUtil.generateRefreshToken(customer.getPhone()))
                .tokenType("Bearer")
                .role(role)
                .tier(customer.getTier())
                .fullName(customer.getFullName())
                .phone(customer.getPhone())
                .build();
    }
}