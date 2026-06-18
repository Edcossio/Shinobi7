package com.tiendatcg.ms_pagos.client;

import com.tiendatcg.ms_pagos.dto.AuthResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class AuthClientFallback implements AuthClient {

    @Override
    public AuthResponseDTO validarToken(String token) {
        log.error("[MS-PAGOS] ms-auth no disponible al validar token. " +
                "Rechazando operación como medida de seguridad.");
        return null;
    }
}