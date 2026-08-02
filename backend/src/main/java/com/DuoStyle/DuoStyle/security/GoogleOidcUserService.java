package com.DuoStyle.DuoStyle.security;

import com.DuoStyle.DuoStyle.entity.Role;
import com.DuoStyle.DuoStyle.entity.User;
import com.DuoStyle.DuoStyle.repository.RoleRepository;
import com.DuoStyle.DuoStyle.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoogleOidcUserService extends OidcUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        return provision(super.loadUser(userRequest));
    }

    @Transactional
    public OidcUser provision(OidcUser googleUser) {
        String email = googleUser.getEmail();
        if (!Boolean.TRUE.equals(googleUser.getEmailVerified()) || email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("invalid_google_email"),
                    "Google did not provide a verified email address"
            );
        }

        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        User localUser = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseGet(() -> createUser(googleUser, normalizedEmail));

        Set<GrantedAuthority> authorities = localUser.getRoles().stream()
                .map(Role::getName)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toSet());

        return new LocalOidcUser(googleUser, normalizedEmail, authorities);
    }

    private User createUser(OidcUser googleUser, String email) {
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_USER").build()));
        String fullName = googleUser.getFullName();
        if (fullName == null || fullName.isBlank()) {
            fullName = email.substring(0, email.indexOf('@'));
        }

        return userRepository.save(User.builder()
                .email(email)
                .fullName(fullName)
                .password(passwordEncoder.encode("GOOGLE_OAUTH_" + UUID.randomUUID()))
                .roles(Set.of(userRole))
                .enabled(true)
                .build());
    }

    private record LocalOidcUser(
            OidcUser delegate,
            String name,
            Collection<? extends GrantedAuthority> authorities
    ) implements OidcUser {
        @Override public Map<String, Object> getClaims() { return delegate.getClaims(); }
        @Override public OidcUserInfo getUserInfo() { return delegate.getUserInfo(); }
        @Override public OidcIdToken getIdToken() { return delegate.getIdToken(); }
        @Override public Map<String, Object> getAttributes() { return delegate.getAttributes(); }
        @Override public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
        @Override public String getName() { return name; }
    }
}
