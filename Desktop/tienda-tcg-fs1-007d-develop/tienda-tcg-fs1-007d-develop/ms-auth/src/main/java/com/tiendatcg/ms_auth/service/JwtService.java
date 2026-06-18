package com.tiendatcg.ms_auth.service;

import java.security.Key;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    // Falla en arranque si el secret no esta configurado correctamente
    @PostConstruct
    public void validarSecretKey() {
        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalStateException(
                    "[MS-AUTH] CRÍTICO: jwt.secret no está configurado. " +
                            "El servicio no puede arrancar sin una clave JWT segura.");
        }
        if (secretKey.length() < 32) {
            throw new IllegalStateException(
                    "[MS-AUTH] CRÍTICO: jwt.secret es demasiado corta. " +
                            "Debe tener al menos 32 caracteres en Base64.");
        }
        log.info("[MS-AUTH] Secret JWT cargado correctamente desde configuración.");
    }

    //Generacion

    public String generarToken(Map<String, Object> extraClaims, String username) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24))
                .signWith(getSignInKey())
                .compact();
    }

    //Validacion
    public boolean validarToken(String token) {
        try {
            extraerTodosLosClaims(token);
            return !isTokenExpired(token);
        } catch (Exception e) {
            log.warn("[JWT] Token inválido: {}", e.getMessage());
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        return extraerExpiration(token).before(new Date());
    }

    //Extraccion claims 
    public String extraerUsername(String token) {
        return extraerClaim(token, Claims::getSubject);
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

    private Date extraerExpiration(String token) {
        return extraerClaim(token, Claims::getExpiration);
    }

    //Infraestructura 

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