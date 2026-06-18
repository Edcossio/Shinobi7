package com.tiendatcg.ms_resenas.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ResenaResponseDTO {
    private Long idResena;
    private Long idUsuarioRef;
    private Long idProductoRef;
    private Integer calificacion;
    private String comentario;
    private LocalDateTime fechaCreacion;
}