package com.tiendatcg.ms_usuarios.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.tiendatcg.ms_usuarios.dto.UsuarioRequestDTO;
import com.tiendatcg.ms_usuarios.dto.UsuarioResponseDTO;
import com.tiendatcg.ms_usuarios.exception.AccesoDenegado;
import com.tiendatcg.ms_usuarios.exception.ApiException;
import com.tiendatcg.ms_usuarios.exception.NotFound;
import com.tiendatcg.ms_usuarios.model.Fidelidad;
import com.tiendatcg.ms_usuarios.model.Usuario;
import com.tiendatcg.ms_usuarios.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    private UsuarioResponseDTO mapToDTO(Usuario usuario) {
        return UsuarioResponseDTO.builder()
                .idPerfil(usuario.getIdPerfil())
                .nombreCompleto(usuario.getNombreCompleto())
                .correoElectronico(usuario.getCorreoElectronico())
                .direccionFisica(usuario.getDireccionFisica())
                .totalPuntos(usuario.getPuntos() != null ? usuario.getPuntos().getTotalPuntos() : 0)
                .categoriaVip(usuario.getPuntos() != null ? usuario.getPuntos().getCategoriaVip() : "N/A")
                .build();
    }

    private boolean esRolPermitido(String rolUsuario, String... roles) {
        if (rolUsuario == null)
            return false;
        for (String rol : roles) {
            if (rolUsuario.equalsIgnoreCase(rol)) {
                return true;
            }
        }
        return false;
    }

    // GET
    public List<UsuarioResponseDTO> obtenerTodos(String rol) {
        // Solo EMPLEADO o ADMIN pueden ver todos los usuarios
        if (!esRolPermitido(rol, "EMPLEADO", "ADMIN")) {
            throw new AccesoDenegado(
                    "Acceso denegado: solo empleados o administradores pueden listar todos los usuarios");
        }
        log.info("[MS-USUARIOS] Listando todos los usuarios. Rol: {}", rol);
        return usuarioRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public Optional<UsuarioResponseDTO> obtenerPorId(Long id, String rol, Long idUsuarioLogueado) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFound("Usuario no encontrado con ID: " + id));

        // ADMIN y EMPLEADO pueden ver cualquier perfil
        if (esRolPermitido(rol, "ADMIN", "EMPLEADO")) {
            return Optional.of(mapToDTO(usuario));
        }

        // USER solo puede ver su propio perfil
        if (esRolPermitido(rol, "USER")) {
            if (idUsuarioLogueado == null || !idUsuarioLogueado.equals(usuario.getIdPerfil())) {
                throw new AccesoDenegado("No tienes permisos para ver este perfil");
            }
            return Optional.of(mapToDTO(usuario));
        }

        // Cualquier otro rol no reconocido
        throw new AccesoDenegado("Rol no autorizado: " + rol);
    }

    // POST (crear) - solo EMPLEADO o ADMIN
    public UsuarioResponseDTO guardar(UsuarioRequestDTO dto, String rol) {
        if (!esRolPermitido(rol, "EMPLEADO", "ADMIN")) {
            throw new AccesoDenegado("Acceso denegado: solo empleados o administradores pueden crear usuarios");
        }

        // Validar correo unico
        if (usuarioRepository.findByCorreoElectronico(dto.getCorreoElectronico()).isPresent()) {
            throw new ApiException("Ya existe un usuario con ese email", HttpStatus.CONFLICT);
        }

        Usuario usuario = new Usuario();
        usuario.setNombreCompleto(dto.getNombreCompleto());
        usuario.setCorreoElectronico(dto.getCorreoElectronico());
        usuario.setDireccionFisica(dto.getDireccionFisica());

        Fidelidad tarjeta = new Fidelidad();
        tarjeta.setUsuario(usuario);
        tarjeta.setTotalPuntos(0);
        tarjeta.setCategoriaVip("NUEVO");
        usuario.setPuntos(tarjeta);

        log.info("[MS-USUARIOS] Usuario creado: correo={}", dto.getCorreoElectronico());
        return mapToDTO(usuarioRepository.save(usuario));
    }

    // PUT (actualizar)
    public Optional<UsuarioResponseDTO> actualizar(Long id, UsuarioRequestDTO dto, String rol, Long idUsuarioLogueado) {
        Usuario existente = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFound("Usuario no encontrado"));

        // USER solo puede actualizar su propio perfil y solo ciertos campos
        // DESPUÉS — lógica correcta, bloquea editar perfil AJENO
        if (esRolPermitido(rol, "USER")) {
            if (idUsuarioLogueado == null || !idUsuarioLogueado.equals(existente.getIdPerfil())) {
                throw new AccesoDenegado("Acceso denegado: no puedes actualizar otro usuario");
            }
            existente.setNombreCompleto(dto.getNombreCompleto());
            existente.setDireccionFisica(dto.getDireccionFisica());
        } else if (esRolPermitido(rol, "EMPLEADO", "ADMIN")) {
            // EMPLEADO/ADMIN pueden modificar todo excepto el correo
            existente.setNombreCompleto(dto.getNombreCompleto());
            existente.setDireccionFisica(dto.getDireccionFisica());
            // Opcional: permitir cambio de correo solo a ADMIN
            if (dto.getCorreoElectronico() != null
                    && !dto.getCorreoElectronico().equals(existente.getCorreoElectronico())) {
                if (esRolPermitido(rol, "ADMIN")) {
                    existente.setCorreoElectronico(dto.getCorreoElectronico());
                } else {
                    throw new AccesoDenegado("Solo administradores pueden cambiar el correo electrónico");
                }
            }
        } else {
            throw new AccesoDenegado("Acceso denegado: rol no autorizado");
        }
        log.info("[MS-USUARIOS] Usuario ID {} actualizado por rol {}", id, rol);
        return Optional.of(mapToDTO(usuarioRepository.save(existente)));
    }

    // DELETE - solo ADMIN
    public void eliminar(Long id, String rol) {
        if (!esRolPermitido(rol, "ADMIN")) {
            throw new AccesoDenegado("Acceso denegado: solo administradores pueden eliminar usuarios");
        }
        if (!usuarioRepository.existsById(id)) {
            throw new NotFound("Usuario no encontrado");
        }
        log.info("[MS-USUARIOS] Usuario ID {} eliminado por rol {}", id, rol);
        usuarioRepository.deleteById(id);
    }

    public boolean existePorId(Long id) {
        return usuarioRepository.existsById(id);
    }
}