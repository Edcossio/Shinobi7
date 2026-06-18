package com.tiendatcg.ms_usuarios.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UsuarioRequestDTO {
    

    private Long idAuthRef;

    @NotBlank(message = "El nombre completo no puede estar vacío")
    private String nombreCompleto;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "Debe ser un formato de correo electrónico válido")
    private String correoElectronico;

    // La direccion es opcional, por lo que no lleva @NotBlank
    private String direccionFisica;
    private String rol;
    
}
