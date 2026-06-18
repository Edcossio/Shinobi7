package com.tiendatcg.ms_usuarios.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tiendatcg.ms_usuarios.dto.UsuarioRequestDTO;
import com.tiendatcg.ms_usuarios.dto.UsuarioResponseDTO;
import com.tiendatcg.ms_usuarios.service.UsuarioService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

@Tag(name = "Usuarios", description = "Gestión de perfiles de usuario y validación interna")
@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

        private final UsuarioService usuarioService;

        @Operation(summary = "Listar todos los usuarios", description = "Solo ADMIN y EMPLEADO pueden listar todos los perfiles.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente"),
                        @ApiResponse(responseCode = "403", description = "Rol no autorizado")
        })
        @GetMapping
        public ResponseEntity<CollectionModel<EntityModel<UsuarioResponseDTO>>> obtenerTodos(
                        @RequestHeader("X-User-Rol") String rol) {
                List<EntityModel<UsuarioResponseDTO>> usuarios = usuarioService.obtenerTodos(rol)
                                .stream()
                                .map(dto -> EntityModel.of(dto,
                                                linkTo(methodOn(UsuarioController.class)
                                                                .obtenerPorId(dto.getIdPerfil(), rol, null))
                                                                .withSelfRel()))
                                .toList();
                return ResponseEntity.ok(
                                CollectionModel.of(usuarios,
                                                linkTo(methodOn(UsuarioController.class)
                                                                .obtenerTodos(rol))
                                                                .withSelfRel()));
        }

        @Operation(summary = "Obtener usuario por ID", description = "ADMIN y EMPLEADO ven cualquier perfil. USER solo ve el suyo.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Usuario encontrado"),
                        @ApiResponse(responseCode = "403", description = "Intento de ver perfil ajeno"),
                        @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
        })
        @GetMapping("/{id}")
        public ResponseEntity<EntityModel<UsuarioResponseDTO>> obtenerPorId(
                        @PathVariable Long id,
                        @RequestHeader("X-User-Rol") String rol,
                        @RequestHeader(value = "X-User-Id", required = false) Long idUsuarioLogueado) {
                return usuarioService.obtenerPorId(id, rol, idUsuarioLogueado)
                                .map(dto -> EntityModel.of(dto,
                                                linkTo(methodOn(UsuarioController.class)
                                                                .obtenerPorId(id, rol, idUsuarioLogueado))
                                                                .withSelfRel(),
                                                linkTo(methodOn(UsuarioController.class)
                                                                .obtenerTodos(rol))
                                                                .withRel("todos")))
                                .map(ResponseEntity::ok)
                                .orElse(ResponseEntity.notFound().build());
        }

        @Operation(summary = "Crear usuario", description = "Solo ADMIN y EMPLEADO pueden crear perfiles.")
        @ApiResponses({
                        @ApiResponse(responseCode = "201", description = "Usuario creado exitosamente"),
                        @ApiResponse(responseCode = "403", description = "Rol no autorizado"),
                        @ApiResponse(responseCode = "409", description = "Email ya registrado")
        })
        @PostMapping
        public ResponseEntity<EntityModel<UsuarioResponseDTO>> crear(
                        @Valid @RequestBody UsuarioRequestDTO dto,
                        @RequestHeader("X-User-Rol") String rol) {
                UsuarioResponseDTO creado = usuarioService.guardar(dto, rol);
                EntityModel<UsuarioResponseDTO> model = EntityModel.of(creado,
                                linkTo(methodOn(UsuarioController.class)
                                                .obtenerPorId(creado.getIdPerfil(), rol, null))
                                                .withSelfRel());
                return ResponseEntity.status(201).body(model);
        }

        @Operation(summary = "Actualizar usuario", description = "USER solo puede editar su propio perfil. ADMIN puede modificar todo.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Usuario actualizado"),
                        @ApiResponse(responseCode = "403", description = "Intento de editar perfil ajeno"),
                        @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
        })
        @PutMapping("/{id}")
        public ResponseEntity<EntityModel<UsuarioResponseDTO>> actualizar(
                        @PathVariable Long id,
                        @Valid @RequestBody UsuarioRequestDTO dto,
                        @RequestHeader("X-User-Rol") String rol,
                        @RequestHeader(value = "X-User-Id", required = false) Long idUsuarioLogueado) {
                return usuarioService.actualizar(id, dto, rol, idUsuarioLogueado)
                                .map(actualizado -> EntityModel.of(actualizado,
                                                linkTo(methodOn(UsuarioController.class)
                                                                .obtenerPorId(id, rol, idUsuarioLogueado))
                                                                .withSelfRel(),
                                                linkTo(methodOn(UsuarioController.class)
                                                                .obtenerTodos(rol))
                                                                .withRel("todos")))
                                .map(ResponseEntity::ok)
                                .orElse(ResponseEntity.notFound().build());
        }

        @Operation(summary = "Eliminar usuario", description = "Solo ADMIN puede eliminar perfiles.")
        @ApiResponses({
                        @ApiResponse(responseCode = "204", description = "Usuario eliminado"),
                        @ApiResponse(responseCode = "403", description = "Rol no autorizado"),
                        @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
        })
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> eliminar(
                        @PathVariable Long id,
                        @RequestHeader("X-User-Rol") String rol) {
                usuarioService.eliminar(id, rol);
                return ResponseEntity.noContent().build();
        }

        @Operation(summary = "Validar existencia de usuario", description = "Endpoint interno usado por ms-auth.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Retorna true si existe, false si no")
        })
        @GetMapping("/validar-user/{id}")
        public ResponseEntity<Boolean> validarUser(@PathVariable Long id) {
                return ResponseEntity.ok(usuarioService.existePorId(id));
        }
}