package com.tiendatcg.ms_envios.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.tiendatcg.ms_envios.model.Envio;
import java.util.Optional;

public interface EnvioRepository extends JpaRepository<Envio, Long> {
    Optional<Envio> findByIdPedidoRef(Long idPedidoRef);
}