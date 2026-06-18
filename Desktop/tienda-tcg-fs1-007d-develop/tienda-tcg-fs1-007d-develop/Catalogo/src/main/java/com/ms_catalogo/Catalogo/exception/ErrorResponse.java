package com.ms_catalogo.Catalogo.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    private int codigo;
    private String mensaje;
    private String descripcion;
    private LocalDateTime timestamp;
    private String ruta;
    private Map<String, String> erroresDeValidacion;
}