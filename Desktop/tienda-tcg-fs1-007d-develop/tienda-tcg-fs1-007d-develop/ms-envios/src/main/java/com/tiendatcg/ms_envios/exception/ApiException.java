package com.tiendatcg.ms_envios.exception;

import org.springframework.http.HttpStatus;
import lombok.Getter;

@Getter
public class ApiException extends RuntimeException {
    
    private final HttpStatus status;

    public ApiException(String mensaje, HttpStatus status) {
        super(mensaje);
        this.status = status;
    }
}