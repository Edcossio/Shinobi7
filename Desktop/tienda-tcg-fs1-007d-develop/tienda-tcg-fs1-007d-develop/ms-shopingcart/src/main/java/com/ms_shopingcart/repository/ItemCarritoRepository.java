package com.ms_shopingcart.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ms_shopingcart.model.ItemCarrito;

@Repository
public interface ItemCarritoRepository extends JpaRepository<ItemCarrito, Long> {

    @Query("SELECT i FROM ItemCarrito i WHERE i.carrito.id = :carritoId AND i.cartaId = :cartaId")
    Optional<ItemCarrito> findByCarrito_IdAndCartaId(
        @Param("carritoId") Long carritoId,
        @Param("cartaId") Long cartaId
    );
}