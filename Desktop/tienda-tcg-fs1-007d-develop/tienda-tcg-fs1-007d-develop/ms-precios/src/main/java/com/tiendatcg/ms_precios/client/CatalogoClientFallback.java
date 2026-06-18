package com.tiendatcg.ms_precios.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class CatalogoClientFallback implements CatalogoClient {

    @Override
    public boolean verificarCartaExiste(Long idCarta) {
        log.error("[MS-PRECIOS] ms-catalogo no disponible al verificar carta ID {}. " +
                "Rechazando operación como medida de seguridad.", idCarta);
        return false;
    }
}