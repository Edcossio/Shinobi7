package com.tiendatcg.ms_usuarios.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.tiendatcg.ms_usuarios.dto.UsuarioRequestDTO;
import com.tiendatcg.ms_usuarios.dto.UsuarioResponseDTO;
import com.tiendatcg.ms_usuarios.exception.AccesoDenegado;
import com.tiendatcg.ms_usuarios.exception.ApiException;
import com.tiendatcg.ms_usuarios.exception.NotFound;
import com.tiendatcg.ms_usuarios.model.Usuario;
import com.tiendatcg.ms_usuarios.repository.UsuarioRepository;

import net.datafaker.Faker;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitarios — UsuarioService")
class UsuarioServiceTest {

    @Mock
    UsuarioRepository usuarioRepository;
    @InjectMocks
    UsuarioService usuarioService;

    Faker faker = new Faker();

    private Usuario buildUsuario() {
        Usuario u = new Usuario();
        u.setIdPerfil(faker.number().randomNumber());
        u.setNombreCompleto(faker.name().fullName());
        u.setCorreoElectronico(faker.internet().emailAddress());
        u.setDireccionFisica(faker.address().fullAddress());
        return u;
    }

    private UsuarioRequestDTO buildRequestDTO() {
        UsuarioRequestDTO dto = new UsuarioRequestDTO();
        dto.setNombreCompleto(faker.name().fullName());
        dto.setCorreoElectronico(faker.internet().emailAddress());
        dto.setDireccionFisica(faker.address().fullAddress());
        return dto;
    }

    //obtenerTodos

    @Test
    @DisplayName("debería retornar lista de usuarios cuando el rol es ADMIN")
    void shouldReturnUsuarioListWhenRolIsAdmin() {
        // Given
        List<Usuario> usuarios = List.of(buildUsuario(), buildUsuario());
        given(usuarioRepository.findAll()).willReturn(usuarios);

        // When
        List<UsuarioResponseDTO> resultado = usuarioService.obtenerTodos("ADMIN");

        // Then
        assertThat(resultado).hasSize(2);
        verify(usuarioRepository).findAll();
    }

    @Test
    @DisplayName("debería lanzar AccesoDenegado cuando USER intenta listar todos")
    void shouldThrowAccesoDenegadoWhenUserTriesToListAll() {
        // Given / When / Then
        assertThatThrownBy(() -> usuarioService.obtenerTodos("USER"))
                .isInstanceOf(AccesoDenegado.class);

        verify(usuarioRepository, never()).findAll();
    }

    //obtenerPorId
    @Test
    @DisplayName("debería retornar usuario cuando ADMIN busca por ID")
    void shouldReturnUsuarioWhenAdminSearchesById() {
        // Given
        Usuario usuario = buildUsuario();
        given(usuarioRepository.findById(usuario.getIdPerfil()))
                .willReturn(Optional.of(usuario));

        // When
        Optional<UsuarioResponseDTO> resultado = usuarioService.obtenerPorId(usuario.getIdPerfil(), "ADMIN", null);

        // Then
        assertThat(resultado).isPresent();
        assertThat(resultado.get().getCorreoElectronico())
                .isEqualTo(usuario.getCorreoElectronico());
    }

