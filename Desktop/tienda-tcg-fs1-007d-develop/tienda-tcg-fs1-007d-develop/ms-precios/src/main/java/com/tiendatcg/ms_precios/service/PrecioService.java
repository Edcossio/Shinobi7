package com.tiendatcg.ms_precios.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

import com.tiendatcg.ms_precios.client.CatalogoClient;
import com.tiendatcg.ms_precios.dto.PrecioRequestDTO;
import com.tiendatcg.ms_precios.dto.PrecioResponseDTO;
import com.tiendatcg.ms_precios.exception.AccesoDenegado;
import com.tiendatcg.ms_precios.exception.DependenciaFallida;
import com.tiendatcg.ms_precios.exception.NotFound;
import com.tiendatcg.ms_precios.model.GeneradorPrecio;
import com.tiendatcg.ms_precios.repository.PrecioRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Slf4j
@Service
@RequiredArgsConstructor
public class PrecioService {

    private final PrecioRepository precioRepository;
    private final CatalogoClient catalogoClient;

    private PrecioResponseDTO mapToDTO(GeneradorPrecio precio) {
        return new PrecioResponseDTO(
                precio.getIdPrecio(),
                precio.getIdCartaRef(),
                precio.getValorMercado(),
                precio.getFechaRegistro());
    }

    private boolean esRolPermitido(String rolUsuario, String... rolesPermitidos) {
        if (rolUsuario == null)
            return false;
        for (String rol : rolesPermitidos) {
            if (rolUsuario.equalsIgnoreCase(rol)) {
                return true;
            }
        }
        return false;
    }

    public List<PrecioResponseDTO> obtenerTodos(String rol) {
        if (!esRolPermitido(rol, "USER", "EMPLEADO", "ADMIN")) {
            throw new AccesoDenegado("Acceso denegado: no tienes permisos para consultar precios");
        }
        return precioRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public Optional<PrecioResponseDTO> obtenerPorId(Long id, String rol) {
        if (!esRolPermitido(rol, "USER", "EMPLEADO", "ADMIN")) {
            throw new AccesoDenegado("Acceso denegado: no tienes permisos para consultar precios");
        }
        return precioRepository.findById(id).map(this::mapToDTO);
    }

    public List<PrecioResponseDTO> obtenerHistorialPorCarta(Long idCartaRef, String rol) {
        if (!esRolPermitido(rol, "USER", "EMPLEADO", "ADMIN")) {
            throw new AccesoDenegado("Acceso denegado: no tienes permisos para consultar precios");
        }
        return precioRepository.findByIdCartaRefOrderByFechaRegistroDesc(idCartaRef)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // DESPUÉS — distingue correctamente entre 404 y 502
    public PrecioResponseDTO guardar(PrecioRequestDTO dto, String rol) {
        if (!esRolPermitido(rol, "EMPLEADO", "ADMIN")) {
            throw new AccesoDenegado(
                    "Acceso denegado: solo empleados o administradores pueden crear precios");
        }

        boolean cartaExiste;
        try {
            cartaExiste = catalogoClient.verificarCartaExiste(dto.getIdCartaRef());
        } catch (Exception e) {
            log.error("[MS-PRECIOS] ms-catalogo no disponible al verificar carta ID {}: {}",
                    dto.getIdCartaRef(), e.getMessage());
            throw new DependenciaFallida(
                    "No se pudo verificar la carta con ID " + dto.getIdCartaRef()
                            + " en ms-catalogo.");
        }

        if (!cartaExiste) {
            throw new NotFound(
                    "La carta con ID " + dto.getIdCartaRef()
                            + " no existe en el catálogo.");
        }

        GeneradorPrecio precio = new GeneradorPrecio();
        precio.setIdCartaRef(dto.getIdCartaRef());
        precio.setValorMercado(dto.getValorMercado());

        log.info("[MS-PRECIOS] Precio creado para carta ID {}: {}",
                dto.getIdCartaRef(), dto.getValorMercado());
        return mapToDTO(precioRepository.save(precio));
    }

    public Optional<PrecioResponseDTO> actualizar(Long id, PrecioRequestDTO dto, String rol) {
        if (!esRolPermitido(rol, "EMPLEADO", "ADMIN")) {
            throw new AccesoDenegado("Acceso denegado: solo empleados o administradores pueden actualizar precios");
        }

        return precioRepository.findById(id).map(existente -> {
            existente.setValorMercado(dto.getValorMercado());
            return mapToDTO(precioRepository.save(existente));
        });
    }

    @Transactional
    public void eliminar(Long id, String rol) {
        if (!esRolPermitido(rol, "ADMIN")) {
            throw new AccesoDenegado("Acceso denegado: solo administradores pueden eliminar precios.");
        }

        // Verificación y eliminación en una sola transacción — sin condición de carrera
        if (!precioRepository.existsById(id)) {
            throw new NotFound("Precio no encontrado con ID: " + id);
        }

        precioRepository.deleteById(id);
    }
}