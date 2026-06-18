package com.ms_shopingcart.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ITEMS_CARRITO")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemCarrito {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "item_seq")
    @SequenceGenerator(name = "item_seq", sequenceName = "SEQ_ITEM_CARRITO", allocationSize = 1)
    private Long id;

    @Column(name = "CARTA_ID", nullable = false)
    private Long cartaId;

    @Column(name = "CANTIDAD", nullable = false)
    private Integer cantidad;

    @Column(name = "PRECIO_UNITARIO", nullable = false)
    private Double precioUnitario;

    @Column(name = "SUBTOTAL", nullable = false)
    private Double subtotal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CARRITO_ID", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Carrito carrito;

    public void calcularSubtotal() {
        this.subtotal = this.cantidad * this.precioUnitario;
    }
}