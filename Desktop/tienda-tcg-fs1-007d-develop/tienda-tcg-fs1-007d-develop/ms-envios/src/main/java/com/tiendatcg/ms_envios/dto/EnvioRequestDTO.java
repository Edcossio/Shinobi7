package com.tiendatcg.ms_envios.dto;
import lombok.Data;

@Data
public class EnvioRequestDTO {
    private Long idPedidoRef;
    private String direccionDestino;
    private String transportadora;
    private String estadoEnvio;
}