package com.ms_catalogo.Catalogo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidacion(MethodArgumentNotValidException ex, WebRequest request) {
        Map<String, String> errores = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> errores.put(e.getField(), e.getDefaultMessage()));
        return buildResponse(HttpStatus.BAD_REQUEST,
                "Error de validación en los datos enviados",
                "Por favor, verifique los campos enviados",
                request, errores);
    }

    @ExceptionHandler(CartaNoEncontradaException.class)
    public ResponseEntity<ErrorResponse> handleCartaNoEncontrada(CartaNoEncontradaException ex, WebRequest request) {
        return buildResponse(HttpStatus.NOT_FOUND, "Recurso no encontrado", ex.getMessage(), request, null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex, WebRequest request) {
        String desc = ex.getMessage() != null ? ex.getMessage() : "Ocurrió un error inesperado";
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor", desc, request, null);
    }

    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String mensaje, String descripcion,
                                                        WebRequest request, Map<String, String> errores) {
        ErrorResponse body = ErrorResponse.builder()
                .codigo(status.value())
                .mensaje(mensaje)
                .descripcion(descripcion)
                .timestamp(LocalDateTime.now())
                .ruta(request.getDescription(false).replace("uri=", ""))
                .erroresDeValidacion(errores)
                .build();
        return new ResponseEntity<>(body, status);
    }
}