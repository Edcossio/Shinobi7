package com.ms_shopingcart.DTOs;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemResponseDTO {

    private Long id;
    private Long cartaId;
    private Integer cantidad;
    private Double precioUnitario;
    private Double subtotal;
}