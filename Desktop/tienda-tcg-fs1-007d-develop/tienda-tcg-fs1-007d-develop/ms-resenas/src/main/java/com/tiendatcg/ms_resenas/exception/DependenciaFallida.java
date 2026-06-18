package com.tiendatcg.ms_resenas.exception;

import org.springframework.http.HttpStatus;

public class DependenciaFallida extends ApiException {
    
    public DependenciaFallida(String mensaje) {
        super(mensaje, HttpStatus.BAD_GATEWAY);
    }
}