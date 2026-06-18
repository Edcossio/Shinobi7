package com.tiendatcg.ms_envios.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "ms-pagos")
public interface PagoClient {
    @GetMapping("/api/pagos/pedido/{idPedido}")
    Object obtenerEstadoPago(@PathVariable("idPedido") Long idPedido);
}