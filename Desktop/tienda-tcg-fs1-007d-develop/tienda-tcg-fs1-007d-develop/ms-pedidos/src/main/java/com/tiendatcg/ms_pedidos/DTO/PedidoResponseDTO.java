package com.tiendatcg.ms_pedidos.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PedidoResponseDTO {

    private Long idPedido;
    private Long idUsuarioRef;
    private Long idCartaRef;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal montoTotal;
    private String estado;
    private LocalDateTime fechaPedido;
}
