package com.tiendatcg.ms_pedidos.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class CatalogoClientFallback implements CatalogoClient {

    @Override
    public boolean verificarCartaExiste(Long idCarta) {
        log.error("[MS-PEDIDOS] ms-catalogo no disponible al verificar carta ID {}. " +
                "Rechazando pedido como medida de seguridad.", idCarta);
        return false;
    }
}