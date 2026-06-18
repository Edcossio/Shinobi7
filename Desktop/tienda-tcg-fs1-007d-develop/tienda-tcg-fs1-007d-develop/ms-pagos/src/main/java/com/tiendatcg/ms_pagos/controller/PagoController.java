package com.tiendatcg.ms_pagos.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.tiendatcg.ms_pagos.dto.PagoRequestDTO;
import com.tiendatcg.ms_pagos.dto.PagoResponseDTO;
import com.tiendatcg.ms_pagos.service.PagoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

import java.util.List;

@Tag(name = "Pagos", description = "Gestión de pagos y anulaciones para pedidos TCG")
@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PagoController {

        private final PagoService pagoService;

        @Operation(summary = "Listar todos los pagos", description = "Solo ADMIN y EMPLEADO.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente"),
                        @ApiResponse(responseCode = "403", description = "Rol USER no autorizado")
        })
        @GetMapping
        public ResponseEntity<CollectionModel<EntityModel<PagoResponseDTO>>> obtenerTodos(
                        @RequestHeader("X-User-Rol") String rol) {
                List<EntityModel<PagoResponseDTO>> pagos = pagoService.obtenerTodos(rol)
                                .stream()
                                .map(dto -> EntityModel.of(dto,
                                                linkTo(methodOn(PagoController.class)
                                                                .obtenerPorId(dto.getIdPago(), rol, null))
                                                                .withSelfRel()))
                                .toList();
                return ResponseEntity.ok(
                                CollectionModel.of(pagos,
                                                linkTo(methodOn(PagoController.class)
                                                                .obtenerTodos(rol))
                                                                .withSelfRel()));
        }

        @Operation(summary = "Obtener pago por ID", description = "USER solo puede ver pagos de sus propios pedidos.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Pago encontrado"),
                        @ApiResponse(responseCode = "403", description = "Intento de ver pago ajeno"),
                        @ApiResponse(responseCode = "404", description = "Pago no encontrado")
        })
        @GetMapping("/{id}")
        public ResponseEntity<EntityModel<PagoResponseDTO>> obtenerPorId(
                        @PathVariable Long id,
                        @RequestHeader("X-User-Rol") String rol,
                        @RequestHeader(value = "X-User-Id", required = false) Long idUsuarioLogueado) {
                return pagoService.obtenerPorId(id, rol, idUsuarioLogueado)
                                .map(dto -> EntityModel.of(dto,
                                                linkTo(methodOn(PagoController.class)
                                                                .obtenerPorId(id, rol, idUsuarioLogueado))
                                                                .withSelfRel(),
                                                linkTo(methodOn(PagoController.class)
                                                                .obtenerTodos(rol))
                                                                .withRel("todos")))
                                .map(ResponseEntity::ok)
                                .orElse(ResponseEntity.notFound().build());
        }

        @Operation(summary = "Obtener pago por pedido", description = "Retorna el pago asociado a un pedido específico.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Pago encontrado"),
                        @ApiResponse(responseCode = "404", description = "No existe pago para ese pedido")
        })
        @GetMapping("/pedido/{idPedidoRef}")
        public ResponseEntity<EntityModel<PagoResponseDTO>> obtenerPorPedido(
                        @PathVariable Long idPedidoRef,
                        @RequestHeader("X-User-Rol") String rol) {
                return pagoService.obtenerPorPedido(idPedidoRef, rol)
                                .map(dto -> EntityModel.of(dto,
                                                linkTo(methodOn(PagoController.class)
                                                                .obtenerPorId(dto.getIdPago(), rol, null))
                                                                .withSelfRel(),
                                                linkTo(methodOn(PagoController.class)
                                                                .obtenerTodos(rol))
                                                                .withRel("todos")))
                                .map(ResponseEntity::ok)
                                .orElse(ResponseEntity.notFound().build());
        }

        @Operation(summary = "Procesar pago", description = "USER solo puede pagar sus propios pedidos.")
        @ApiResponses({
                        @ApiResponse(responseCode = "201", description = "Pago procesado exitosamente"),
                        @ApiResponse(responseCode = "400", description = "Monto inválido"),
                        @ApiResponse(responseCode = "403", description = "Intento de pagar pedido ajeno"),
                        @ApiResponse(responseCode = "404", description = "Pedido no encontrado"),
                        @ApiResponse(responseCode = "409", description = "Pedido ya fue pagado"),
                        @ApiResponse(responseCode = "502", description = "ms-pedidos no disponible")
        })
        @PostMapping
        public ResponseEntity<EntityModel<PagoResponseDTO>> procesarPago(
                        @RequestHeader("X-User-Rol") String rol,
                        @RequestHeader(value = "X-User-Id", required = false) Long idUsuarioLogueado,
                        @Valid @RequestBody PagoRequestDTO dto) {
                PagoResponseDTO creado = pagoService.procesarPago(dto, rol, idUsuarioLogueado);
                EntityModel<PagoResponseDTO> model = EntityModel.of(creado,
                                linkTo(methodOn(PagoController.class)
                                                .obtenerPorId(creado.getIdPago(), rol, idUsuarioLogueado))
                                                .withSelfRel(),
                                linkTo(methodOn(PagoController.class)
                                                .obtenerTodos(rol))
                                                .withRel("todos"));
                return ResponseEntity.status(201).body(model);
        }
}