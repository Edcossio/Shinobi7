package com.ms_catalogo.Catalogo.DTOs;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CatalogoRequestDTO {

    @NotBlank(message = "El nombre de la carta no puede estar vacío")
    @Size(min = 3, max = 255, message = "El nombre debe tener entre 3 y 255 caracteres")
    private String nombre;

    @NotBlank(message = "La descripción no puede estar vacía")
    @Size(min = 10, max = 2000, message = "La descripción debe tener entre 10 y 2000 caracteres")
    private String descripcion;

    @NotNull(message = "El precio es requerido")
    @Min(value = 0, message = "El precio debe ser mayor o igual a 0")
    private Double precio;

    @NotNull(message = "El stock base es requerido")
    @Min(value = 0, message = "El stock base debe ser mayor o igual a 0")
    private Integer stockBase;

    @NotBlank(message = "La categoría no puede estar vacía")
    @Size(min = 2, max = 100, message = "La categoría debe tener entre 2 y 100 caracteres")
    private String categoria;
}