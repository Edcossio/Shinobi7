package com.tiendatcg.ms_precios.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.tiendatcg.ms_precios.dto.PrecioRequestDTO;
import com.tiendatcg.ms_precios.dto.PrecioResponseDTO;
import com.tiendatcg.ms_precios.service.PrecioService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

@Tag(name = "Precios", description = "Gestión del historial de precios de mercado por carta TCG")
@RestController
@RequestMapping("/api/precios")
@RequiredArgsConstructor
public class PrecioController {

        private final PrecioService precioService;

        @Operation(summary = "Listar todos los precios", description = "Accesible por USER, EMPLEADO y ADMIN.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente"),
                        @ApiResponse(responseCode = "403", description = "Rol no autorizado")
        })
        @GetMapping
        public ResponseEntity<CollectionModel<EntityModel<PrecioResponseDTO>>> obtenerTodos(
                        @RequestHeader("X-User-Rol") String rol) {
                List<EntityModel<PrecioResponseDTO>> precios = precioService.obtenerTodos(rol)
                                .stream()
                                .map(dto -> EntityModel.of(dto,
                                                linkTo(methodOn(PrecioController.class)
                                                                .obtenerPorId(dto.getIdPrecio(), rol))
                                                                .withSelfRel()))
                                .toList();
                return ResponseEntity.ok(
                                CollectionModel.of(precios,
                                                linkTo(methodOn(PrecioController.class)
                                                                .obtenerTodos(rol))
                                                                .withSelfRel()));
        }

        @Operation(summary = "Obtener precio por ID", description = "Accesible por USER, EMPLEADO y ADMIN.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Precio encontrado"),
                        @ApiResponse(responseCode = "403", description = "Rol no autorizado"),
                        @ApiResponse(responseCode = "404", description = "Precio no encontrado")
        })
        @GetMapping("/{id}")
        public ResponseEntity<EntityModel<PrecioResponseDTO>> obtenerPorId(
                        @PathVariable Long id,
                        @RequestHeader("X-User-Rol") String rol) {
                return precioService.obtenerPorId(id, rol)
                                .map(dto -> EntityModel.of(dto,
                                                linkTo(methodOn(PrecioController.class)
                                                                .obtenerPorId(id, rol))
                                                                .withSelfRel(),
                                                linkTo(methodOn(PrecioController.class)
                                                                .obtenerHistorialPorCarta(dto.getIdCartaRef(), rol))
                                                                .withRel("historial-carta"),
                                                linkTo(methodOn(PrecioController.class)
                                                                .obtenerTodos(rol))
                                                                .withRel("todos")))
                                .map(ResponseEntity::ok)
                                .orElse(ResponseEntity.notFound().build());
        }

        @Operation(summary = "Historial de precios por carta", description = "Retorna todos los registros de precio de una carta.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Historial obtenido exitosamente"),
                        @ApiResponse(responseCode = "403", description = "Rol no autorizado")
        })
        @GetMapping("/carta/{idCarta}")
        public ResponseEntity<CollectionModel<EntityModel<PrecioResponseDTO>>> obtenerHistorialPorCarta(
                        @PathVariable Long idCarta,
                        @RequestHeader("X-User-Rol") String rol) {
                List<EntityModel<PrecioResponseDTO>> historial = precioService.obtenerHistorialPorCarta(idCarta, rol)
                                .stream()
                                .map(dto -> EntityModel.of(dto,
                                                linkTo(methodOn(PrecioController.class)
                                                                .obtenerPorId(dto.getIdPrecio(), rol))
                                                                .withSelfRel()))
                                .toList();
                return ResponseEntity.ok(
                                CollectionModel.of(historial,
                                                linkTo(methodOn(PrecioController.class)
                                                                .obtenerHistorialPorCarta(idCarta, rol))
                                                                .withSelfRel()));
        }

        @Operation(summary = "Registrar nuevo precio", description = "Solo EMPLEADO y ADMIN.")
        @ApiResponses({
                        @ApiResponse(responseCode = "201", description = "Precio registrado exitosamente"),
                        @ApiResponse(responseCode = "403", description = "Rol no autorizado"),
                        @ApiResponse(responseCode = "404", description = "Carta no encontrada en catálogo"),
                        @ApiResponse(responseCode = "502", description = "ms-catalogo no disponible")
        })
        @PostMapping
        public ResponseEntity<EntityModel<PrecioResponseDTO>> crear(
                        @Valid @RequestBody PrecioRequestDTO dto,
                        @RequestHeader("X-User-Rol") String rol) {
                PrecioResponseDTO creado = precioService.guardar(dto, rol);
                EntityModel<PrecioResponseDTO> model = EntityModel.of(creado,
                                linkTo(methodOn(PrecioController.class)
                                                .obtenerPorId(creado.getIdPrecio(), rol))
                                                .withSelfRel(),
                                linkTo(methodOn(PrecioController.class)
                                                .obtenerHistorialPorCarta(creado.getIdCartaRef(), rol))
                                                .withRel("historial-carta"));
                return ResponseEntity.status(201).body(model);
        }

        @Operation(summary = "Actualizar precio", description = "Solo EMPLEADO y ADMIN.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Precio actualizado"),
                        @ApiResponse(responseCode = "403", description = "Rol no autorizado"),
                        @ApiResponse(responseCode = "404", description = "Precio no encontrado")
        })
        @PutMapping("/{id}")
        public ResponseEntity<EntityModel<PrecioResponseDTO>> actualizar(
                        @PathVariable Long id,
                        @Valid @RequestBody PrecioRequestDTO dto,
                        @RequestHeader("X-User-Rol") String rol) {
                return precioService.actualizar(id, dto, rol)
                                .map(actualizado -> EntityModel.of(actualizado,
                                                linkTo(methodOn(PrecioController.class)
                                                                .obtenerPorId(id, rol))
                                                                .withSelfRel(),
                                                linkTo(methodOn(PrecioController.class)
                                                                .obtenerTodos(rol))
                                                                .withRel("todos")))
                                .map(ResponseEntity::ok)
                                .orElse(ResponseEntity.notFound().build());
        }

        @Operation(summary = "Eliminar precio", description = "Solo ADMIN puede eliminar registros de precio.")
        @ApiResponses({
                        @ApiResponse(responseCode = "204", description = "Precio eliminado"),
                        @ApiResponse(responseCode = "403", description = "Rol no autorizado"),
                        @ApiResponse(responseCode = "404", description = "Precio no encontrado")
        })
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> eliminar(
                        @PathVariable Long id,
                        @RequestHeader("X-User-Rol") String rol) {
                precioService.eliminar(id, rol);
                return ResponseEntity.noContent().build();
        }
}