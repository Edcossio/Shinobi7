package com.tiendatcg.ms_auth.service;

import com.tiendatcg.ms_auth.exception.ApiException;
import com.tiendatcg.ms_auth.exception.AccesoDenegado;
import com.tiendatcg.ms_auth.exception.NotFound;
import com.tiendatcg.ms_auth.exception.DependenciaFallida;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.tiendatcg.ms_auth.client.UsuarioClient;
import com.tiendatcg.ms_auth.dto.AuthRequestDTO;
import com.tiendatcg.ms_auth.dto.AuthResponseDTO;
import com.tiendatcg.ms_auth.model.Autenticacion;
import com.tiendatcg.ms_auth.repository.AuthRepository;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AutenticacionService {

    private static final java.util.Set<String> ROLES_PERMITIDOS = java.util.Set.of("USER", "EMPLEADO", "ADMIN");

    private final AuthRepository repository;
    private final BCryptPasswordEncoder encoder;
    private final UsuarioClient usuarioClient;
    private final JwtService jwtService;

    // Map
    private AuthResponseDTO mapToDTO(Autenticacion user, String token) {
        return new AuthResponseDTO(
                user.getIdAuth(),
                user.getIdUsuarioRef(),
                user.getUsername(),
                user.getRol(),
                token);
    }

    // Registrar
    public AuthResponseDTO registrar(AuthRequestDTO dto) {

        String rolSolicitado = dto.getRol() != null
                ? dto.getRol().toUpperCase().trim()
                : "";

        if (!ROLES_PERMITIDOS.contains(rolSolicitado)) {
            throw new ApiException("Rol inválido. Los roles permitidos son: " + ROLES_PERMITIDOS,
                    org.springframework.http.HttpStatus.BAD_REQUEST);
        }

        if ("ADMIN".equals(rolSolicitado) || "EMPLEADO".equals(rolSolicitado)) {
            throw new AccesoDenegado("No tienes permisos para registrar un usuario con ese rol.");
        }

        if (repository.findByUsername(dto.getUsername()).isPresent()) {
            throw new ApiException("El nombre de usuario ya está en uso.",
                    org.springframework.http.HttpStatus.CONFLICT);
        }

        Autenticacion user = new Autenticacion();
        user.setIdUsuarioRef(dto.getIdUsuarioRef());
        user.setUsername(dto.getUsername());
        user.setPassword(encoder.encode(dto.getPassword()));
        user.setRol(rolSolicitado);

        log.info("[MS-AUTH] Nueva cuenta registrada: username={} rol={}",
                dto.getUsername(), rolSolicitado);
        return mapToDTO(repository.save(user), null);
    }

    // Login
    public AuthResponseDTO login(String username, String password) {
        Autenticacion user = repository.findByUsername(username)
                .orElseThrow(() -> new NotFound("Usuario no encontrado en el sistema"));

        if (!encoder.matches(password, user.getPassword())) {
            log.warn("[MS-AUTH] Intento de login fallido para username={}", username);
            throw new AccesoDenegado("La contraseña ingresada es incorrecta");
        }

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("rol", user.getRol());
        extraClaims.put("idUsuarioRef", user.getIdUsuarioRef());

        String token = jwtService.generarToken(extraClaims, user.getUsername());

        log.info("[MS-AUTH] Login exitoso: username={} rol={}", user.getUsername(), user.getRol());
        return mapToDTO(user, token);
    }

    // Validar Token
    public AuthResponseDTO validarToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new AccesoDenegado("Token no proporcionado");
        }

        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        try {
            String username = jwtService.extraerUsername(token);

            Autenticacion user = repository.findByUsername(username)
                    .orElseThrow(() -> new NotFound("Usuario no encontrado para el token"));

            log.debug("[MS-AUTH] Token validado para username={}", username);
            return mapToDTO(user, token);

        } catch (NotFound e) {
            throw e;
        } catch (Exception e) {
            log.warn("[MS-AUTH] Token inválido o expirado: {}", e.getMessage());
            throw new AccesoDenegado("Token inválido o expirado");
        }
    }

    // Vincular Usuario
    public AuthResponseDTO vincularUsuario(Long idAuth, Long idUsuarioRef) {
        if (idUsuarioRef == null) {
            throw new ApiException("El idUsuarioRef es obligatorio para vincular.",
                    org.springframework.http.HttpStatus.BAD_REQUEST);
        }

        Autenticacion user = repository.findById(idAuth)
                .orElseThrow(() -> new NotFound(
                        "Cuenta de autenticación no encontrada con ID: " + idAuth));

        boolean existe;
        try {
            existe = usuarioClient.verificarExistencia(idUsuarioRef);
        } catch (Exception e) {
            log.error("[MS-AUTH] ms-usuarios no disponible al verificar ID {}: {}",
                    idUsuarioRef, e.getMessage());
            throw new DependenciaFallida(
                    "No se pudo verificar el usuario con ID " + idUsuarioRef
                            + " en ms-usuarios.");
        }

        if (!existe) {
            log.error("[MS-AUTH] Fallback activado: ms-usuarios retornó false para ID {}",
                    idUsuarioRef);
            throw new DependenciaFallida(
                    "No se pudo verificar el usuario con ID " + idUsuarioRef
                            + " en ms-usuarios.");
        }

        user.setIdUsuarioRef(idUsuarioRef);
        log.info("[MS-AUTH] Cuenta ID {} vinculada a usuario ID {}", idAuth, idUsuarioRef);
        return mapToDTO(repository.save(user), null);
    }

}