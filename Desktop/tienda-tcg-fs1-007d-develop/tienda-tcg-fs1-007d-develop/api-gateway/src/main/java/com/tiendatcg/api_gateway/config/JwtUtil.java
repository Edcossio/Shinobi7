package com.tiendatcg.api_gateway.config;

import java.security.Key;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretKey;

    @PostConstruct
    public void validarSecretKey() {
        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalStateException(
                    "[GATEWAY] CRÍTICO: jwt.secret no está configurado. " +
                            "El Gateway no puede arrancar sin una clave JWT segura.");
        }
        log.info("[GATEWAY] Secret JWT cargado correctamente desde configuración.");
    }

    public boolean validarToken(String token) {
        try {
            extraerTodosLosClaims(token);
            return true;
        } catch (Exception e) {
            log.warn("[GATEWAY] Token inválido: {}", e.getMessage());
            return false;
        }
    }

    public String extraerRol(String token) {
        return extraerClaim(token, claims -> claims.get("rol", String.class));
    }

    public String extraerIdUsuario(String token) {
        Object id = extraerClaim(token, claims -> claims.get("idUsuarioRef"));
        return id != null ? id.toString() : null;
    }

    public <T> T extraerClaim(String token, Function<Claims, T> claimsResolver) {
        return claimsResolver.apply(extraerTodosLosClaims(token));
    }

    private Claims extraerTodosLosClaims(String token) {
        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}