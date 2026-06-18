package com.tiendatcg.ms_pagos.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class PagoResponseDTO {
private Long idPago;
    private Long idPedidoRef;
    private BigDecimal montoTotal;
    private String metodoPago;
    private String estadoPago;
    private LocalDateTime fechaTransaccion;

}
