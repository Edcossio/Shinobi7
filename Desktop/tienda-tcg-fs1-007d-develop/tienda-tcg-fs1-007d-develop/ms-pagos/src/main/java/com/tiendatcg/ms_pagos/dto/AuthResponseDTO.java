package com.tiendatcg.ms_pagos.dto;

import lombok.Data;

@Data
public class AuthResponseDTO {
    private Long idAuth;
    private Long idUsuarioRef; 
    private String rol;         
    private String token;
}
