package com.tiendatcg.ms_usuarios.exception;

import org.springframework.http.HttpStatus;

public class NotFound extends ApiException {

    public NotFound(String mensaje) {
        super(mensaje, HttpStatus.NOT_FOUND);
    }
}