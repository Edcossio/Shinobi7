package com.tiendatcg.ms_pedidos.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class InventarioClientFallback implements InventarioClient {

    @Override
    public boolean verificarStock(Long idCarta, Integer cantidad) {
        log.error("[MS-PEDIDOS] ms-inventario no disponible al verificar stock " +
                "de carta ID {} cantidad {}. Rechazando pedido como medida de seguridad.",
                idCarta, cantidad);
        return false;
    }
}