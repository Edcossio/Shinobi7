package com.tiendatcg.ms_pedidos.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "ms-inventario", path = "/api/inventario", fallback = InventarioClientFallback.class)
public interface InventarioClient {

    @GetMapping("/verificar-stock/{idCarta}")
    boolean verificarStock(
            @PathVariable("idCarta") Long idCarta,
            @RequestParam("cantidad") Integer cantidad);
}