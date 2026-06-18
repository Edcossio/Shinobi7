package com.tiendatcg.ms_usuarios.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name="usuarios")
@NoArgsConstructor
@AllArgsConstructor

public class Usuario {

    // atributo id

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPerfil;

    // subijo REF indica que pertenece a uno de los microservicios. en este caso se refiere a is del ms-auth
    @Column(nullable = true)
    private Long idAuthRef; 

    @Column(nullable = false, length = 150)
    private String nombreCompleto;

    @Column(nullable = false, unique = true, length = 100)
    private String correoElectronico;

    @Column(length = 250)
    private String direccionFisica; // Opcional

    
    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private Fidelidad puntos;
}

