package com.ms_shopingcart.DTOs;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ItemRequestDTO {

    @NotNull(message = "El ID de la carta no puede ser nulo")
    private Long cartaId;

    @NotNull(message = "La cantidad no puede ser nula")
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    private Integer cantidad;

    @NotNull(message = "El precio unitario no puede ser nulo")
    @Min(value = 0, message = "El precio unitario no puede ser negativo")
    private Double precioUnitario;
}