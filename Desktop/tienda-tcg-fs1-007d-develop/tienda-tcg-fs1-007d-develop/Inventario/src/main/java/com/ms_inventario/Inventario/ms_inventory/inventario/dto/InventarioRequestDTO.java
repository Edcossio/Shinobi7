package com.ms_inventario.Inventario.ms_inventory.inventario.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventarioRequestDTO {

    @NotNull(message = "El id de la carta es obligatorio")
    private Long idCartaRef;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 0, message = "La cantidad debe ser arriba de 0")
    private Integer cantidad;

    @NotBlank(message = "El estado de la carta es obligatorio")
    private String estadoCarta;

    private String ubicacion;
}
