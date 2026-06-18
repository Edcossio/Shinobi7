package com.tiendatcg.ms_pedidos.exception;

import org.springframework.http.HttpStatus;

public class DependenciaFallida extends ApiException {

    public DependenciaFallida(String mensaje) {
        super(mensaje, HttpStatus.BAD_GATEWAY);
    }
}