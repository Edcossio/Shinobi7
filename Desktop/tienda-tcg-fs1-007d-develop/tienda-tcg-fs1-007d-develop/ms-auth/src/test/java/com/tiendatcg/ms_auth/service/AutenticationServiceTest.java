package com.tiendatcg.ms_auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.tiendatcg.ms_auth.client.UsuarioClient;
import com.tiendatcg.ms_auth.dto.AuthRequestDTO;
import com.tiendatcg.ms_auth.dto.AuthResponseDTO;
import com.tiendatcg.ms_auth.exception.AccesoDenegado;
import com.tiendatcg.ms_auth.exception.ApiException;
import com.tiendatcg.ms_auth.exception.DependenciaFallida;
import com.tiendatcg.ms_auth.exception.NotFound;
import com.tiendatcg.ms_auth.model.Autenticacion;
import com.tiendatcg.ms_auth.repository.AuthRepository;

import net.datafaker.Faker;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitarios — AutenticacionService")
class AutenticationServiceTest {

    @Mock AuthRepository repository;
    @Mock BCryptPasswordEncoder encoder;
    @Mock UsuarioClient usuarioClient;
    @Mock JwtService jwtService;
    @InjectMocks AutenticacionService autenticacionService;

    Faker faker = new Faker();

    private Autenticacion buildAutenticacion(String rol) {
        Autenticacion auth = new Autenticacion();
        auth.setIdAuth(faker.number().randomNumber());
        auth.setUsername(faker.internet().emailAddress());
        auth.setPassword(faker.internet().password(8, 16));
        auth.setRol(rol);
        auth.setIdUsuarioRef(faker.number().randomNumber());
        return auth;
    }

    //registrar

    @Test
    @DisplayName("debería registrar cuenta USER exitosamente")
    void shouldRegisterUserAccountSuccessfully() {
        // Given
        AuthRequestDTO dto = new AuthRequestDTO();
        dto.setUsername(faker.internet().emailAddress());
        dto.setPassword(faker.internet().password(8, 16));
        dto.setRol("USER");

        Autenticacion guardado = buildAutenticacion("USER");
        guardado.setUsername(dto.getUsername());

        given(repository.findByUsername(dto.getUsername())).willReturn(Optional.empty());
        given(encoder.encode(dto.getPassword())).willReturn("hashed_password");
        given(repository.save(any())).willReturn(guardado);

        // When
        AuthResponseDTO resultado = autenticacionService.registrar(dto);

        // Then
        assertThat(resultado).isNotNull();
        assertThat(resultado.getRol()).isEqualTo("USER");
        verify(repository).save(any(Autenticacion.class));
    }

