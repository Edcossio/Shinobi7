package com.tiendatcg.ms_auth.security;

import com.tiendatcg.ms_auth.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    private static final List<String> RUTAS_PUBLICAS = List.of(
            "/api/auth/login",
            "/api/auth/registrar",
            "/api/auth/validar-token",
            "/api/auth/extraer-claims");

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        if (RUTAS_PUBLICAS.stream().anyMatch(path::startsWith)) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            if (!jwtService.validarToken(token)) {
                escribirError(response, HttpStatus.UNAUTHORIZED,
                        "Token inválido o expirado");
                return;
            }

            String rol = jwtService.extraerRol(token);
            String idStr = jwtService.extraerIdUsuario(token);

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    idStr,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + rol)));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            filterChain.doFilter(request, response);

        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            log.warn("[MS-AUTH] Token expirado en path {}: {}", path, e.getMessage());
            escribirError(response, HttpStatus.UNAUTHORIZED, "El token ha expirado");

        } catch (io.jsonwebtoken.MalformedJwtException | io.jsonwebtoken.security.SignatureException e) {
            log.warn("[MS-AUTH] Token malformado en path {}: {}", path, e.getMessage());
            escribirError(response, HttpStatus.UNAUTHORIZED,
                    "Token malformado o firma inválida");

        } catch (Exception e) {
            log.error("[MS-AUTH] Error inesperado en path {}: {}", path, e.getMessage(), e);
            escribirError(response, HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error interno al procesar la autenticación");
        }
    }

    private void escribirError(HttpServletResponse response,
            HttpStatus status,
            String mensaje) throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"" + mensaje + "\"}");
    }
}