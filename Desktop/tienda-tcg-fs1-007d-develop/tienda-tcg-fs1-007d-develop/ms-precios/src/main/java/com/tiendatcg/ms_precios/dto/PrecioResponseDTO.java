package com.tiendatcg.ms_precios.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class PrecioResponseDTO {

    private Long idPrecio;
    private Long idCartaRef;
    private BigDecimal valorMercado;
    private LocalDateTime fechaRegistro;
}
