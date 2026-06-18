package com.tiendatcg.ms_pagos.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class PedidoClientFallback implements PedidoClient {

    @Override
    public boolean verificarPedidoExiste(Long idPedido) {
        log.error("[MS-PAGOS] ms-pedidos no disponible al verificar pedido ID {}. " +
                "Rechazando operación como medida de seguridad.", idPedido);
        return false;
    }

    @Override
    public boolean verificarPropietarioPedido(Long idPedido, Long idUsuario) {
        log.error("[MS-PAGOS] ms-pedidos no disponible al verificar propietario " +
                "del pedido ID {}. Rechazando operación como medida de seguridad.", idPedido);
        return false;
    }
}