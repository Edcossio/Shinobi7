package com.tiendatcg.ms_pagos.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "ms-pedidos", path = "/api/pedidos", fallback = PedidoClientFallback.class)
public interface PedidoClient {

    @GetMapping("/validar-envio/{idPedido}")
    boolean verificarPedidoExiste(@PathVariable("idPedido") Long idPedido);

    @GetMapping("/validar-propietario/{idPedido}/{idUsuario}")
    boolean verificarPropietarioPedido(
            @PathVariable("idPedido") Long idPedido,
            @PathVariable("idUsuario") Long idUsuario);
}