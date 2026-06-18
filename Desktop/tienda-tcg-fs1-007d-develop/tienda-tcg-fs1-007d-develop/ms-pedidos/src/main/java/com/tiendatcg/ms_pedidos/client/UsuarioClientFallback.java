package com.tiendatcg.ms_pedidos.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class UsuarioClientFallback implements UsuarioClient {

    @Override
    public boolean verificarExistencia(Long id) {
        log.error("[MS-PEDIDOS] ms-usuarios no disponible al verificar usuario ID {}. " +
                "Rechazando pedido como medida de seguridad.", id);
        return false;
    }
}