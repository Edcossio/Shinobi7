package com.ms_catalogo.Catalogo.Service;

import com.ms_catalogo.Catalogo.DTOs.CatalogoRequestDTO;
import com.ms_catalogo.Catalogo.DTOs.CatalogoResponseDTO;
import com.ms_catalogo.Catalogo.Repository.CatalogoRepository;
import com.ms_catalogo.Catalogo.exception.CartaNoEncontradaException;
import com.ms_catalogo.Catalogo.model.Catalogo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CatalogoService {

    private final CatalogoRepository catalogoRepository;

    public List<CatalogoResponseDTO> obtenerTodas() {
        return catalogoRepository.obtenerTodasOrdenadas().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CatalogoResponseDTO obtenerPorId(Long id) {
        return catalogoRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new CartaNoEncontradaException(id));
    }

    public CatalogoResponseDTO crear(CatalogoRequestDTO request) {
        if (catalogoRepository.existsByNombre(request.getNombre())) {
            throw new RuntimeException("Ya existe una carta con el nombre: " + request.getNombre());
        }
        return mapToResponse(catalogoRepository.save(mapToEntity(request)));
    }

    public CatalogoResponseDTO actualizar(Long id, CatalogoRequestDTO request) {
        Catalogo carta = catalogoRepository.findById(id)
                .orElseThrow(() -> new CartaNoEncontradaException(id));

        if (!carta.getNombre().equals(request.getNombre()) &&
                catalogoRepository.existsByNombre(request.getNombre())) {
            throw new RuntimeException("Ya existe otra carta con el nombre: " + request.getNombre());
        }

        carta.setNombre(request.getNombre());
        carta.setDescripcion(request.getDescripcion());
        carta.setPrecio(request.getPrecio());
        carta.setStockBase(request.getStockBase());
        carta.setCategoria(request.getCategoria());
        carta.setFechaActualizacion(LocalDateTime.now());

        return mapToResponse(catalogoRepository.save(carta));
    }

    public void eliminar(Long id) {
        if (!catalogoRepository.existsById(id)) {
            throw new CartaNoEncontradaException(id);
        }
        catalogoRepository.deleteById(id);
    }

    public Optional<CatalogoResponseDTO> buscarPorNombre(String nombre) {
        return catalogoRepository.findByNombre(nombre).map(this::mapToResponse);
    }

    public List<CatalogoResponseDTO> obtenerPorCategoria(String categoria) {
        return catalogoRepository.findByCategoria(categoria).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CatalogoResponseDTO> buscarPorNombreContiene(String nombre) {
        return catalogoRepository.buscarPorNombreContiene(nombre).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CatalogoResponseDTO> buscarPorRangoPrecio(Double precioMinimo, Double precioMaximo) {
        return catalogoRepository.buscarPorRangoPrecio(precioMinimo, precioMaximo).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CatalogoResponseDTO> obtenerOrdenadas() {
        return catalogoRepository.obtenerTodasOrdenadas().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CatalogoResponseDTO> obtenerCartasConMayorPrecio(int limite) {
        return catalogoRepository.obtenerCartasConMayorPrecio(limite).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CatalogoResponseDTO> buscarPorCategoriaYRangoPrecio(String categoria, Double precioMinimo, Double precioMaximo) {
        return catalogoRepository.buscarPorCategoriaYRangoPrecio(categoria, precioMinimo, precioMaximo).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public long contarPorCategoria(String categoria) {
        return catalogoRepository.countByCategoria(categoria);
    }

    private CatalogoResponseDTO mapToResponse(Catalogo catalogo) {
        return CatalogoResponseDTO.builder()
                .id(catalogo.getId())
                .nombre(catalogo.getNombre())
                .descripcion(catalogo.getDescripcion())
                .precio(catalogo.getPrecio())
                .stockBase(catalogo.getStockBase())
                .categoria(catalogo.getCategoria())
                .fechaCreacion(catalogo.getFechaCreacion())
                .fechaActualizacion(catalogo.getFechaActualizacion())
                .build();
    }

    private Catalogo mapToEntity(CatalogoRequestDTO request) {
        return Catalogo.builder()
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .precio(request.getPrecio())
                .stockBase(request.getStockBase())
                .categoria(request.getCategoria())
                .fechaCreacion(LocalDateTime.now())
                .fechaActualizacion(LocalDateTime.now())
                .build();
    }
}