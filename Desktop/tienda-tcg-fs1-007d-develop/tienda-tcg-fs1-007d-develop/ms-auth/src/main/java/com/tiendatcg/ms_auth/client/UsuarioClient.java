package com.tiendatcg.ms_auth.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "ms-usuarios", fallback = UsuarioClientFallback.class)
public interface UsuarioClient {

    @GetMapping("/api/usuarios/validar-user/{id}")
    boolean verificarExistencia(@PathVariable("id") Long id);
}