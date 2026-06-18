package com.tiendatcg.ms_auth.config;

import com.tiendatcg.ms_auth.repository.AuthRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class UserDetailsServiceConfig {

    private final AuthRepository authRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> authRepository.findByUsername(username)
                .map(auth -> new User(
                        auth.getUsername(),
                        auth.getPassword(),
                        List.of(new SimpleGrantedAuthority("ROLE_" + auth.getRol()))
                ))
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Usuario no encontrado: " + username));
    }
}