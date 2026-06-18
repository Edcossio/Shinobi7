package com.tiendatcg.ms_notificaciones.service;

import com.tiendatcg.ms_notificaciones.dto.NotificacionRequestDTO;
import com.tiendatcg.ms_notificaciones.dto.NotificacionResponseDTO;
import com.tiendatcg.ms_notificaciones.model.Notificacion;
import com.tiendatcg.ms_notificaciones.repository.NotificacionRepository;
import com.tiendatcg.ms_notificaciones.client.UsuarioClient;
import com.tiendatcg.ms_notificaciones.exception.NotFound;
import com.tiendatcg.ms_notificaciones.exception.DependenciaFallida;
import feign.FeignException;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository repository;
    private final UsuarioClient usuarioClient;

    public List<NotificacionResponseDTO> obtenerTodas() {
        return repository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<NotificacionResponseDTO> listarPorUsuario(Long idUsuario) {
        try {
            usuarioClient.obtenerUsuarioPorId(idUsuario);
        } catch (FeignException.NotFound e) {
            throw new NotFound("No se pueden listar las notificaciones: El usuario con ID " + idUsuario + " no existe.");
        } catch (FeignException e) {
            throw new DependenciaFallida("Error de comunicación con el servicio de usuarios.");
        }

        return repository.findByIdUsuarioDestinoOrderByFechaCreacionDesc(idUsuario)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public NotificacionResponseDTO crear(NotificacionRequestDTO request) {
        try {
            usuarioClient.obtenerUsuarioPorId(request.getIdUsuarioDestino());
        } catch (FeignException.NotFound e) {
            throw new NotFound("No se puede crear la notificación: El usuario con ID " + request.getIdUsuarioDestino() + " no existe.");
        } catch (FeignException e) {
            throw new DependenciaFallida("Error de comunicación con el servicio de usuarios.");
        }

        Notificacion notificacion = new Notificacion();
        notificacion.setIdUsuarioDestino(request.getIdUsuarioDestino());
        notificacion.setTitulo(request.getTitulo());
        notificacion.setMensaje(request.getMensaje());
        notificacion.setLeida(false);
        
        return mapToDTO(repository.save(notificacion));
    }

    public NotificacionResponseDTO actualizar(Long id, NotificacionRequestDTO request) {
        Notificacion notificacion = repository.findById(id)
            .orElseThrow(() -> new NotFound("Notificación no encontrada con ID: " + id));
            
        notificacion.setIdUsuarioDestino(request.getIdUsuarioDestino());
        notificacion.setTitulo(request.getTitulo());
        notificacion.setMensaje(request.getMensaje());
        
        return mapToDTO(repository.save(notificacion));
    }

    public void eliminar(Long id) {
        Notificacion notificacion = repository.findById(id)
            .orElseThrow(() -> new NotFound("Notificación no encontrada con ID: " + id));
        repository.delete(notificacion);
    }

    private NotificacionResponseDTO mapToDTO(Notificacion notificacion) {
        NotificacionResponseDTO dto = new NotificacionResponseDTO();
        dto.setIdNotificacion(notificacion.getIdNotificacion());
        dto.setIdUsuarioDestino(notificacion.getIdUsuarioDestino());
        dto.setTitulo(notificacion.getTitulo());
        dto.setMensaje(notificacion.getMensaje());
        dto.setLeida(notificacion.getLeida());
        dto.setFechaCreacion(notificacion.getFechaCreacion());
        return dto;
    }
}