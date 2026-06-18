package com.tiendatcg.ms_pagos.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import com.tiendatcg.ms_pagos.dto.AuthResponseDTO;

@FeignClient(name = "ms-auth", path = "/api/auth", fallback = AuthClientFallback.class)
public interface AuthClient {

    @GetMapping("/validar-token")
    AuthResponseDTO validarToken(@RequestHeader("Authorization") String token);
}