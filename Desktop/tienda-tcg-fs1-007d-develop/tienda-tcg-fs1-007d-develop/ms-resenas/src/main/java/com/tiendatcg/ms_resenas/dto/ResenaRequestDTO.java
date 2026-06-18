package com.tiendatcg.ms_resenas.dto;

import lombok.Data;

@Data
public class ResenaRequestDTO {
    private Long idUsuarioRef;
    private Long idProductoRef;
    private Integer calificacion;
    private String comentario;
}