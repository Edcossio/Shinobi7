package com.tiendatcg.ms_pagos.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.tiendatcg.ms_pagos.client.PedidoClient;
import com.tiendatcg.ms_pagos.dto.PagoRequestDTO;
import com.tiendatcg.ms_pagos.dto.PagoResponseDTO;
import com.tiendatcg.ms_pagos.exception.AccesoDenegado;
import com.tiendatcg.ms_pagos.exception.NotFound;
import com.tiendatcg.ms_pagos.model.Pago;
import com.tiendatcg.ms_pagos.repository.PagoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PagoService {

    private final PagoRepository pagoRepository;
    private final PedidoClient pedidoClient;

    private PagoResponseDTO mapToDTO(Pago pago) {
        return new PagoResponseDTO(
                pago.getIdPago(),
                pago.getIdPedidoRef(),
                pago.getMontoTotal(),
                pago.getMetodoPago(),
                pago.getEstadoPago(),
                pago.getFechaTransaccion());
    }

    public List<PagoResponseDTO> obtenerTodos(String rol) {
        if ("USER".equals(rol)) {
            throw new AccesoDenegado("Acceso denegado: No tienes permisos para ver el historial global.");
        }

        return pagoRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public Optional<PagoResponseDTO> obtenerPorId(Long id, String rol, Long idUsuarioLogueado) {
        Pago pago = pagoRepository.findById(id)
                .orElseThrow(() -> new NotFound("Pago no encontrado"));

        if ("USER".equals(rol)) {
            if (idUsuarioLogueado == null) {
                throw new AccesoDenegado("No se pudo identificar al usuario.");
            }
            // Verificar que el pedido del pago pertenece al usuario logueado
            boolean esPropietario = pedidoClient
                    .verificarPropietarioPedido(pago.getIdPedidoRef(), idUsuarioLogueado);
            if (!esPropietario) {
                throw new AccesoDenegado(
                        "Acceso denegado: no puedes ver el pago de otro usuario.");
            }
        }

        return Optional.of(mapToDTO(pago));
    }

    public PagoResponseDTO procesarPago(PagoRequestDTO dto, String rol, Long idUsuarioLogueado) {

        boolean pedidoExiste = pedidoClient.verificarPedidoExiste(dto.getIdPedidoRef());

        if (!pedidoExiste) {
            throw new NotFound("El pedido con ID " + dto.getIdPedidoRef() + " no existe.");
        }

        // monto debe ser válido
        if (dto.getMontoTotal() == null || dto.getMontoTotal().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("El monto debe ser mayor a cero.");
        }

        // duplicados
        Optional<Pago> pagoExistente = pagoRepository.findByIdPedidoRef(dto.getIdPedidoRef());
        if (pagoExistente.isPresent() && "COMPLETADO".equals(pagoExistente.get().getEstadoPago())) {
            throw new RuntimeException("Este pedido ya se encuentra pagado.");
        }

        // AUTORIZACIÓN — USER solo puede pagar sus propios pedidos
        if ("USER".equals(rol)) {
            if (idUsuarioLogueado == null) {
                throw new AccesoDenegado("No se pudo identificar al usuario.");
            }
            boolean esPropietario = pedidoClient
                    .verificarPropietarioPedido(dto.getIdPedidoRef(), idUsuarioLogueado);
            if (!esPropietario) {
                throw new AccesoDenegado(
                        "Acceso denegado: no puedes pagar un pedido que no es tuyo.");
            }
        }

        Pago pago = new Pago();
        pago.setIdPedidoRef(dto.getIdPedidoRef());
        pago.setMontoTotal(dto.getMontoTotal());
        pago.setMetodoPago(dto.getMetodoPago());
        pago.setEstadoPago("COMPLETADO");

        return mapToDTO(pagoRepository.save(pago));
    }

    // Los empleados gestionan devoluciones o cancelaciones
    public PagoResponseDTO anularPago(Long idPago, String rol) {
        if (!"ADMIN".equals(rol) && !"EMPLEADO".equals(rol)) {
            throw new AccesoDenegado("Solo el personal de la tienda puede anular pagos.");
        }

        Pago pago = pagoRepository.findById(idPago)
                .orElseThrow(() -> new NotFound("Pago no encontrado"));

        pago.setEstadoPago("ANULADO");
        return mapToDTO(pagoRepository.save(pago));
    }

    public Optional<PagoResponseDTO> obtenerPorPedido(Long idPedidoRef, String rol) {
        return pagoRepository.findByIdPedidoRef(idPedidoRef).map(pago -> {
            if ("USER".equals(rol)) {
                // Validacion extra si aplica
            }
            return mapToDTO(pago);
        });
    }
}