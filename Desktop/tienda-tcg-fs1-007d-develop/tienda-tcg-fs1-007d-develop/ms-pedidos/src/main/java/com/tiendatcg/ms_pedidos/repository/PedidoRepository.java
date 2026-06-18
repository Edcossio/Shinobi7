package com.tiendatcg.ms_pedidos.repository;

import com.tiendatcg.ms_pedidos.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // Todos los pedidos de un usuario
    List<Pedido> findByIdUsuarioRef(Long idUsuarioRef);

    // Pedidos de un usuario por estado
    List<Pedido> findByIdUsuarioRefAndEstado(Long idUsuarioRef, String estado);

    // Pedidos de una carta específica
    List<Pedido> findByIdCartaRef(Long idCartaRef);
}