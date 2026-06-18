package com.ms_shopingcart.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ms_shopingcart.DTOs.CarritoResponseDTO;
import com.ms_shopingcart.DTOs.ItemRequestDTO;
import com.ms_shopingcart.DTOs.ItemResponseDTO;
import com.ms_shopingcart.execption.CarritoNoEncontradoException;
import com.ms_shopingcart.model.Carrito;
import com.ms_shopingcart.model.ItemCarrito;
import com.ms_shopingcart.repository.CarritoRepository;
import com.ms_shopingcart.repository.ItemCarritoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CarritoServiceImpl implements CarritoService {

    private final CarritoRepository carritoRepository;
    private final ItemCarritoRepository itemCarritoRepository;

    @Override
    @Transactional
    public CarritoResponseDTO obtenerOCrearCarrito(Long usuarioId) {
        Carrito carrito = carritoRepository
                .findByUsuarioIdAndEstado(usuarioId, "ACTIVO")
                .orElseGet(() -> carritoRepository.save(
                        Carrito.builder()
                                .usuarioId(usuarioId)
                                .estado("ACTIVO")
                                .build()
                ));
        return mapearCarritoAResponse(carrito);
    }

    @Override
    @Transactional
    public CarritoResponseDTO agregarItem(Long usuarioId, ItemRequestDTO dto) {
        Carrito carrito = obtenerCarritoActivo(usuarioId);

        Optional<ItemCarrito> itemExistente = itemCarritoRepository.findByCarrito_IdAndCartaId(carrito.getId(), dto.getCartaId());

        if (itemExistente.isPresent()) {
            ItemCarrito item = itemExistente.get();
            item.setCantidad(item.getCantidad() + dto.getCantidad());
            item.calcularSubtotal();
            itemCarritoRepository.save(item);
        } else {
            ItemCarrito nuevoItem = ItemCarrito.builder()
                    .cartaId(dto.getCartaId())
                    .cantidad(dto.getCantidad())
                    .precioUnitario(dto.getPrecioUnitario())
                    .subtotal(dto.getCantidad() * dto.getPrecioUnitario())
                    .carrito(carrito)
                    .build();
            itemCarritoRepository.save(nuevoItem);
        }

        return mapearCarritoAResponse(
                carritoRepository.findById(carrito.getId())
                        .orElseThrow(() -> new CarritoNoEncontradoException(carrito.getId()))
        );
    }

    @Override
    @Transactional
    public CarritoResponseDTO eliminarItem(Long usuarioId, Long itemId) {
        Carrito carrito = obtenerCarritoActivo(usuarioId);

        ItemCarrito item = itemCarritoRepository.findById(itemId)
                .filter(i -> i.getCarrito().getId().equals(carrito.getId()))
                .orElseThrow(() -> new CarritoNoEncontradoException(
                        "El ítem con ID " + itemId + " no pertenece al carrito del usuario"));

        itemCarritoRepository.delete(item);

        return mapearCarritoAResponse(
                carritoRepository.findById(carrito.getId())
                        .orElseThrow(() -> new CarritoNoEncontradoException(carrito.getId()))
        );
    }

    @Override
    @Transactional
    public CarritoResponseDTO vaciarCarrito(Long usuarioId) {
        Carrito carrito = obtenerCarritoActivo(usuarioId);
        carrito.getItems().clear();
        carritoRepository.save(carrito);
        return mapearCarritoAResponse(carrito);
    }

    @Override
    @Transactional
    public CarritoResponseDTO completarCarrito(Long usuarioId) {
        Carrito carrito = obtenerCarritoActivo(usuarioId);

        if (carrito.getItems().isEmpty()) {
            throw new IllegalStateException("No se puede completar un carrito vacío");
        }

        carrito.setEstado("COMPLETADO");
        carritoRepository.save(carrito);
        return mapearCarritoAResponse(carrito);
    }

    // ─────────────────────────────────────────────
    // Helpers privados
    // ─────────────────────────────────────────────

    private Carrito obtenerCarritoActivo(Long usuarioId) {
        return carritoRepository.findByUsuarioIdAndEstado(usuarioId, "ACTIVO")
                .orElseThrow(() -> new CarritoNoEncontradoException(
                        "No existe un carrito ACTIVO para el usuario con ID: " + usuarioId));
    }

    private CarritoResponseDTO mapearCarritoAResponse(Carrito carrito) {
        List<ItemResponseDTO> itemsDTO = carrito.getItems().stream()
                .map(item -> ItemResponseDTO.builder()
                        .id(item.getId())
                        .cartaId(item.getCartaId())
                        .cantidad(item.getCantidad())
                        .precioUnitario(item.getPrecioUnitario())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        Double total = itemsDTO.stream()
                .mapToDouble(ItemResponseDTO::getSubtotal)
                .sum();

        return CarritoResponseDTO.builder()
                .id(carrito.getId())
                .usuarioId(carrito.getUsuarioId())
                .estado(carrito.getEstado())
                .fechaCreacion(carrito.getFechaCreacion())
                .items(itemsDTO)
                .total(total)
                .build();
    }
}