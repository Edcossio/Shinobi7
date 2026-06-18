package com.tiendatcg.ms_pedidos.DTO;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PedidoRequestDTO {

    @NotNull(message = "El ID del usuario es obligatorio")
    private Long idUsuarioRef;

    @NotNull(message = "El ID de la carta es obligatorio")
    private Long idCartaRef;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    private Integer cantidad;

    @NotNull(message = "El precio unitario es obligatorio")
    private BigDecimal precioUnitario;
}