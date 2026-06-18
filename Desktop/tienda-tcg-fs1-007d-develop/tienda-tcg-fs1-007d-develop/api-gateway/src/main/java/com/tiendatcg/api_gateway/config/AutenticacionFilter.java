package com.tiendatcg.api_gateway.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AutenticacionFilter implements GlobalFilter {

    private final JwtUtil jwtUtil;

    private static final List<String> RUTAS_PUBLICAS = List.of(
            "/api/auth/login",
            "/api/auth/registrar",
            "/api/auth/validar-token",
            "/api/auth/extraer-claims");

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        boolean esPublica = RUTAS_PUBLICAS.stream().anyMatch(path::startsWith);
        if (esPublica) {
            log.debug("[GATEWAY] Ruta pública, sin validación JWT: {}", path);
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest()
                .getHeaders()
                .getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || authHeader.isBlank()) {
            log.warn("[GATEWAY] Petición sin header Authorization en path: {}", path);
            return denegarAcceso(exchange);
        }

        if (!authHeader.startsWith("Bearer ")) {
            log.warn("[GATEWAY] Header Authorization mal formado en path: {}", path);
            return denegarAcceso(exchange);
        }

        String token = authHeader.substring(7);

        try {
            if (!jwtUtil.validarToken(token)) {
                log.warn("[GATEWAY] Token inválido o expirado en path: {}", path);
                return denegarAcceso(exchange);
            }

            String rol = jwtUtil.extraerRol(token);
            String idUsuario = jwtUtil.extraerIdUsuario(token);

            log.debug("[GATEWAY] Token válido. Usuario ID: {} Rol: {} Path: {}",
                    idUsuario, rol, path);

            var requestBuilder = exchange.getRequest().mutate()
                    .header("X-User-Rol", rol);

            if (idUsuario != null) {
                requestBuilder.header("X-User-Id", idUsuario);
            }

            var modifiedExchange = exchange.mutate()
                    .request(requestBuilder.build())
                    .build();

            return chain.filter(modifiedExchange);

        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            log.warn("[GATEWAY] Token expirado en path {}: {}", path, e.getMessage());
            return denegarAcceso(exchange);

        } catch (io.jsonwebtoken.MalformedJwtException | io.jsonwebtoken.security.SignatureException e) {
            log.warn("[GATEWAY] Token malformado o firma inválida en path {}: {}",
                    path, e.getMessage());
            return denegarAcceso(exchange);

        } catch (Exception e) {
            log.error("[GATEWAY] Error inesperado procesando token en path {}: {}",
                    path, e.getMessage(), e);
            return denegarAcceso(exchange);
        }
    }

    private Mono<Void> denegarAcceso(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }
}