    @Test
    @DisplayName("debería lanzar ApiException 400 cuando el rol es inválido")
    void shouldThrowApiExceptionWhenRolIsInvalid() {
        // Given
        AuthRequestDTO dto = new AuthRequestDTO();
        dto.setUsername(faker.internet().emailAddress());
        dto.setPassword(faker.internet().password(8, 16));
        dto.setRol("SUPERHEROE");

        // When / Then
        assertThatThrownBy(() -> autenticacionService.registrar(dto))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Rol inválido");

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("debería lanzar AccesoDenegado cuando intenta registrar con rol ADMIN")
    void shouldThrowAccesoDenegadoWhenRegisteringWithAdminRol() {
        // Given
        AuthRequestDTO dto = new AuthRequestDTO();
        dto.setUsername(faker.internet().emailAddress());
        dto.setPassword(faker.internet().password(8, 16));
        dto.setRol("ADMIN");

        // When / Then
        assertThatThrownBy(() -> autenticacionService.registrar(dto))
                .isInstanceOf(AccesoDenegado.class)
                .hasMessageContaining("permisos");

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("debería lanzar ApiException 409 cuando el username ya existe")
    void shouldThrowApiExceptionWhenUsernameAlreadyExists() {
        // Given
        AuthRequestDTO dto = new AuthRequestDTO();
        dto.setUsername(faker.internet().emailAddress());
        dto.setPassword(faker.internet().password(8, 16));
        dto.setRol("USER");

        given(repository.findByUsername(dto.getUsername()))
                .willReturn(Optional.of(buildAutenticacion("USER")));

        // When / Then
        assertThatThrownBy(() -> autenticacionService.registrar(dto))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("ya está en uso");

        verify(repository, never()).save(any());
    }

    // login
    @Test
    @DisplayName("debería retornar token JWT cuando las credenciales son correctas")
    void shouldReturnTokenWhenCredentialsAreCorrect() {
        // Given
        String username = faker.internet().emailAddress();
        String password = faker.internet().password(8, 16);
        String tokenEsperado = "eyJ." + faker.lorem().characters(20);

        Autenticacion user = buildAutenticacion("USER");
        user.setUsername(username);

        given(repository.findByUsername(username)).willReturn(Optional.of(user));
        given(encoder.matches(password, user.getPassword())).willReturn(true);
        given(jwtService.generarToken(any(), anyString())).willReturn(tokenEsperado);

        // When
        AuthResponseDTO resultado = autenticacionService.login(username, password);

        // Then
        assertThat(resultado.getToken()).isEqualTo(tokenEsperado);
    }

    @Test
    @DisplayName("debería lanzar NotFound cuando el usuario no existe en login")
    void shouldThrowNotFoundWhenUserDoesNotExistOnLogin() {
        // Given
        String username = faker.internet().emailAddress();
        String password = faker.internet().password(8, 16);

        given(repository.findByUsername(username)).willReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> autenticacionService.login(username, password))
                .isInstanceOf(NotFound.class)
                .hasMessageContaining("no encontrado");
    }

    @Test
    @DisplayName("debería lanzar AccesoDenegado cuando la contraseña es incorrecta")
    void shouldThrowAccesoDenegadoWhenPasswordIsIncorrect() {
        // Given
        String username = faker.internet().emailAddress();
        String passwordIncorrecto = faker.internet().password(8, 16);

        Autenticacion user = buildAutenticacion("USER");
        user.setUsername(username);

        given(repository.findByUsername(username)).willReturn(Optional.of(user));
        given(encoder.matches(passwordIncorrecto, user.getPassword())).willReturn(false);

        // When / Then
        assertThatThrownBy(() -> autenticacionService.login(username, passwordIncorrecto))
                .isInstanceOf(AccesoDenegado.class)
                .hasMessageContaining("contraseña");
    }

    //vincularUsuario

    @Test
    @DisplayName("debería lanzar DependenciaFallida cuando ms-usuarios retorna false")
    void shouldThrowDependenciaFallidaWhenUsuariosReturnsFalse() {
        // Given
        Long idAuth = faker.number().randomNumber();
        Long idUsuarioRef = faker.number().randomNumber();

        Autenticacion user = buildAutenticacion("ADMIN");
        given(repository.findById(idAuth)).willReturn(Optional.of(user));
        given(usuarioClient.verificarExistencia(idUsuarioRef)).willReturn(false);

        // When / Then
        assertThatThrownBy(() ->
                autenticacionService.vincularUsuario(idAuth, idUsuarioRef))
                .isInstanceOf(DependenciaFallida.class)
                .hasMessageContaining("ms-usuarios");
    }

    @Test
    @DisplayName("debería lanzar NotFound cuando la cuenta de auth no existe al vincular")
    void shouldThrowNotFoundWhenAuthAccountDoesNotExistOnVincular() {
        // Given
        Long idAuth = faker.number().randomNumber();
        Long idUsuarioRef = faker.number().randomNumber();

        given(repository.findById(idAuth)).willReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() ->
                autenticacionService.vincularUsuario(idAuth, idUsuarioRef))
                .isInstanceOf(NotFound.class)
                .hasMessageContaining("autenticación no encontrada");

        verify(usuarioClient, never()).verificarExistencia(any());
    }

    @Test
    @DisplayName("debería lanzar ApiException 400 cuando idUsuarioRef es null")
    void shouldThrowApiExceptionWhenIdUsuarioRefIsNull() {
        // Given
        Long idAuth = faker.number().randomNumber();

        // When / Then
        assertThatThrownBy(() ->
                autenticacionService.vincularUsuario(idAuth, null))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("obligatorio");

        verify(repository, never()).findById(any());
    }
}