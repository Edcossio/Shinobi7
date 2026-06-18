package com.ms_inventario.Inventario.ms_inventory.inventario.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ms_inventario.Inventario.ms_inventory.inventario.dto.InventarioRequestDTO;
import com.ms_inventario.Inventario.ms_inventory.inventario.dto.InventarioResponseDTO;
import com.ms_inventario.Inventario.ms_inventory.inventario.model.Inventario;
import com.ms_inventario.Inventario.ms_inventory.inventario.repository.InventarioRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class InventarioService {

    private final InventarioRepository repository;

    public InventarioResponseDTO saveInventario(InventarioRequestDTO requestDTO) {
        validateStock(requestDTO.getCantidad());
        Inventario entity = mapToEntity(requestDTO);
        Inventario saved = repository.save(entity);
        return mapToResponse(saved);
    }

    public List<InventarioResponseDTO> getAllInventarios() {
        return repository.findAll().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public InventarioResponseDTO getInventarioById(Long id) {
        Inventario entity = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("No se encontró inventario con id " + id));
        return mapToResponse(entity);
    }

    public List<InventarioResponseDTO> getInventariosByCartaRef(Long idCartaRef) {
        return repository.findAllByIdCartaRef(idCartaRef).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public InventarioResponseDTO getInventarioByCartaRefAndEstado(Long idCartaRef, String estadoCarta) {
        Inventario entity = repository.findByIdCartaRefAndEstadoCarta(idCartaRef, estadoCarta)
            .orElseThrow(() -> new RuntimeException("No se encontró inventario para la carta " + idCartaRef + " con estado " + estadoCarta));
        return mapToResponse(entity);
    }

    @Transactional
    public InventarioResponseDTO updateInventario(Long id, InventarioRequestDTO requestDTO) {
        Inventario existing = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("No se encontró inventario con id " + id));

        validateStock(requestDTO.getCantidad());
        existing.setIdCartaRef(requestDTO.getIdCartaRef());
        existing.setCantidad(requestDTO.getCantidad());
        existing.setEstadoCarta(requestDTO.getEstadoCarta());
        existing.setUbicacion(requestDTO.getUbicacion());

        return mapToResponse(repository.save(existing));
    }

    public void deleteInventario(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("No se encontró inventario con id " + id);
        }
        repository.deleteById(id);
    }

    @Transactional
    public InventarioResponseDTO addStock(Long id, int cantidadAgregar) {
        if (cantidadAgregar < 0) {
            throw new RuntimeException("La cantidad a agregar debe ser mayor o igual a 0");
        }
        Inventario existing = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("No se encontró inventario con id " + id));
        existing.setCantidad(existing.getCantidad() + cantidadAgregar);
        validateStock(existing.getCantidad());
        return mapToResponse(repository.save(existing));
    }

    @Transactional
    public InventarioResponseDTO subtractStock(Long id, int cantidadRestar) {
        if (cantidadRestar < 0) {
            throw new RuntimeException("La cantidad a descontar debe ser mayor o igual a 0");
        }
        Inventario existing = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("No se encontró inventario con id " + id));
        int nuevoStock = existing.getCantidad() - cantidadRestar;
        if (nuevoStock < 0) {
            throw new RuntimeException("Stock insuficiente para descontar " + cantidadRestar + " unidades");
        }
        existing.setCantidad(nuevoStock);
        return mapToResponse(repository.save(existing));
    }

    private Inventario mapToEntity(InventarioRequestDTO requestDTO) {
        return Inventario.builder()
            .idCartaRef(requestDTO.getIdCartaRef())
            .cantidad(requestDTO.getCantidad())
            .estadoCarta(requestDTO.getEstadoCarta())
            .ubicacion(requestDTO.getUbicacion())
            .build();
    }

    private InventarioResponseDTO mapToResponse(Inventario entity) {
        return InventarioResponseDTO.builder()
            .id(entity.getId())
            .idCartaRef(entity.getIdCartaRef())
            .cantidad(entity.getCantidad())
            .estadoCarta(entity.getEstadoCarta())
            .ubicacion(entity.getUbicacion())
            .build();
    }

    private void validateStock(Integer cantidad) {
        if (cantidad == null) {
            throw new RuntimeException("La cantidad no puede ser nula");
        }
        if (cantidad < 0) {
            throw new RuntimeException("La cantidad no puede ser negativa");
        }
    }
}
