package com.tiendatcg.ms_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class AuthResponseDTO {

    private Long idAuth;
    private Long idUsuarioRef;
    private String username;
    private String rol;
    // TOKEN EXISTE SOLO COMO RESPUESTA
    private String token; 

}
