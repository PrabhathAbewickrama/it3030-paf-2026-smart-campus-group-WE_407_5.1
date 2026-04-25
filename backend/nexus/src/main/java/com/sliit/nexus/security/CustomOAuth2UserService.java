package com.sliit.nexus.security;

import com.sliit.nexus.entity.User;
import com.sliit.nexus.enums.AuthProvider;
import com.sliit.nexus.enums.Role;
import com.sliit.nexus.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);
        return processOAuth2User(oAuth2User);
    }

    private OAuth2User processOAuth2User(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            user.setName(name);
            user.setAvatarUrl(picture);
        } else {
            Role hintedRole = resolveRoleHint(email);
            user = User.builder()
                    .email(email)
                    .name(name)
                    .avatarUrl(picture)
                    .provider(AuthProvider.GOOGLE)
                    .role(hintedRole)
                    .build();
        }
        userRepository.save(user);
        return oAuth2User;
    }

    private Role resolveRoleHint(String email) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes != null ? attributes.getRequest() : null;

        if (request == null || request.getCookies() == null) {
            return Role.USER;
        }

        for (Cookie cookie : request.getCookies()) {
            if (!"oauth_role".equals(cookie.getName())) {
                continue;
            }

            String roleValue = cookie.getValue();

            if ("ADMIN".equalsIgnoreCase(roleValue) && email != null && email.toLowerCase().endsWith("@gmail.com")) {
                return Role.ADMIN;
            }

            if ("TECHNICIAN".equalsIgnoreCase(roleValue) && email != null && email.toLowerCase().endsWith("@gmail.com")) {
                return Role.TECHNICIAN;
            }
        }

        return Role.USER;
    }
}
