package com.example.smartcampus.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class HeaderAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String userIdHeader = request.getHeader("X-User-Id");
        String usernameHeader = request.getHeader("X-User-Name");
        String roleHeader = request.getHeader("X-User-Role");

        if (userIdHeader != null && usernameHeader != null && roleHeader != null) {
            try {
                Long userId = Long.parseLong(userIdHeader);
                String normalizedRole = roleHeader.trim().toUpperCase();
                AuthenticatedUser authenticatedUser =
                        new AuthenticatedUser(userId, usernameHeader.trim(), normalizedRole.toLowerCase());

                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(
                                authenticatedUser,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + normalizedRole))
                        );

                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            } catch (NumberFormatException ignored) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
