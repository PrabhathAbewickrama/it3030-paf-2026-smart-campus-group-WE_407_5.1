package com.sliit.nexus.controller;

import com.sliit.nexus.dto.response.UserSummaryResponse;
import com.sliit.nexus.dto.response.UserStatsResponse;
import com.sliit.nexus.enums.Role;
import com.sliit.nexus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository userRepository;

    @GetMapping
    public List<UserSummaryResponse> getUsers() {
        return userRepository.findAll().stream()
                .map(UserSummaryResponse::fromEntity)
                .toList();
    }

    @GetMapping("/technicians")
    public List<UserSummaryResponse> getTechnicians() {
        return userRepository.findAllByRole(Role.TECHNICIAN).stream()
                .map(UserSummaryResponse::fromEntity)
                .toList();
    }

    @GetMapping("/summary")
    public UserStatsResponse getUserSummary() {
        return UserStatsResponse.builder()
                .totalUsers(userRepository.count())
                .admins(userRepository.countByRole(Role.ADMIN))
                .managers(userRepository.countByRole(Role.MANAGER))
                .technicians(userRepository.countByRole(Role.TECHNICIAN))
                .students(userRepository.countByRole(Role.USER))
                .build();
    }
}
