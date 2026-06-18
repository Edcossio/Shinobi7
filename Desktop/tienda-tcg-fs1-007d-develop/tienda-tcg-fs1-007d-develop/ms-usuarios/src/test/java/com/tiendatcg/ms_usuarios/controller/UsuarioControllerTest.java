package com.tiendatcg.ms_usuarios.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tiendatcg.ms_usuarios.dto.UsuarioRequestDTO;
import com.tiendatcg.ms_usuarios.dto.UsuarioResponseDTO;
import com.tiendatcg.ms_usuarios.exception.AccesoDenegado;
import com.tiendatcg.ms_usuarios.exception.ApiException;
import com.tiendatcg.ms_usuarios.exception.GlobalExceptionHandler;
import com.tiendatcg.ms_usuarios.exception.NotFound;
import com.tiendatcg.ms_usuarios.service.UsuarioService;
import net.datafaker.Faker;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests de controlador — UsuarioController")
class UsuarioControllerTest {

    @Mock
    UsuarioService usuarioService;
    @InjectMocks
    UsuarioController usuarioController;

    MockMvc mockMvc;
    ObjectMapper objectMapper = new ObjectMapper();
    Faker faker = new Faker();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(usuarioController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private UsuarioResponseDTO buildResponse() {
        return UsuarioResponseDTO.builder()
                .idPerfil(faker.number().randomNumber())
                .nombreCompleto(faker.name().fullName())
                .correoElectronico(faker.internet().emailAddress())
                .direccionFisica(faker.address().fullAddress())
                .totalPuntos(faker.number().numberBetween(0, 5000))
                .categoriaVip("GOLD")
                .build();
    }

    private UsuarioRequestDTO buildRequest() {
        UsuarioRequestDTO dto = new UsuarioRequestDTO();
        dto.setNombreCompleto(faker.name().fullName());
        dto.setCorreoElectronico(faker.internet().emailAddress());
        dto.setDireccionFisica(faker.address().fullAddress());
        return dto;
    }

    //GET

    @Test
    @DisplayName("debería retornar 200 con lista cuando el rol es ADMIN")
    void shouldReturn200WithListWhenRolIsAdmin() throws Exception {
        // Given
        given(usuarioService.obtenerTodos("ADMIN"))
                .willReturn(List.of(buildResponse(), buildResponse()));

        // When / Then
        mockMvc.perform(get("/api/usuarios")
                .header("X-User-Rol", "ADMIN"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("debería retornar 403 cuando USER intenta listar todos")
    void shouldReturn403WhenUserTriesToListAll() throws Exception {
        // Given
        given(usuarioService.obtenerTodos("USER"))
                .willThrow(new AccesoDenegado(
                        "Acceso denegado: solo empleados o administradores pueden listar todos los usuarios"));

        // When / Then
        mockMvc.perform(get("/api/usuarios")
                .header("X-User-Rol", "USER"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").exists());
    }

    //GET /{id}
    @DisplayName("debería retornar 200 cuando ADMIN busca usuario por ID existente")
    void shouldReturn200WhenAdminSearchesByExistingId() throws Exception {
        // Given
        UsuarioResponseDTO response = buildResponse();
        given(usuarioService.obtenerPorId(
                response.getIdPerfil(), "ADMIN", null))
                .willReturn(Optional.of(response));

        // When / Then
        mockMvc.perform(get("/api/usuarios/{id}", response.getIdPerfil())
                .header("X-User-Rol", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correoElectronico")
                        .value(response.getCorreoElectronico()));
    }

    @Test
    @DisplayName("debería retornar 404 cuando el usuario no existe")
    void shouldReturn404WhenUserDoesNotExist() throws Exception {
        // Given
        Long idInexistente = faker.number().randomNumber();
        given(usuarioService.obtenerPorId(idInexistente, "ADMIN", null))
                .willThrow(new NotFound("Usuario no encontrado con ID: " + idInexistente));

        // When / Then
        mockMvc.perform(get("/api/usuarios/{id}", idInexistente)
                .header("X-User-Rol", "ADMIN"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    @DisplayName("debería retornar 403 cuando USER intenta ver perfil ajeno")
    void shouldReturn403WhenUserTriesToViewAnotherProfile() throws Exception {
        // Given
        Long idPerfil = faker.number().randomNumber();
        Long idUsuarioLogueado = idPerfil + 99L;

        given(usuarioService.obtenerPorId(idPerfil, "USER", idUsuarioLogueado))
                .willThrow(new AccesoDenegado("No tienes permisos para ver este perfil"));

        // When / Then
        mockMvc.perform(get("/api/usuarios/{id}", idPerfil)
                .header("X-User-Rol", "USER")
                .header("X-User-Id", idUsuarioLogueado))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error")
                        .value("No tienes permisos para ver este perfil"));
    }

    //POST
    @Test
    @DisplayName("debería retornar 201 al crear usuario exitosamente")
    void shouldReturn201WhenCreatingUserSuccessfully() throws Exception {
        // Given
        UsuarioRequestDTO dto = buildRequest();
        UsuarioResponseDTO response = buildResponse();
        response.setCorreoElectronico(dto.getCorreoElectronico());

        given(usuarioService.guardar(any(), anyString())).willReturn(response);

        // When / Then
        mockMvc.perform(post("/api/usuarios")
                .header("X-User-Rol", "ADMIN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.correoElectronico")
                        .value(response.getCorreoElectronico()));
    }

    @Test
    @DisplayName("debería retornar 409 cuando el email ya existe")
    void shouldReturn409WhenEmailAlreadyExists() throws Exception {
        // Given
        UsuarioRequestDTO dto = buildRequest();

        given(usuarioService.guardar(any(), anyString()))
                .willThrow(new ApiException("Ya existe un usuario con ese email",
                        HttpStatus.CONFLICT));

        // When / Then
        mockMvc.perform(post("/api/usuarios")
                .header("X-User-Rol", "ADMIN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error")
                        .value("Ya existe un usuario con ese email"));
    }

    @Test
    @DisplayName("debería retornar 403 cuando USER intenta crear un usuario")
    void shouldReturn403WhenUserTriesToCreateUsuario() throws Exception {
        // Given
        UsuarioRequestDTO dto = buildRequest();

        given(usuarioService.guardar(any(), anyString()))
                .willThrow(new AccesoDenegado(
                        "Acceso denegado: solo empleados o administradores pueden crear usuarios"));

        // When / Then
        mockMvc.perform(post("/api/usuarios")
                .header("X-User-Rol", "USER")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    //PUT /{id}
    @Test
    @DisplayName("debería retornar 200 al actualizar usuario exitosamente")
    void shouldReturn200WhenUpdatingUserSuccessfully() throws Exception {
        // Given
        UsuarioRequestDTO dto = buildRequest();
        UsuarioResponseDTO response = buildResponse();
        Long id = response.getIdPerfil();

        given(usuarioService.actualizar(anyLong(), any(), anyString(), any()))
                .willReturn(Optional.of(response));

        // When / Then
        mockMvc.perform(put("/api/usuarios/{id}", id)
                .header("X-User-Rol", "ADMIN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("debería retornar 403 cuando USER intenta actualizar perfil ajeno")
    void shouldReturn403WhenUserTriesToUpdateAnotherProfile() throws Exception {
        // Given
        Long id = faker.number().randomNumber();
        Long idUsuarioLogueado = id + 99L;
        UsuarioRequestDTO dto = buildRequest();

        given(usuarioService.actualizar(anyLong(), any(), anyString(), any()))
                .willThrow(new AccesoDenegado(
                        "Acceso denegado: no puedes actualizar otro usuario"));

        // When / Then
        mockMvc.perform(put("/api/usuarios/{id}", id)
                .header("X-User-Rol", "USER")
                .header("X-User-Id", idUsuarioLogueado)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    // DELETE /{id}

    @Test
    @DisplayName("debería retornar 204 al eliminar usuario exitosamente")
    void shouldReturn204WhenDeletingUserSuccessfully() throws Exception {
        // Given
        Long id = faker.number().randomNumber();
        doNothing().when(usuarioService).eliminar(id, "ADMIN");

        // When / Then
        mockMvc.perform(delete("/api/usuarios/{id}", id)
                .header("X-User-Rol", "ADMIN"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("debería retornar 403 cuando EMPLEADO intenta eliminar usuario")
    void shouldReturn403WhenEmpleadoTriesToDeleteUser() throws Exception {
        // Given
        Long id = faker.number().randomNumber();
        doThrow(new AccesoDenegado(
                "Acceso denegado: solo administradores pueden eliminar usuarios"))
                .when(usuarioService).eliminar(id, "EMPLEADO");

        // When / Then
        mockMvc.perform(delete("/api/usuarios/{id}", id)
                .header("X-User-Rol", "EMPLEADO"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("debería retornar 404 al intentar eliminar usuario inexistente")
    void shouldReturn404WhenDeletingNonExistentUser() throws Exception {
        // Given
        Long idInexistente = faker.number().randomNumber();
        doThrow(new NotFound("Usuario no encontrado"))
                .when(usuarioService).eliminar(idInexistente, "ADMIN");

        // When / Then
        mockMvc.perform(delete("/api/usuarios/{id}", idInexistente)
                .header("X-User-Rol", "ADMIN"))
                .andExpect(status().isNotFound());
    }

    // GET /validar-user/{id}

    @Test
    @DisplayName("debería retornar true cuando el usuario existe")
    void shouldReturnTrueWhenUserExists() throws Exception {
        // Given
        Long id = faker.number().randomNumber();
        given(usuarioService.existePorId(id)).willReturn(true);

        // When / Then
        mockMvc.perform(get("/api/usuarios/validar-user/{id}", id))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }

    @Test
    @DisplayName("debería retornar false cuando el usuario no existe")
    void shouldReturnFalseWhenUserDoesNotExist() throws Exception {
        // Given
        Long id = faker.number().randomNumber();
        given(usuarioService.existePorId(id)).willReturn(false);

        // When / Then
        mockMvc.perform(get("/api/usuarios/validar-user/{id}", id))
                .andExpect(status().isOk())
                .andExpect(content().string("false"));
    }
}