package com.sliit.nexus.controller;

import com.sliit.nexus.dto.request.RegisterRequest;
import com.sliit.nexus.entity.User;
import com.sliit.nexus.enums.AuthProvider;
import com.sliit.nexus.enums.Role;
import com.sliit.nexus.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository userRepository;

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    @GetMapping("/oauth-status")
    public Map<String, Boolean> getOAuthStatus() {
        boolean googleConfigured = googleClientId != null
                && !googleClientId.isBlank()
                && !googleClientId.startsWith("local-dev-");

        return Map.of("googleConfigured", googleConfigured);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "An account with this email already exists."));
        }

        if (request.getRole() == Role.USER && !normalizedEmail.endsWith("@my.sliit.lk")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Student email must use the @my.sliit.lk format."));
        }

        if ((request.getRole() == Role.ADMIN || request.getRole() == Role.TECHNICIAN) && !normalizedEmail.endsWith("@gmail.com")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Admin and technician email must use the @gmail.com format."));
        }

        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "A password is required for every account."));
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(normalizedEmail)
                .role(request.getRole())
                .provider(AuthProvider.LOCAL)
                .password(request.getPassword())
                .build();

        User savedUser = userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", savedUser.getId(),
                "name", savedUser.getName(),
                "email", savedUser.getEmail(),
                "role", savedUser.getRole().name(),
                "provider", savedUser.getProvider().name()
        ));
    }
}
