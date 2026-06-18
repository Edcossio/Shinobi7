package com.tiendatcg.ms_precios.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tiendatcg.ms_precios.dto.PrecioRequestDTO;
import com.tiendatcg.ms_precios.dto.PrecioResponseDTO;
import com.tiendatcg.ms_precios.exception.AccesoDenegado;
import com.tiendatcg.ms_precios.exception.DependenciaFallida;
import com.tiendatcg.ms_precios.exception.GlobalExceptionHandler;
import com.tiendatcg.ms_precios.exception.NotFound;
import com.tiendatcg.ms_precios.service.PrecioService;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
@DisplayName("Tests de controlador — PrecioController")
class PrecioControllerTest {

    @Mock
    PrecioService precioService;
    @InjectMocks
    PrecioController precioController;

    MockMvc mockMvc;
    ObjectMapper objectMapper = new ObjectMapper();
    Faker faker = new Faker();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(precioController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private PrecioResponseDTO buildResponse() {
        return new PrecioResponseDTO(
                faker.number().randomNumber(),
                faker.number().randomNumber(),
                BigDecimal.valueOf(faker.number().randomDouble(2, 100, 9999)),
                LocalDateTime.now());
    }

    private PrecioRequestDTO buildRequest() {
        return new PrecioRequestDTO(
                faker.number().randomNumber(),
                BigDecimal.valueOf(faker.number().randomDouble(2, 100, 9999)));
    }

    //  GET /
    @Test
    @DisplayName("debería retornar 200 con lista cuando el rol es USER")
    void shouldReturn200WithListWhenRolIsUser() throws Exception {
        // Given
        given(precioService.obtenerTodos("USER"))
                .willReturn(List.of(buildResponse(), buildResponse()));

        // When / Then
        mockMvc.perform(get("/api/precios")
                .header("X-User-Rol", "USER"))
                .andExpect(status().isOk());
    }

    // GET /{id}

    @Test
    @DisplayName("debería retornar 200 cuando el precio existe")
    void shouldReturn200WhenPrecioExists() throws Exception {
        // Given
        PrecioResponseDTO response = buildResponse();
        given(precioService.obtenerPorId(response.getIdPrecio(), "ADMIN"))
                .willReturn(Optional.of(response));

        // When / Then
        mockMvc.perform(get("/api/precios/{id}", response.getIdPrecio())
                .header("X-User-Rol", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idCartaRef")
                        .value(response.getIdCartaRef()));
    }

    @Test
    @DisplayName("debería retornar 404 cuando el precio no existe")
    void shouldReturn404WhenPrecioDoesNotExist() throws Exception {
        // Given
        Long idInexistente = faker.number().randomNumber();
        given(precioService.obtenerPorId(idInexistente, "ADMIN"))
                .willThrow(new NotFound("Precio no encontrado con ID: " + idInexistente));

        // When / Then
        mockMvc.perform(get("/api/precios/{id}", idInexistente)
                .header("X-User-Rol", "ADMIN"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").exists());
    }

    //GET /carta/{idCarta} 

    @Test
    @DisplayName("debería retornar 200 con historial de precios por carta")
    void shouldReturn200WithHistorialByCartaId() throws Exception {
        // Given
        Long idCarta = faker.number().randomNumber();
        given(precioService.obtenerHistorialPorCarta(idCarta, "USER"))
                .willReturn(List.of(buildResponse(), buildResponse()));

        // When / Then
        mockMvc.perform(get("/api/precios/carta/{idCarta}", idCarta)
                .header("X-User-Rol", "USER"))
                .andExpect(status().isOk());
    }

    // POST /

    @Test
    @DisplayName("debería retornar 201 al registrar precio exitosamente")
    void shouldReturn201WhenCreatingPrecioSuccessfully() throws Exception {
        // Given
        PrecioRequestDTO dto = buildRequest();
        PrecioResponseDTO response = buildResponse();
        response.setIdCartaRef(dto.getIdCartaRef());

        given(precioService.guardar(any(), anyString())).willReturn(response);

        // When / Then
        mockMvc.perform(post("/api/precios")
                .header("X-User-Rol", "ADMIN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idCartaRef")
                        .value(response.getIdCartaRef()));
    }

    @Test
    @DisplayName("debería retornar 403 cuando USER intenta registrar precio")
    void shouldReturn403WhenUserTriesToCreatePrecio() throws Exception {
        // Given
        PrecioRequestDTO dto = buildRequest();
        given(precioService.guardar(any(), anyString()))
                .willThrow(new AccesoDenegado(
                        "Acceso denegado: solo empleados o administradores pueden crear precios"));

        // When / Then
        mockMvc.perform(post("/api/precios")
                .header("X-User-Rol", "USER")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("debería retornar 502 cuando ms-catalogo no está disponible")
    void shouldReturn502WhenCatalogoIsDown() throws Exception {
        // Given
        PrecioRequestDTO dto = buildRequest();
        given(precioService.guardar(any(), anyString()))
                .willThrow(new DependenciaFallida(
                        "No se pudo verificar la carta en ms-catalogo."));

        // When / Then
        mockMvc.perform(post("/api/precios")
                .header("X-User-Rol", "ADMIN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    @DisplayName("debería retornar 404 cuando la carta no existe en catálogo")
    void shouldReturn404WhenCartaNotFoundInCatalogo() throws Exception {
        // Given
        PrecioRequestDTO dto = buildRequest();
        given(precioService.guardar(any(), anyString()))
                .willThrow(new NotFound("La carta no existe en el catálogo."));

        // When / Then
        mockMvc.perform(post("/api/precios")
                .header("X-User-Rol", "ADMIN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound());
    }

    //PUT /{id}

    @Test
    @DisplayName("debería retornar 200 al actualizar precio exitosamente")
    void shouldReturn200WhenUpdatingPrecioSuccessfully() throws Exception {
        // Given
        PrecioRequestDTO dto = buildRequest();
        PrecioResponseDTO response = buildResponse();
        Long id = response.getIdPrecio();

        given(precioService.actualizar(anyLong(), any(), anyString()))
                .willReturn(Optional.of(response));

        // When / Then
        mockMvc.perform(put("/api/precios/{id}", id)
                .header("X-User-Rol", "ADMIN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("debería retornar 403 cuando USER intenta actualizar precio")
    void shouldReturn403WhenUserTriesToUpdatePrecio() throws Exception {
        // Given
        PrecioRequestDTO dto = buildRequest();
        Long id = faker.number().randomNumber();

        given(precioService.actualizar(anyLong(), any(), anyString()))
                .willThrow(new AccesoDenegado(
                        "Acceso denegado: solo empleados o administradores pueden actualizar precios"));

        // When / Then
        mockMvc.perform(put("/api/precios/{id}", id)
                .header("X-User-Rol", "USER")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    //DELETE /{id}

    @Test
    @DisplayName("debería retornar 204 al eliminar precio exitosamente")
    void shouldReturn204WhenDeletingPrecioSuccessfully() throws Exception {
        // Given
        Long id = faker.number().randomNumber();
        doNothing().when(precioService).eliminar(id, "ADMIN");

        // When / Then
        mockMvc.perform(delete("/api/precios/{id}", id)
                .header("X-User-Rol", "ADMIN"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("debería retornar 403 cuando EMPLEADO intenta eliminar precio")
    void shouldReturn403WhenEmpleadoTriesToDeletePrecio() throws Exception {
        // Given
        Long id = faker.number().randomNumber();
        doThrow(new AccesoDenegado(
                "Acceso denegado: solo administradores pueden eliminar precios."))
                .when(precioService).eliminar(id, "EMPLEADO");

        // When / Then
        mockMvc.perform(delete("/api/precios/{id}", id)
                .header("X-User-Rol", "EMPLEADO"))
                .andExpect(status().isForbidden());
    }
}