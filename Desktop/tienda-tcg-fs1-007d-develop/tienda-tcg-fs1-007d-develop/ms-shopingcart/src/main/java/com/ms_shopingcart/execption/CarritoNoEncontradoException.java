package com.ms_shopingcart.execption;

public class CarritoNoEncontradoException extends RuntimeException {

    public CarritoNoEncontradoException(String mensaje) {
        super(mensaje);
    }

    public CarritoNoEncontradoException(Long id) {
        super("No se encontró el carrito con ID: " + id);
    }
}