package com.tiendatcg.ms_pagos.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
// en caso de no encontrar generationType de jakarta  importar jakarta.persistence.* 
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "Pagos")

public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPago;

    @Column(nullable=false)
    private Long idPedidoRef;
    
    @Column(nullable = false, precision=10,scale=2)
    private BigDecimal montoTotal;

    @Column(nullable = false, length=50)
    private String metodoPago;

    @Column(nullable = false, length = 20)
    private String estadoPago;

    @Column(nullable = false, updatable=false)
    private LocalDateTime fechaTransaccion;

    @PrePersist
    protected void onCreate(){
        this.fechaTransaccion = LocalDateTime.now();
        if(this.estadoPago==null){
            this.estadoPago ="Pendiente";
        }
    }


}
