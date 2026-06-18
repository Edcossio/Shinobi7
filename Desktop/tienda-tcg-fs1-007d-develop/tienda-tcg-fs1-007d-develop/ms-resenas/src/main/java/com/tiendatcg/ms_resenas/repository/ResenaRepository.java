package com.tiendatcg.ms_resenas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.tiendatcg.ms_resenas.model.Resena;
import java.util.List;

public interface ResenaRepository extends JpaRepository<Resena, Long> {
    List<Resena> findByIdProductoRef(Long idProductoRef);
}