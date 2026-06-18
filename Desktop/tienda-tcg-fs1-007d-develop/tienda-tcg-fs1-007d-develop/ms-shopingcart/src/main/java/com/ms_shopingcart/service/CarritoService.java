package com.ms_shopingcart.service;

import com.ms_shopingcart.DTOs.CarritoResponseDTO;
import com.ms_shopingcart.DTOs.ItemRequestDTO;

public interface CarritoService {

    CarritoResponseDTO obtenerOCrearCarrito(Long usuarioId);

    CarritoResponseDTO agregarItem(Long usuarioId, ItemRequestDTO itemRequestDTO);

    CarritoResponseDTO eliminarItem(Long usuarioId, Long itemId);

    CarritoResponseDTO vaciarCarrito(Long usuarioId);

    CarritoResponseDTO completarCarrito(Long usuarioId);
}