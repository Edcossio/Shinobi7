package com.tiendatcg.ms_auth.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class UsuarioClientFallback implements UsuarioClient {

    @Override
    public boolean verificarExistencia(Long id) {
        log.error("[MS-AUTH] ms-usuarios no disponible al verificar ID {}. " +
                "Retornando false como medida de seguridad.", id);
        return false;
    }
}