package com.tiendatcg.ms_notificaciones.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.tiendatcg.ms_notificaciones.model.Notificacion;
import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    
    List<Notificacion> findByIdUsuarioDestinoOrderByFechaCreacionDesc(Long idUsuarioDestino);
}