package com.tiendatcg.api_gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRoutesConfig {

        @Bean
        public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
                return builder.routes()
                                // rutas
                                .route("auth-service", r -> r.path("/api/auth/**")
                                                .uri("lb://ms-auth"))
                                .route("pagos-service", r -> r.path("/api/pagos/**")
                                                .uri("lb://ms-pagos"))
                                .route("precios-service", r -> r.path("/api/precios/**")
                                                .uri("lb://ms-precios"))
                                .route("pedidos-service", r -> r.path("/api/pedidos/**")
                                                .uri("lb://ms-pedidos"))
                                .route("inventario-service", r -> r.path("/api/inventario/**")
                                                .uri("lb://Inventarios"))
                                .route("usuarios-service", r -> r.path("/api/usuarios/**")
                                                .uri("lb://ms-usuarios"))

                                .route("catalogo-service", r -> r.path("/api/catalogo/**")
                                                .uri("lb://ms-catalogo"))
                                .route("shopping-cart-service", r -> r.path("/api/carrito/**")
                                                .uri("lb://ms-shopping-cart"))
                                .route("envios-service", r -> r.path("/api/envios/**")
                                                .uri("lb://ms-envios"))
                                .route("notificaciones-service", r -> r.path("/api/notificaciones/**")
                                                .uri("lb://ms-notificaciones"))
                                .route("resenas-service", r -> r.path("/api/resenas/**")
                                                .uri("lb://ms-resenas"))
                                .build();
        }
}