package com.tiendatcg.ms_auth.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tiendatcg.ms_auth.dto.AuthRequestDTO;
import com.tiendatcg.ms_auth.dto.AuthResponseDTO;
import com.tiendatcg.ms_auth.service.AutenticacionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.hateoas.EntityModel;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

@Tag(name = "Autenticación", description = "Gestión de cuentas, login y vinculación de usuarios")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AutenticacionController {

        private final AutenticacionService authService;

        @Operation(summary = "Registrar nueva cuenta", description = "Crea una cuenta con rol USER.")
        @ApiResponses({
                        @ApiResponse(responseCode = "201", description = "Cuenta creada exitosamente"),
                        @ApiResponse(responseCode = "400", description = "Rol inválido o datos faltantes"),
                        @ApiResponse(responseCode = "403", description = "Intento de registrar con rol privilegiado"),
                        @ApiResponse(responseCode = "409", description = "Username ya en uso")
        })
        @PostMapping("/registrar")
        public ResponseEntity<EntityModel<AuthResponseDTO>> registrar(
                        @Valid @RequestBody AuthRequestDTO dto) {
                AuthResponseDTO creado = authService.registrar(dto);
                return ResponseEntity.status(201).body(
                                EntityModel.of(creado,
                                                linkTo(methodOn(AutenticacionController.class)
                                                                .validarToken("Bearer token"))
                                                                .withRel("validar-token")));
        }

        @Operation(summary = "Iniciar sesión", description = "Autentica credenciales y retorna un token JWT.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Login exitoso, token generado"),
                        @ApiResponse(responseCode = "403", description = "Contraseña incorrecta"),
                        @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
        })
        @PostMapping("/login")
        public ResponseEntity<EntityModel<AuthResponseDTO>> login(
                        @RequestBody Map<String, String> credenciales) {
                AuthResponseDTO resultado = authService.login(
                                credenciales.get("username"),
                                credenciales.get("password"));
                return ResponseEntity.ok(
                                EntityModel.of(resultado,
                                                linkTo(methodOn(AutenticacionController.class)
                                                                .validarToken("Bearer token"))
                                                                .withRel("validar-token")));
        }

        @Operation(summary = "Validar token JWT", description = "Verifica que el token sea válido.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Token válido"),
                        @ApiResponse(responseCode = "403", description = "Token inválido o expirado")
        })
        @GetMapping("/validar-token")
        public ResponseEntity<EntityModel<AuthResponseDTO>> validarToken(
                        @RequestHeader("Authorization") String token) {
                AuthResponseDTO resultado = authService.validarToken(token);
                return ResponseEntity.ok(
                                EntityModel.of(resultado,
                                                linkTo(methodOn(AutenticacionController.class)
                                                                .validarToken(token))
                                                                .withSelfRel()));
        }

        @Operation(summary = "Vincular cuenta a perfil", description = "Requiere rol ADMIN o EMPLEADO.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Vinculación exitosa"),
                        @ApiResponse(responseCode = "400", description = "idUsuarioRef obligatorio"),
                        @ApiResponse(responseCode = "403", description = "Rol no autorizado"),
                        @ApiResponse(responseCode = "404", description = "Cuenta no encontrada"),
                        @ApiResponse(responseCode = "502", description = "ms-usuarios no disponible")
        })
        @PutMapping("/vincular/{idAuth}")
        public ResponseEntity<EntityModel<AuthResponseDTO>> vincularUsuario(
                        @PathVariable Long idAuth,
                        @RequestBody Map<String, Long> body) {
                AuthResponseDTO resultado = authService.vincularUsuario(
                                idAuth, body.get("idUsuarioRef"));
                return ResponseEntity.ok(
                                EntityModel.of(resultado,
                                                linkTo(methodOn(AutenticacionController.class)
                                                                .validarToken("Bearer token"))
                                                                .withRel("validar-token")));
        }
}