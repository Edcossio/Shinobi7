package com.tiendatcg.ms_envios.dto;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EnvioResponseDTO {
    private Long idEnvio;
    private Long idPedidoRef;
    private String direccionDestino;
    private String transportadora;
    private String estadoEnvio;
    private LocalDateTime fechaCreacion;
}