package com.ms_catalogo.Catalogo.exception;

public class CartaNoEncontradaException extends RuntimeException {
    public CartaNoEncontradaException(Long id) {
        super("No se encontró la carta con ID: " + id);
    }
}