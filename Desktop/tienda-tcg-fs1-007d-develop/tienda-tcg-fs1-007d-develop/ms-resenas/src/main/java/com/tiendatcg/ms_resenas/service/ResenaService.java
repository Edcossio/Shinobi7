package com.tiendatcg.ms_resenas.service;

import com.tiendatcg.ms_resenas.dto.ResenaRequestDTO;
import com.tiendatcg.ms_resenas.dto.ResenaResponseDTO;
import com.tiendatcg.ms_resenas.model.Resena;
import com.tiendatcg.ms_resenas.repository.ResenaRepository;
import com.tiendatcg.ms_resenas.client.UsuarioClient;
import com.tiendatcg.ms_resenas.client.ProductoClient;
import com.tiendatcg.ms_resenas.exception.NotFound;
import com.tiendatcg.ms_resenas.exception.DependenciaFallida;
import feign.FeignException;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResenaService {

    private final ResenaRepository repository;
    private final UsuarioClient usuarioClient;
    private final ProductoClient productoClient;

    public List<ResenaResponseDTO> obtenerTodas() {
        return repository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public ResenaResponseDTO crear(ResenaRequestDTO request) {
        try {
            usuarioClient.obtenerUsuarioPorId(request.getIdUsuarioRef());
        } catch (FeignException.NotFound e) {
            throw new NotFound("No se puede crear la reseña: El usuario con ID " + request.getIdUsuarioRef() + " no existe.");
        } catch (FeignException e) {
            throw new DependenciaFallida("Error de comunicación con el servicio de usuarios.");
        }

        try {
            productoClient.obtenerProductoPorId(request.getIdProductoRef());
        } catch (FeignException.NotFound e) {
            throw new NotFound("No se puede crear la reseña: El producto con ID " + request.getIdProductoRef() + " no existe.");
        } catch (FeignException e) {
            throw new DependenciaFallida("Error de comunicación con el servicio de productos.");
        }

        Resena resena = new Resena();
        resena.setIdUsuarioRef(request.getIdUsuarioRef());
        resena.setIdProductoRef(request.getIdProductoRef());
        resena.setCalificacion(request.getCalificacion());
        resena.setComentario(request.getComentario());

        return mapToDTO(repository.save(resena));
    }

    public ResenaResponseDTO actualizar(Long id, ResenaRequestDTO request) {
        Resena resena = repository.findById(id)
            .orElseThrow(() -> new NotFound("Reseña no encontrada con ID: " + id));

        resena.setCalificacion(request.getCalificacion());
        resena.setComentario(request.getComentario());

        return mapToDTO(repository.save(resena));
    }

    public void eliminar(Long id) {
        Resena resena = repository.findById(id)
            .orElseThrow(() -> new NotFound("Reseña no encontrada con ID: " + id));
        repository.delete(resena);
    }

    private ResenaResponseDTO mapToDTO(Resena resena) {
        ResenaResponseDTO dto = new ResenaResponseDTO();
        dto.setIdResena(resena.getIdResena());
        dto.setIdUsuarioRef(resena.getIdUsuarioRef());
        dto.setIdProductoRef(resena.getIdProductoRef());
        dto.setCalificacion(resena.getCalificacion());
        dto.setComentario(resena.getComentario());
        dto.setFechaCreacion(resena.getFechaCreacion());
        return dto;
    }
}