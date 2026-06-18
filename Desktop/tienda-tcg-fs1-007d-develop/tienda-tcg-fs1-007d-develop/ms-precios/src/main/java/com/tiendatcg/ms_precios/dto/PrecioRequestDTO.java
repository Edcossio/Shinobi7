package com.tiendatcg.ms_precios.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrecioRequestDTO {

@NotNull(message = "El ID de la carta es obligatorio")
private Long idCartaRef;

@NotNull(message = "Elvalor de mercado no puede ser nulo")
@DecimalMin(value = "0.0", inclusive = false, message = "El valor debe ser mayor a 0")
private BigDecimal valorMercado;
}