    @Test
    @DisplayName("debería lanzar RecursoNoEncontrado cuando el usuario no existe")
    void shouldThrowRecursoNoEncontradoWhenUserDoesNotExist() {
        // Given
        Long idInexistente = faker.number().randomNumber();
        given(usuarioRepository.findById(idInexistente)).willReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> usuarioService.obtenerPorId(idInexistente, "ADMIN", null))
                .isInstanceOf(NotFound.class)
                .hasMessageContaining(String.valueOf(idInexistente));
    }

    @Test
    @DisplayName("debería lanzar AccesoDenegado cuando USER intenta ver perfil ajeno")
    void shouldThrowAccesoDenegadoWhenUserTriesToViewAnotherProfile() {
        // Given
        Usuario usuario = buildUsuario();
        Long idOtroUsuario = usuario.getIdPerfil() + 99L;

        given(usuarioRepository.findById(usuario.getIdPerfil()))
                .willReturn(Optional.of(usuario));

        // When / Then
        assertThatThrownBy(() -> usuarioService.obtenerPorId(usuario.getIdPerfil(), "USER", idOtroUsuario))
                .isInstanceOf(AccesoDenegado.class)
                .hasMessageContaining("perfil");
    }

    @Test
    @DisplayName("debería retornar perfil cuando USER consulta su propio ID")
    void shouldReturnProfileWhenUserQueriesOwnId() {
        // Given
        Usuario usuario = buildUsuario();
        given(usuarioRepository.findById(usuario.getIdPerfil()))
                .willReturn(Optional.of(usuario));

        // When
        Optional<UsuarioResponseDTO> resultado = usuarioService.obtenerPorId(
                usuario.getIdPerfil(), "USER", usuario.getIdPerfil());

        // Then
        assertThat(resultado).isPresent();
    }

    //guardar
    @Test
    @DisplayName("debería crear usuario exitosamente cuando el email no existe")
    void shouldCreateUsuarioSuccessfullyWhenEmailDoesNotExist() {
        // Given
        UsuarioRequestDTO dto = buildRequestDTO();
        Usuario guardado = buildUsuario();
        guardado.setCorreoElectronico(dto.getCorreoElectronico());

        given(usuarioRepository.findByCorreoElectronico(dto.getCorreoElectronico()))
                .willReturn(Optional.empty());
        given(usuarioRepository.save(any())).willReturn(guardado);

        // When
        UsuarioResponseDTO resultado = usuarioService.guardar(dto, "ADMIN");

        // Then
        assertThat(resultado).isNotNull();
        verify(usuarioRepository).save(any(Usuario.class));
    }

    @Test
    @DisplayName("debería lanzar ApiException 409 cuando el email ya está registrado")
    void shouldThrowApiExceptionWhenEmailAlreadyExists() {
        // Given
        UsuarioRequestDTO dto = buildRequestDTO();
        given(usuarioRepository.findByCorreoElectronico(dto.getCorreoElectronico()))
                .willReturn(Optional.of(buildUsuario()));

        // When / Then
        assertThatThrownBy(() -> usuarioService.guardar(dto, "ADMIN"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("email");

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("debería lanzar AccesoDenegado cuando USER intenta crear un usuario")
    void shouldThrowAccesoDenegadoWhenUserTriesToCreateUsuario() {
        // Given
        UsuarioRequestDTO dto = buildRequestDTO();

        // When / Then
        assertThatThrownBy(() -> usuarioService.guardar(dto, "USER"))
                .isInstanceOf(AccesoDenegado.class);

        verify(usuarioRepository, never()).save(any());
    }

    // eliminar
    @Test
    @DisplayName("debería lanzar RecursoNoEncontrado al eliminar usuario inexistente")
    void shouldThrowRecursoNoEncontradoWhenDeletingNonExistentUser() {
        // Given
        Long idInexistente = faker.number().randomNumber();
        given(usuarioRepository.existsById(idInexistente)).willReturn(false);

        // When / Then
        assertThatThrownBy(() -> usuarioService.eliminar(idInexistente, "ADMIN"))
                .isInstanceOf(NotFound.class);

        verify(usuarioRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("debería lanzar AccesoDenegado cuando EMPLEADO intenta eliminar un usuario")
    void shouldThrowAccesoDenegadoWhenEmpleadoTriesToDeleteUsuario() {
        // Given
        Long id = faker.number().randomNumber();
        // Sin stub — lanza AccesoDenegado antes de consultar el repositorio

        // When / Then
        assertThatThrownBy(() -> usuarioService.eliminar(id, "EMPLEADO"))
                .isInstanceOf(AccesoDenegado.class);

        verify(usuarioRepository, never()).deleteById(any());
    }
}