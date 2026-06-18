package com.tiendatcg.ms_pedidos.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tiendatcg.ms_pedidos.DTO.PedidoRequestDTO;
import com.tiendatcg.ms_pedidos.DTO.PedidoResponseDTO;
import com.tiendatcg.ms_pedidos.exception.AccesoDenegado;
import com.tiendatcg.ms_pedidos.exception.ApiException;
import com.tiendatcg.ms_pedidos.exception.DependenciaFallida;
import com.tiendatcg.ms_pedidos.exception.GlobalExceptionHandler;
import com.tiendatcg.ms_pedidos.exception.NotFound;
import com.tiendatcg.ms_pedidos.service.PedidoService;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
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
@DisplayName("Tests de controlador — PedidoController")
class PedidoControllerTest {

    @Mock
    PedidoService pedidoService;
    @InjectMocks
    PedidoController pedidoController;

    MockMvc mockMvc;
    ObjectMapper objectMapper = new ObjectMapper();
    Faker faker = new Faker();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(pedidoController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private PedidoResponseDTO buildResponse(Long idUsuario) {
        return PedidoResponseDTO.builder()
                .idPedido(faker.number().randomNumber())
                .idUsuarioRef(idUsuario)
                .idCartaRef(faker.number().randomNumber())
                .cantidad(faker.number().numberBetween(1, 5))
                .precioUnitario(BigDecimal.valueOf(faker.number().randomDouble(2, 100, 9999)))
                .montoTotal(BigDecimal.valueOf(faker.number().randomDouble(2, 100, 9999)))
                .estado("PENDIENTE")
                .fechaPedido(LocalDateTime.now())
                .build();
    }

    private PedidoRequestDTO buildRequest(Long idUsuario) {
        PedidoRequestDTO dto = new PedidoRequestDTO();
        dto.setIdUsuarioRef(idUsuario);
        dto.setIdCartaRef(faker.number().randomNumber());
        dto.setCantidad(faker.number().numberBetween(1, 5));
        dto.setPrecioUnitario(BigDecimal.valueOf(faker.number().randomDouble(2, 100, 9999)));
        return dto;
    }

    //  GET / 

    @Test
    @DisplayName("debería retornar 200 con lista cuando el rol es ADMIN")
    void shouldReturn200WithListWhenRolIsAdmin() throws Exception {
        // Given
        Long idUsuario = faker.number().randomNumber();
        given(pedidoService.obtenerTodos("ADMIN"))
                .willReturn(List.of(buildResponse(idUsuario), buildResponse(idUsuario)));

        // When / Then
        mockMvc.perform(get("/api/pedidos")
                .header("X-User-Rol", "ADMIN"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("debería retornar 403 cuando USER intenta listar todos los pedidos")
    void shouldReturn403WhenUserTriesToListAllOrders() throws Exception {
        // Given
        given(pedidoService.obtenerTodos("USER"))
                .willThrow(new AccesoDenegado(
                        "Acceso denegado: solo administradores o empleados pueden ver todos los pedidos."));

        // When / Then
        mockMvc.perform(get("/api/pedidos")
                .header("X-User-Rol", "USER"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").exists());
    }

    //GET /{id}
    @Test
    @DisplayName("debería retornar 200 cuando ADMIN busca pedido por ID existente")
    void shouldReturn200WhenAdminSearchesByExistingId() throws Exception {
        // Given
        Long idUsuario = faker.number().randomNumber();
        PedidoResponseDTO response = buildResponse(idUsuario);

        given(pedidoService.obtenerPorId(response.getIdPedido(), "ADMIN", null))
                .willReturn(Optional.of(response));

        // When / Then
        mockMvc.perform(get("/api/pedidos/{id}", response.getIdPedido())
                .header("X-User-Rol", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("PENDIENTE"));
    }

    @Test
    @DisplayName("debería retornar 404 cuando el pedido no existe")
    void shouldReturn404WhenOrderDoesNotExist() throws Exception {
        // Given
        Long idInexistente = faker.number().randomNumber();
        given(pedidoService.obtenerPorId(idInexistente, "ADMIN", null))
                .willThrow(new NotFound("Pedido no encontrado con ID: " + idInexistente));

        // When / Then
        mockMvc.perform(get("/api/pedidos/{id}", idInexistente)
                .header("X-User-Rol", "ADMIN"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    @DisplayName("debería retornar 403 cuando USER intenta ver pedido ajeno")
    void shouldReturn403WhenUserTriesToViewAnotherOrder() throws Exception {
        // Given
        Long idPedido = faker.number().randomNumber();
        Long idUsuarioLogueado = faker.number().randomNumber();

        given(pedidoService.obtenerPorId(idPedido, "USER", idUsuarioLogueado))
                .willThrow(new AccesoDenegado(
                        "Acceso denegado: no puedes ver el pedido de otro usuario."));

        // When / Then
        mockMvc.perform(get("/api/pedidos/{id}", idPedido)
                .header("X-User-Rol", "USER")
                .header("X-User-Id", idUsuarioLogueado))
                .andExpect(status().isForbidden());
    }

    // POST / 

    @Test
    @DisplayName("debería retornar 201 al crear pedido exitosamente")
    void shouldReturn201WhenCreatingOrderSuccessfully() throws Exception {
        // Given
        Long idUsuario = faker.number().randomNumber();
        PedidoRequestDTO dto = buildRequest(idUsuario);
        PedidoResponseDTO response = buildResponse(idUsuario);

        given(pedidoService.crear(any(), anyString(), any()))
                .willReturn(response);

        // When / Then
        mockMvc.perform(post("/api/pedidos")
                .header("X-User-Rol", "ADMIN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estado").value("PENDIENTE"));
    }

    @Test
    @DisplayName("debería retornar 502 cuando ms-catalogo no está disponible")
    void shouldReturn502WhenCatalogoIsDown() throws Exception {
        // Given
        Long idUsuario = faker.number().randomNumber();
        PedidoRequestDTO dto = buildRequest(idUsuario);

        given(pedidoService.crear(any(), anyString(), any()))
                .willThrow(new DependenciaFallida(
                        "No se pudo verificar la carta con ID 1 en ms-catalogo."));

        // When / Then
        mockMvc.perform(post("/api/pedidos")
                .header("X-User-Rol", "ADMIN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    @DisplayName("debería retornar 409 cuando el stock es insuficiente")
    void shouldReturn409WhenStockIsInsufficient() throws Exception {
        // Given
        Long idUsuario = faker.number().randomNumber();
        PedidoRequestDTO dto = buildRequest(idUsuario);

        given(pedidoService.crear(any(), anyString(), any()))
                .willThrow(new ApiException(
                        "Stock insuficiente para la carta con ID 1.",
                        HttpStatus.CONFLICT));

        // When / Then
        mockMvc.perform(post("/api/pedidos")
                .header("X-User-Rol", "ADMIN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").exists());
    }

    // PATCH /{id}/estado

    @Test
    @DisplayName("debería retornar 200 al cambiar estado exitosamente")
    void shouldReturn200WhenChangingStatusSuccessfully() throws Exception {
        // Given
        Long idPedido = faker.number().randomNumber();
        Long idUsuario = faker.number().randomNumber();
        PedidoResponseDTO response = buildResponse(idUsuario);
        response.setEstado("CONFIRMADO");

        given(pedidoService.cambiarEstado(anyLong(), anyString(), anyString()))
                .willReturn(response);

        // When / Then
        mockMvc.perform(patch("/api/pedidos/{id}/estado", idPedido)
                .header("X-User-Rol", "ADMIN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                        Map.of("estado", "CONFIRMADO"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("CONFIRMADO"));
    }

    @Test
    @DisplayName("debería retornar 400 cuando el estado es inválido")
    void shouldReturn400WhenEstadoIsInvalid() throws Exception {
        // Given
        Long idPedido = faker.number().randomNumber();

        given(pedidoService.cambiarEstado(anyLong(), anyString(), anyString()))
                .willThrow(new ApiException(
                        "Estado inválido.", HttpStatus.BAD_REQUEST));

        // When / Then
        mockMvc.perform(patch("/api/pedidos/{id}/estado", idPedido)
                .header("X-User-Rol", "ADMIN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                        Map.of("estado", "VOLANDO"))))
                .andExpect(status().isBadRequest());
    }

    //  DELETE /{id}

    @Test
    @DisplayName("debería retornar 204 al cancelar pedido exitosamente")
    void shouldReturn204WhenCancellingOrderSuccessfully() throws Exception {
        // Given
        Long idPedido = faker.number().randomNumber();
        doNothing().when(pedidoService).cancelar(idPedido, "ADMIN", null);

        // When / Then
        mockMvc.perform(delete("/api/pedidos/{id}", idPedido)
                .header("X-User-Rol", "ADMIN"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("debería retornar 409 al cancelar pedido en estado ENVIADO")
    void shouldReturn409WhenCancellingOrderInSentStatus() throws Exception {
        // Given
        Long idPedido = faker.number().randomNumber();

        doThrow(new ApiException(
                "No se puede cancelar un pedido en estado: ENVIADO",
                HttpStatus.CONFLICT))
                .when(pedidoService).cancelar(idPedido, "ADMIN", null);

        // When / Then
        mockMvc.perform(delete("/api/pedidos/{id}", idPedido)
                .header("X-User-Rol", "ADMIN"))
                .andExpect(status().isConflict());
    }

    // GET /validar-envio/{idPedido}
    @DisplayName("debería retornar true cuando el pedido existe")
    void shouldReturnTrueWhenOrderExists() throws Exception {
        // Given
        Long idPedido = faker.number().randomNumber();
        given(pedidoService.verificarPedidoExiste(idPedido)).willReturn(true);

        // When / Then
        mockMvc.perform(get("/api/pedidos/validar-envio/{idPedido}", idPedido))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }

    // ─ GET /validar-propietario/{idPedido}/{idUsuario} 

    @Test
    @DisplayName("debería retornar true cuando el usuario es propietario del pedido")
    void shouldReturnTrueWhenUserIsOrderOwner() throws Exception {
        // Given
        Long idPedido = faker.number().randomNumber();
        Long idUsuario = faker.number().randomNumber();
        given(pedidoService.verificarPropietario(idPedido, idUsuario)).willReturn(true);

        // When / Then
        mockMvc.perform(get("/api/pedidos/validar-propietario/{idPedido}/{idUsuario}",
                idPedido, idUsuario))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }
}