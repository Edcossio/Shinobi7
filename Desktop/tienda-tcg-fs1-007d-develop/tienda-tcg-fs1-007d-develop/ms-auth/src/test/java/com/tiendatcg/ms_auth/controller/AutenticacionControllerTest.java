package com.tiendatcg.ms_auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tiendatcg.ms_auth.dto.AuthRequestDTO;
import com.tiendatcg.ms_auth.dto.AuthResponseDTO;
import com.tiendatcg.ms_auth.exception.AccesoDenegado;
import com.tiendatcg.ms_auth.exception.DependenciaFallida;
import com.tiendatcg.ms_auth.exception.NotFound;
import com.tiendatcg.ms_auth.service.AutenticacionService;
import net.datafaker.Faker;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests de controlador — AutenticacionController")
class AutenticacionControllerTest {

    @Mock
    AutenticacionService autenticacionService;
    @InjectMocks
    AutenticacionController autenticacionController;

    MockMvc mockMvc;
    ObjectMapper objectMapper = new ObjectMapper();
    Faker faker = new Faker();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(autenticacionController)
                .setControllerAdvice(new com.tiendatcg.ms_auth.exception.GlobalExceptionHandler())
                .build();
    }

    private AuthResponseDTO buildResponse(String rol) {
        return new AuthResponseDTO(
                faker.number().randomNumber(),
                faker.number().randomNumber(),
                faker.internet().emailAddress(),
                rol,
                "eyJ." + faker.lorem().characters(20));
    }

    @Test
    @DisplayName("debería retornar 201 al registrar cuenta USER válida")
    void shouldReturn201WhenRegisteringValidUserAccount() throws Exception {
        AuthRequestDTO dto = new AuthRequestDTO();
        dto.setUsername(faker.internet().emailAddress());
        dto.setPassword(faker.internet().password(8, 16));
        dto.setRol("USER");

        given(autenticacionService.registrar(any())).willReturn(buildResponse("USER"));

        mockMvc.perform(post("/api/auth/registrar")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.rol").value("USER"));
    }

    @Test
    @DisplayName("debería retornar 403 al registrar con rol ADMIN")
    void shouldReturn403WhenRegisteringWithAdminRol() throws Exception {
        AuthRequestDTO dto = new AuthRequestDTO();
        dto.setUsername(faker.internet().emailAddress());
        dto.setPassword(faker.internet().password(8, 16));
        dto.setRol("ADMIN");

        given(autenticacionService.registrar(any()))
                .willThrow(new AccesoDenegado(
                        "No tienes permisos para registrar un usuario con ese rol."));

        mockMvc.perform(post("/api/auth/registrar")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("debería retornar 200 con token al hacer login exitoso")
    void shouldReturn200WithTokenOnSuccessfulLogin() throws Exception {
        Map<String, String> credenciales = Map.of(
                "username", faker.internet().emailAddress(),
                "password", faker.internet().password(8, 16));

        given(autenticacionService.login(anyString(), anyString()))
                .willReturn(buildResponse("ADMIN"));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(credenciales)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.rol").value("ADMIN"));
    }

    @Test
    @DisplayName("debería retornar 404 cuando el usuario no existe en login")
    void shouldReturn404WhenUserNotFoundOnLogin() throws Exception {
        Map<String, String> credenciales = Map.of(
                "username", faker.internet().emailAddress(),
                "password", faker.internet().password(8, 16));

        given(autenticacionService.login(anyString(), anyString()))
                .willThrow(new NotFound("Usuario no encontrado en el sistema"));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(credenciales)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("debería retornar 403 cuando la contraseña es incorrecta")
    void shouldReturn403WhenPasswordIsIncorrect() throws Exception {
        Map<String, String> credenciales = Map.of(
                "username", faker.internet().emailAddress(),
                "password", "incorrecta");

        given(autenticacionService.login(anyString(), anyString()))
                .willThrow(new AccesoDenegado("La contraseña ingresada es incorrecta"));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(credenciales)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("debería retornar 200 cuando el token es válido")
    void shouldReturn200WhenTokenIsValid() throws Exception {
        given(autenticacionService.validarToken(anyString()))
                .willReturn(buildResponse("USER"));

        mockMvc.perform(get("/api/auth/validar-token")
                .header("Authorization",
                        "Bearer eyJ." + faker.lorem().characters(20)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rol").value("USER"));
    }

    @Test
    @DisplayName("debería retornar 403 cuando el token es inválido")
    void shouldReturn403WhenTokenIsInvalid() throws Exception {
        given(autenticacionService.validarToken(anyString()))
                .willThrow(new AccesoDenegado("Token inválido o expirado"));

        mockMvc.perform(get("/api/auth/validar-token")
                .header("Authorization", "Bearer token_invalido"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("debería retornar 200 al vincular cuenta exitosamente")
    void shouldReturn200WhenVincularIsSuccessful() throws Exception {
        Long idAuth = faker.number().randomNumber();
        Map<String, Long> body = Map.of("idUsuarioRef", faker.number().randomNumber());

        given(autenticacionService.vincularUsuario(any(), any()))
                .willReturn(buildResponse("ADMIN"));

        mockMvc.perform(put("/api/auth/vincular/{idAuth}", idAuth)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("debería retornar 502 cuando ms-usuarios no está disponible al vincular")
    void shouldReturn502WhenUsuariosServiceIsDownOnVincular() throws Exception {
        Long idAuth = faker.number().randomNumber();
        Map<String, Long> body = Map.of("idUsuarioRef", faker.number().randomNumber());

        given(autenticacionService.vincularUsuario(any(), any()))
                .willThrow(new DependenciaFallida(
                        "No se pudo verificar el usuario en ms-usuarios."));

        mockMvc.perform(put("/api/auth/vincular/{idAuth}", idAuth)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadGateway());
    }
}