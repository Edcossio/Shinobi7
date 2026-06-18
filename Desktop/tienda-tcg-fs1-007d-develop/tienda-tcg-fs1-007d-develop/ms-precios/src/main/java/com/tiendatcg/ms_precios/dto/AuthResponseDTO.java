package com.tiendatcg.ms_precios.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class AuthResponseDTO {
     private Long idAuth;
    private Long idUsuarioRef; 
    private String rol;         
    private String token;
}
