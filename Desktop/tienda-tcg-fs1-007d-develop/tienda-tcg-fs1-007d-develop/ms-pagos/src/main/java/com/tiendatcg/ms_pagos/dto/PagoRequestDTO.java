package com.tiendatcg.ms_pagos.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagoRequestDTO {

    @NotNull(message = "El ID del pedido es obligatorio")
    private Long idPedidoRef;

    @NotNull(message = "El monto no puede ser nulo")
    @DecimalMin(value = "0.0",inclusive = false,message = "El monto debe ser mayor a 0")
    private BigDecimal montoTotal;

    @NotBlank(message = "El metodo de pago es obligatorio")
    private String metodoPago;

}
