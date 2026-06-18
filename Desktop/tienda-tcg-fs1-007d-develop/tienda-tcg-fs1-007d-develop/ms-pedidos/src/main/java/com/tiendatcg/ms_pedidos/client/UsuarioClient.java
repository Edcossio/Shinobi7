package com.tiendatcg.ms_pedidos.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
    name = "ms-usuarios",
    path = "/api/usuarios",
    fallback = UsuarioClientFallback.class
)
public interface UsuarioClient {

    @GetMapping("/validar-user/{id}")
    boolean verificarExistencia(@PathVariable("id") Long id);
}
