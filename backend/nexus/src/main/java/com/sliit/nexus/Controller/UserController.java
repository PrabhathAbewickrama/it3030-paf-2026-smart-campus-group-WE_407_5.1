package com.sliit.nexus.controller;

import com.sliit.nexus.dto.response.UserSummaryResponse;
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

    @GetMapping("/technicians")
    public List<UserSummaryResponse> getTechnicians() {
        return userRepository.findAllByRole(Role.TECHNICIAN).stream()
                .map(UserSummaryResponse::fromEntity)
                .toList();
    }
}
