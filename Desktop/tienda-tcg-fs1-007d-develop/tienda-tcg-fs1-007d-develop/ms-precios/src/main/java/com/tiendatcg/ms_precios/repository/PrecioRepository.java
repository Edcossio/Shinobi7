package com.tiendatcg.ms_precios.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tiendatcg.ms_precios.model.GeneradorPrecio;
import java.util.List;


public interface PrecioRepository extends JpaRepository<GeneradorPrecio, Long>{

    List<GeneradorPrecio> findByIdCartaRefOrderByFechaRegistroDesc(Long idCarteRef);

}
