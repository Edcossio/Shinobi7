package com.tiendatcg.ms_usuarios.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponseDTO {
    private Long idPerfil;
    private String nombreCompleto;
    private String correoElectronico;
    private String direccionFisica;
    private Integer totalPuntos;
    private String categoriaVip;
}