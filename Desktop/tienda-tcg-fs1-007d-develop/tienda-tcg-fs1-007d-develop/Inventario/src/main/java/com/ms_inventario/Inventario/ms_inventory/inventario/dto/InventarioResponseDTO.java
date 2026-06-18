package com.ms_inventario.Inventario.ms_inventory.inventario.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventarioResponseDTO {

    private Long id;
    private Long idCartaRef;
    private Integer cantidad;
    private String estadoCarta;
    private String ubicacion;
}
