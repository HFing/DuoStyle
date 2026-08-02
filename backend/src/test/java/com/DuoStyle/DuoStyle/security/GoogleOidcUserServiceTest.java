package com.DuoStyle.DuoStyle.security;

import com.DuoStyle.DuoStyle.entity.Role;
import com.DuoStyle.DuoStyle.entity.User;
import com.DuoStyle.DuoStyle.repository.RoleRepository;
import com.DuoStyle.DuoStyle.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GoogleOidcUserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private OidcUser googleUser;

    private GoogleOidcUserService service;

    @BeforeEach
    void setUp() {
        service = new GoogleOidcUserService(userRepository, roleRepository, passwordEncoder);
    }

    @Test
    void rejectsGoogleIdentityWithoutVerifiedEmail() {
        when(googleUser.getEmail()).thenReturn("user@gmail.com");
        when(googleUser.getEmailVerified()).thenReturn(false);

        assertThrows(OAuth2AuthenticationException.class, () -> service.provision(googleUser));
        verify(userRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void reusesExistingAccountByNormalizedEmailAndUsesLocalRoles() {
        Role role = Role.builder().name("ROLE_ADMIN").build();
        User existing = User.builder()
                .email("user@gmail.com")
                .password("encoded")
                .roles(Set.of(role))
                .enabled(true)
                .build();
        when(googleUser.getEmail()).thenReturn(" User@Gmail.com ");
        when(googleUser.getEmailVerified()).thenReturn(true);
        when(userRepository.findByEmailIgnoreCase("user@gmail.com")).thenReturn(java.util.Optional.of(existing));

        OidcUser result = service.provision(googleUser);

        assertEquals("user@gmail.com", result.getName());
        assertTrue(result.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN")));
        verify(userRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void createsEnabledUserWithDefaultRoleForNewVerifiedEmail() {
        Role role = Role.builder().name("ROLE_USER").build();
        when(googleUser.getEmail()).thenReturn("new@gmail.com");
        when(googleUser.getEmailVerified()).thenReturn(true);
        when(googleUser.getFullName()).thenReturn("New User");
        when(userRepository.findByEmailIgnoreCase("new@gmail.com")).thenReturn(java.util.Optional.empty());
        when(roleRepository.findByName("ROLE_USER")).thenReturn(java.util.Optional.of(role));
        when(passwordEncoder.encode(org.mockito.ArgumentMatchers.anyString())).thenReturn("encoded-random-password");
        when(userRepository.save(org.mockito.ArgumentMatchers.any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        OidcUser result = service.provision(googleUser);

        ArgumentCaptor<User> savedUser = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(savedUser.capture());
        assertEquals("new@gmail.com", savedUser.getValue().getEmail());
        assertEquals("New User", savedUser.getValue().getFullName());
        assertEquals("encoded-random-password", savedUser.getValue().getPassword());
        assertTrue(savedUser.getValue().isEnabled());
        assertEquals(Set.of(role), savedUser.getValue().getRoles());
        assertEquals("new@gmail.com", result.getName());
        assertTrue(result.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_USER")));
    }
}
