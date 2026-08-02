package com.DuoStyle.DuoStyle.security;

import com.DuoStyle.DuoStyle.entity.Role;
import com.DuoStyle.DuoStyle.entity.User;
import com.DuoStyle.DuoStyle.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    private User user;

    @BeforeEach
    void setUp() {
        Role roleUser = Role.builder().id(1L).name("ROLE_CUSTOMER").build();
        Role roleAdmin = Role.builder().id(2L).name("ROLE_ADMIN").build();

        user = User.builder()
                .id(10L)
                .email("admin@duostyle.com")
                .password("encoded_pass")
                .enabled(true)
                .roles(Set.of(roleUser, roleAdmin))
                .build();
    }

    @Test
    @DisplayName("loadUserByUsername - Return UserDetails with correct roles and credentials")
    void testLoadUserByUsername_Success() {
        when(userRepository.findByEmail("admin@duostyle.com")).thenReturn(Optional.of(user));

        UserDetails userDetails = customUserDetailsService.loadUserByUsername("admin@duostyle.com");

        assertNotNull(userDetails);
        assertEquals("admin@duostyle.com", userDetails.getUsername());
        assertEquals("encoded_pass", userDetails.getPassword());
        assertTrue(userDetails.isEnabled());
        assertEquals(2, userDetails.getAuthorities().size());
    }

    @Test
    @DisplayName("loadUserByUsername - Throw UsernameNotFoundException when user not found")
    void testLoadUserByUsername_NotFound() {
        when(userRepository.findByEmail("notfound@duostyle.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () ->
                customUserDetailsService.loadUserByUsername("notfound@duostyle.com"));
    }
}
