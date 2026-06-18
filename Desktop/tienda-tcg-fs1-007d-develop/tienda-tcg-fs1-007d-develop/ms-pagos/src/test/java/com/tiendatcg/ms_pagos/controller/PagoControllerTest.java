package com.tiendatcg.ms_pagos.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tiendatcg.ms_pagos.dto.PagoRequestDTO;
import com.tiendatcg.ms_pagos.dto.PagoResponseDTO;
import com.tiendatcg.ms_pagos.exception.AccesoDenegado;
import com.tiendatcg.ms_pagos.exception.DependenciaFallida;
import com.tiendatcg.ms_pagos.exception.GlobalExceptionHandler;
import com.tiendatcg.ms_pagos.exception.NotFound;
import com.tiendatcg.ms_pagos.service.PagoService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests de controlador — PagoController")
class PagoControllerTest {

    @Mock
    PagoService pagoService;
    @InjectMocks
    PagoController pagoController;

    MockMvc mockMvc;
    ObjectMapper objectMapper = new ObjectMapper();
    Faker faker = new Faker();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(pagoController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private PagoResponseDTO buildResponse(Long idPedido) {
        return new PagoResponseDTO(
                faker.number().randomNumber(),
                idPedido,
                BigDecimal.valueOf(faker.number().randomDouble(2, 100, 9999)),
                "TARJETA_CREDITO",
                "COMPLETADO",
                LocalDateTime.now());
    }

    private PagoRequestDTO buildRequest(Long idPedido) {
        return new PagoRequestDTO(
                idPedido,
                BigDecimal.valueOf(faker.number().randomDouble(2, 100, 9999)),
                "TARJETA_CREDITO");
    }

    // GET / 
    @Test
    @DisplayName("debería retornar 200 con lista cuando el rol es ADMIN")
    void shouldReturn200WithListWhenRolIsAdmin() throws Exception {
        // Given
        given(pagoService.obtenerTodos("ADMIN"))
                .willReturn(List.of(
                        buildResponse(1L),
                        buildResponse(2L)));

        // When / Then
        mockMvc.perform(get("/api/pagos")
                .header("X-User-Rol", "ADMIN"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("debería retornar 403 cuando USER intenta listar todos los pagos")
    void shouldReturn403WhenUserTriesToListAllPagos() throws Exception {
        // Given
        given(pagoService.obtenerTodos("USER"))
                .willThrow(new AccesoDenegado(
                        "Acceso denegado: No tienes permisos para ver el historial global."));

        // When / Then
        mockMvc.perform(get("/api/pagos")
                .header("X-User-Rol", "USER"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").exists());
    }

    // GET /{id}
    @DisplayName("debería retornar 200 cuando el pago existe")
    void shouldReturn200WhenPagoExists() throws Exception {
        // Given
        Long idPedido = faker.number().randomNumber();
        PagoResponseDTO response = buildResponse(idPedido);

        given(pagoService.obtenerPorId(response.getIdPago(), "ADMIN", null))
                .willReturn(Optional.of(response));

        // When / Then
        mockMvc.perform(get("/api/pagos/{id}", response.getIdPago())
                .header("X-User-Rol", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoPago").value("COMPLETADO"));
    }

    @Test
    @DisplayName("debería retornar 404 cuando el pago no existe")
    void shouldReturn404WhenPagoDoesNotExist() throws Exception {
        // Given
        Long idInexistente = faker.number().randomNumber();
        given(pagoService.obtenerPorId(idInexistente, "ADMIN", null))
                .willThrow(new NotFound("Pago no encontrado"));

        // When / Then
        mockMvc.perform(get("/api/pagos/{id}", idInexistente)
                .header("X-User-Rol", "ADMIN"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    @DisplayName("debería retornar 403 cuando USER intenta ver pago ajeno")
    void shouldReturn403WhenUserTriesToViewAnotherPago() throws Exception {
        // Given
        Long idPago = faker.number().randomNumber();
        Long idUsuarioLogueado = faker.number().randomNumber();

        given(pagoService.obtenerPorId(idPago, "USER", idUsuarioLogueado))
                .willThrow(new AccesoDenegado(
                        "Acceso denegado: no puedes ver el pago de otro usuario."));

        // When / Then
        mockMvc.perform(get("/api/pagos/{id}", idPago)
                .header("X-User-Rol", "USER")
                .header("X-User-Id", idUsuarioLogueado))
                .andExpect(status().isForbidden());
    }

    // GET /pedido/{idPedidoRef} 

    @Test
    @DisplayName("debería retornar 200 cuando existe pago para el pedido")
    void shouldReturn200WhenPagoExistsForPedido() throws Exception {
        // Given
        Long idPedido = faker.number().randomNumber();
        given(pagoService.obtenerPorPedido(idPedido, "ADMIN"))
                .willReturn(Optional.of(buildResponse(idPedido)));

        // When / Then
        mockMvc.perform(get("/api/pagos/pedido/{idPedidoRef}", idPedido)
                .header("X-User-Rol", "ADMIN"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("debería retornar 404 cuando no existe pago para el pedido")
    void shouldReturn404WhenNoPagoExistsForPedido() throws Exception {
        // Given
        Long idPedido = faker.number().randomNumber();
        given(pagoService.obtenerPorPedido(idPedido, "ADMIN"))
                .willReturn(Optional.empty());

        // When / Then
        mockMvc.perform(get("/api/pagos/pedido/{idPedidoRef}", idPedido)
                .header("X-User-Rol", "ADMIN"))
                .andExpect(status().isNotFound());
    }

    // POST /

    @Test
    @DisplayName("debería retornar 201 al procesar pago exitosamente")
    void shouldReturn201WhenProcessingPagoSuccessfully() throws Exception {
        // Given
        Long idPedido = faker.number().randomNumber();
        PagoRequestDTO dto = buildRequest(idPedido);
        PagoResponseDTO response = buildResponse(idPedido);

        given(pagoService.procesarPago(any(), anyString(), any()))
                .willReturn(response);

        // When / Then
        mockMvc.perform(post("/api/pagos")
                .header("X-User-Rol", "USER")
                .header("X-User-Id", faker.number().randomNumber())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estadoPago").value("COMPLETADO"));
    }

    @Test
    @DisplayName("debería retornar 404 cuando el pedido no existe al pagar")
    void shouldReturn404WhenOrderDoesNotExistOnPayment() throws Exception {
        // Given
        Long idPedido = faker.number().randomNumber();
        PagoRequestDTO dto = buildRequest(idPedido);

        given(pagoService.procesarPago(any(), anyString(), any()))
                .willThrow(new NotFound("El pedido con ID " + idPedido + " no existe."));

        // When / Then
        mockMvc.perform(post("/api/pagos")
                .header("X-User-Rol", "ADMIN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("debería retornar 403 cuando USER paga pedido ajeno")
    void shouldReturn403WhenUserPaysAnotherUserOrder() throws Exception {
        // Given
        PagoRequestDTO dto = buildRequest(faker.number().randomNumber());

        given(pagoService.procesarPago(any(), anyString(), anyLong()))
                .willThrow(new AccesoDenegado(
                        "Acceso denegado: no puedes pagar un pedido que no es tuyo."));

        // When / Then
        mockMvc.perform(post("/api/pagos")
                .header("X-User-Rol", "USER")
                .header("X-User-Id", faker.number().randomNumber())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("debería retornar 502 cuando ms-pedidos no está disponible")
    void shouldReturn502WhenPedidosServiceIsDown() throws Exception {
        // Given
        PagoRequestDTO dto = buildRequest(faker.number().randomNumber());

        given(pagoService.procesarPago(any(), anyString(), any()))
                .willThrow(new DependenciaFallida(
                        "No se pudo verificar el pedido en ms-pedidos."));

        // When / Then
        mockMvc.perform(post("/api/pagos")
                .header("X-User-Rol", "ADMIN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadGateway());
    }
}