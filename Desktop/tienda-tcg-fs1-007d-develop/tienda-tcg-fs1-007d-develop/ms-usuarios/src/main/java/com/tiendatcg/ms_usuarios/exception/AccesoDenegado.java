package com.tiendatcg.ms_usuarios.exception;

import org.springframework.http.HttpStatus;

public class AccesoDenegado extends ApiException {

    public AccesoDenegado(String mensaje) {
        super(mensaje, HttpStatus.FORBIDDEN);
    }
}