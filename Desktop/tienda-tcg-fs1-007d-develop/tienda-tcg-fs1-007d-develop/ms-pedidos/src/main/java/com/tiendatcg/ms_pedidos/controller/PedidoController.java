package com.tiendatcg.ms_pedidos.controller;

import com.tiendatcg.ms_pedidos.DTO.PedidoRequestDTO;
import com.tiendatcg.ms_pedidos.DTO.PedidoResponseDTO;
import com.tiendatcg.ms_pedidos.service.PedidoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Pedidos", description = "Gestión de pedidos y validaciones internas para ms-pagos")
@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

        private final PedidoService pedidoService;

        @Operation(summary = "Listar todos los pedidos", description = "Solo ADMIN y EMPLEADO pueden ver el historial completo.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente"),
                        @ApiResponse(responseCode = "403", description = "Rol no autorizado")
        })
        @GetMapping
        public ResponseEntity<CollectionModel<EntityModel<PedidoResponseDTO>>> obtenerTodos(
                        @RequestHeader("X-User-Rol") String rol) {
                List<EntityModel<PedidoResponseDTO>> pedidos = pedidoService.obtenerTodos(rol)
                                .stream()
                                .map(dto -> EntityModel.of(dto,
                                                linkTo(methodOn(PedidoController.class)
                                                                .obtenerPorId(dto.getIdPedido(), rol, null))
                                                                .withSelfRel()))
                                .toList();
                return ResponseEntity.ok(
                                CollectionModel.of(pedidos,
                                                linkTo(methodOn(PedidoController.class)
                                                                .obtenerTodos(rol))
                                                                .withSelfRel()));
        }

        @Operation(summary = "Obtener pedido por ID", description = "USER solo puede ver sus propios pedidos.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Pedido encontrado"),
                        @ApiResponse(responseCode = "403", description = "Intento de ver pedido ajeno"),
                        @ApiResponse(responseCode = "404", description = "Pedido no encontrado")
        })
        @GetMapping("/{id}")
        public ResponseEntity<EntityModel<PedidoResponseDTO>> obtenerPorId(
                        @PathVariable Long id,
                        @RequestHeader("X-User-Rol") String rol,
                        @RequestHeader(value = "X-User-Id", required = false) Long idUsuarioLogueado) {
                return pedidoService.obtenerPorId(id, rol, idUsuarioLogueado)
                                .map(dto -> EntityModel.of(dto,
                                                linkTo(methodOn(PedidoController.class)
                                                                .obtenerPorId(id, rol, idUsuarioLogueado))
                                                                .withSelfRel(),
                                                linkTo(methodOn(PedidoController.class)
                                                                .obtenerTodos(rol))
                                                                .withRel("todos")))
                                .map(ResponseEntity::ok)
                                .orElse(ResponseEntity.notFound().build());
        }

        @Operation(summary = "Listar pedidos por usuario", description = "USER solo puede ver sus propios pedidos.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente"),
                        @ApiResponse(responseCode = "403", description = "Intento de ver pedidos de otro usuario")
        })
        @GetMapping("/usuario/{idUsuario}")
        public ResponseEntity<CollectionModel<EntityModel<PedidoResponseDTO>>> obtenerPorUsuario(
                        @PathVariable Long idUsuario,
                        @RequestHeader("X-User-Rol") String rol,
                        @RequestHeader(value = "X-User-Id", required = false) Long idUsuarioLogueado) {
                List<EntityModel<PedidoResponseDTO>> pedidos = pedidoService
                                .obtenerPorUsuario(idUsuario, rol, idUsuarioLogueado)
                                .stream()
                                .map(dto -> EntityModel.of(dto,
                                                linkTo(methodOn(PedidoController.class)
                                                                .obtenerPorId(dto.getIdPedido(), rol,
                                                                                idUsuarioLogueado))
                                                                .withSelfRel()))
                                .toList();
                return ResponseEntity.ok(
                                CollectionModel.of(pedidos,
                                                linkTo(methodOn(PedidoController.class)
                                                                .obtenerPorUsuario(idUsuario, rol, idUsuarioLogueado))
                                                                .withSelfRel()));
        }

        @Operation(summary = "Crear pedido", description = "Verifica existencia de usuario, carta y stock antes de crear.")
        @ApiResponses({
                        @ApiResponse(responseCode = "201", description = "Pedido creado exitosamente"),
                        @ApiResponse(responseCode = "403", description = "USER intenta crear pedido para otro usuario"),
                        @ApiResponse(responseCode = "404", description = "Carta no encontrada en catálogo"),
                        @ApiResponse(responseCode = "409", description = "Stock insuficiente"),
                        @ApiResponse(responseCode = "502", description = "ms-catalogo o ms-inventario no disponible")
        })
        @PostMapping
        public ResponseEntity<EntityModel<PedidoResponseDTO>> crear(
                        @Valid @RequestBody PedidoRequestDTO dto,
                        @RequestHeader("X-User-Rol") String rol,
                        @RequestHeader(value = "X-User-Id", required = false) Long idUsuarioLogueado) {
                PedidoResponseDTO creado = pedidoService.crear(dto, rol, idUsuarioLogueado);
                EntityModel<PedidoResponseDTO> model = EntityModel.of(creado,
                                linkTo(methodOn(PedidoController.class)
                                                .obtenerPorId(creado.getIdPedido(), rol, idUsuarioLogueado))
                                                .withSelfRel(),
                                linkTo(methodOn(PedidoController.class)
                                                .obtenerTodos(rol))
                                                .withRel("todos"));
                return ResponseEntity.status(201).body(model);
        }

        @Operation(summary = "Cambiar estado del pedido", description = "Solo ADMIN y EMPLEADO pueden cambiar el estado.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Estado actualizado"),
                        @ApiResponse(responseCode = "400", description = "Estado inválido"),
                        @ApiResponse(responseCode = "403", description = "Rol no autorizado"),
                        @ApiResponse(responseCode = "404", description = "Pedido no encontrado")
        })
        @PatchMapping("/{id}/estado")
        public ResponseEntity<EntityModel<PedidoResponseDTO>> cambiarEstado(
                        @PathVariable Long id,
                        @RequestBody Map<String, String> body,
                        @RequestHeader("X-User-Rol") String rol) {
                PedidoResponseDTO actualizado = pedidoService.cambiarEstado(id, body.get("estado"), rol);
                return ResponseEntity.ok(EntityModel.of(actualizado,
                                linkTo(methodOn(PedidoController.class)
                                                .obtenerPorId(id, rol, null))
                                                .withSelfRel()));
        }

        @Operation(summary = "Cancelar pedido", description = "Solo cancelable si está en PENDIENTE o CONFIRMADO.")
        @ApiResponses({
                        @ApiResponse(responseCode = "204", description = "Pedido cancelado"),
                        @ApiResponse(responseCode = "403", description = "Intento de cancelar pedido ajeno"),
                        @ApiResponse(responseCode = "404", description = "Pedido no encontrado"),
                        @ApiResponse(responseCode = "409", description = "Estado no permite cancelación")
        })
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> cancelar(
                        @PathVariable Long id,
                        @RequestHeader("X-User-Rol") String rol,
                        @RequestHeader(value = "X-User-Id", required = false) Long idUsuarioLogueado) {
                pedidoService.cancelar(id, rol, idUsuarioLogueado);
                return ResponseEntity.noContent().build();
        }

        @Operation(summary = "Validar existencia de pedido", description = "Endpoint interno usado por ms-pagos.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Retorna true si existe, false si no")
        })
        @GetMapping("/validar-envio/{idPedido}")
        public ResponseEntity<Boolean> validarEnvio(@PathVariable Long idPedido) {
                return ResponseEntity.ok(pedidoService.verificarPedidoExiste(idPedido));
        }

        @Operation(summary = "Validar propietario del pedido", description = "Endpoint interno usado por ms-pagos.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Retorna true si el usuario es propietario")
        })
        @GetMapping("/validar-propietario/{idPedido}/{idUsuario}")
        public ResponseEntity<Boolean> validarPropietario(
                        @PathVariable Long idPedido,
                        @PathVariable Long idUsuario) {
                return ResponseEntity.ok(
                                pedidoService.verificarPropietario(idPedido, idUsuario));
        }
}