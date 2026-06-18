package com.ms_inventario.Inventario.ms_inventory.inventario.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ms_inventario.Inventario.ms_inventory.inventario.model.Inventario;

@Repository
public interface InventarioRepository extends JpaRepository<Inventario, Long> {

    Optional<Inventario> findByIdCartaRef(Long idCartaRef);

    Optional<Inventario> findByIdCartaRefAndEstadoCarta(Long idCartaRef, String estadoCarta);

    List<Inventario> findAllByIdCartaRef(Long idCartaRef);
}
