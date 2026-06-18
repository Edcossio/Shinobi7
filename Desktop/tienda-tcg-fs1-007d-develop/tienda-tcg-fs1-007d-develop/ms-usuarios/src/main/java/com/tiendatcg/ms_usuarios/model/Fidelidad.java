package com.tiendatcg.ms_usuarios.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "fidelidad")

public class Fidelidad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPuntos;

    @OneToOne
    @JoinColumn(name = "id_perfil", nullable = false)
    @JsonIgnore // Evita ciclos infinitos si se serializa
    private Usuario usuario;

    @Column(nullable = true)
    private Integer totalPuntos;

    @Column(length = 50)
    private String categoriaVip; // bronze,silver, gold solo clientes


}
