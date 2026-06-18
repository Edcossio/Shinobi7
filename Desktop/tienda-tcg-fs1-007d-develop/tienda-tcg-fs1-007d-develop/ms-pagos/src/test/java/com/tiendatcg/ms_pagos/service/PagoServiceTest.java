package com.tiendatcg.ms_pagos.service;

import com.tiendatcg.ms_pagos.client.PedidoClient;
import com.tiendatcg.ms_pagos.dto.PagoRequestDTO;
import com.tiendatcg.ms_pagos.dto.PagoResponseDTO;
import com.tiendatcg.ms_pagos.exception.AccesoDenegado;
import com.tiendatcg.ms_pagos.exception.NotFound;
import com.tiendatcg.ms_pagos.model.Pago;
import com.tiendatcg.ms_pagos.repository.PagoRepository;
import net.datafaker.Faker;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitarios — PagoService")
class PagoServiceTest {

    @Mock
    PagoRepository pagoRepository;
    @Mock
    PedidoClient pedidoClient;
    @InjectMocks
    PagoService pagoService;

    Faker faker = new Faker();

    private Pago buildPago(Long idPedido, String estadoPago) {
        Pago p = new Pago();
        p.setIdPago(faker.number().randomNumber());
        p.setIdPedidoRef(idPedido);
        p.setMontoTotal(BigDecimal.valueOf(faker.number().randomDouble(2, 100, 9999)));
        p.setMetodoPago("TARJETA_CREDITO");
        p.setEstadoPago(estadoPago);
        p.setFechaTransaccion(LocalDateTime.now());
        return p;
    }

    private PagoRequestDTO buildRequestDTO(Long idPedido) {
        return new PagoRequestDTO(
                idPedido,
                BigDecimal.valueOf(faker.number().randomDouble(2, 100, 9999)),
                "TARJETA_CREDITO");
    }

    //obtenerTodos
    @Test
    @DisplayName("debería retornar lista de pagos cuando el rol es ADMIN")
    void shouldReturnPagoListWhenRolIsAdmin() {
        // Given
        given(pagoRepository.findAll())
                .willReturn(List.of(
                        buildPago(1L, "COMPLETADO"),
                        buildPago(2L, "PENDIENTE")));

        // When
        List<PagoResponseDTO> resultado = pagoService.obtenerTodos("ADMIN");

        // Then
        assertThat(resultado).hasSize(2);
        verify(pagoRepository).findAll();
    }

    @Test
    @DisplayName("debería lanzar AccesoDenegado cuando USER intenta listar todos los pagos")
    void shouldThrowAccesoDenegadoWhenUserTriesToListAllPagos() {
        // Given / When / Then
        assertThatThrownBy(() -> pagoService.obtenerTodos("USER"))
                .isInstanceOf(AccesoDenegado.class)
                .hasMessageContaining("historial global");

        verify(pagoRepository, never()).findAll();
    }

    //obtenerPorId
    @Test
    @DisplayName("debería lanzar NotFound cuando el pago no existe")
    void shouldThrowNotFoundWhenPagoDoesNotExist() {
        // Given
        Long idInexistente = faker.number().randomNumber();
        given(pagoRepository.findById(idInexistente)).willReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> pagoService.obtenerPorId(idInexistente, "ADMIN", null))
                .isInstanceOf(NotFound.class)
                .hasMessageContaining("no encontrado");
    }

    @Test
    @DisplayName("debería lanzar AccesoDenegado cuando USER intenta ver pago ajeno")
    void shouldThrowAccesoDenegadoWhenUserTriesToViewAnotherPago() {
        // Given
        Long idPedido = faker.number().randomNumber();
        Long idUsuarioLogueado = faker.number().randomNumber();
        Pago pago = buildPago(idPedido, "COMPLETADO");

        given(pagoRepository.findById(pago.getIdPago()))
                .willReturn(Optional.of(pago));
        given(pedidoClient.verificarPropietarioPedido(idPedido, idUsuarioLogueado))
                .willReturn(false);

        // When / Then
        assertThatThrownBy(() -> pagoService.obtenerPorId(pago.getIdPago(), "USER", idUsuarioLogueado))
                .isInstanceOf(AccesoDenegado.class)
                .hasMessageContaining("otro usuario");
    }

    //procesarPago
    @Test
    @DisplayName("debería lanzar NotFound cuando el pedido no existe")
    void shouldThrowNotFoundWhenOrderDoesNotExist() {
        // Given
        Long idPedido = faker.number().randomNumber();
        PagoRequestDTO dto = buildRequestDTO(idPedido);

        given(pedidoClient.verificarPedidoExiste(idPedido)).willReturn(false);

        // When / Then
        assertThatThrownBy(() -> pagoService.procesarPago(dto, "ADMIN", null))
                .isInstanceOf(NotFound.class)
                .hasMessageContaining(String.valueOf(idPedido));

        verify(pagoRepository, never()).save(any());
    }

    @Test
    @DisplayName("debería lanzar AccesoDenegado cuando USER paga pedido ajeno")
    void shouldThrowAccesoDenegadoWhenUserPaysAnotherUserOrder() {
        // Given
        Long idPedido = faker.number().randomNumber();
        Long idUsuarioLogueado = faker.number().randomNumber();
        PagoRequestDTO dto = buildRequestDTO(idPedido);

        given(pedidoClient.verificarPedidoExiste(idPedido)).willReturn(true);
        given(pagoRepository.findByIdPedidoRef(idPedido)).willReturn(Optional.empty());
        given(pedidoClient.verificarPropietarioPedido(idPedido, idUsuarioLogueado))
                .willReturn(false);

        // When / Then
        assertThatThrownBy(() -> pagoService.procesarPago(dto, "USER", idUsuarioLogueado))
                .isInstanceOf(AccesoDenegado.class)
                .hasMessageContaining("tuyo");

        verify(pagoRepository, never()).save(any());
    }

    @Test
    @DisplayName("debería lanzar RuntimeException cuando el pedido ya fue pagado")
    void shouldThrowRuntimeExceptionWhenOrderAlreadyPaid() {
        // Given
        Long idPedido = faker.number().randomNumber();
        PagoRequestDTO dto = buildRequestDTO(idPedido);
        Pago pagoExistente = buildPago(idPedido, "COMPLETADO");

        given(pedidoClient.verificarPedidoExiste(idPedido)).willReturn(true);
        given(pagoRepository.findByIdPedidoRef(idPedido))
                .willReturn(Optional.of(pagoExistente));

        // When / Then
        assertThatThrownBy(() -> pagoService.procesarPago(dto, "ADMIN", null))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("pagado");

        verify(pagoRepository, never()).save(any());
    }

    @Test
    @DisplayName("debería procesar pago exitosamente cuando todas las validaciones pasan")
    void shouldProcessPagoSuccessfullyWhenAllValidationsPass() {
        // Given
        Long idPedido = faker.number().randomNumber();
        PagoRequestDTO dto = buildRequestDTO(idPedido);
        Pago pagoGuardado = buildPago(idPedido, "COMPLETADO");

        given(pedidoClient.verificarPedidoExiste(idPedido)).willReturn(true);
        given(pagoRepository.findByIdPedidoRef(idPedido)).willReturn(Optional.empty());
        given(pagoRepository.save(any())).willReturn(pagoGuardado);

        // When
        PagoResponseDTO resultado = pagoService.procesarPago(dto, "ADMIN", null);

        // Then
        assertThat(resultado).isNotNull();
        assertThat(resultado.getEstadoPago()).isEqualTo("COMPLETADO");
        verify(pagoRepository).save(any(Pago.class));
    }

    // anularPago
    void shouldThrowAccesoDenegadoWhenUserTriesToAnularPago() {
        // Given
        Long idPago = faker.number().randomNumber();

        // When / Then
        assertThatThrownBy(() -> pagoService.anularPago(idPago, "USER"))
                .isInstanceOf(AccesoDenegado.class)
                .hasMessageContaining("personal de la tienda");

        verify(pagoRepository, never()).findById(any());
    }

    @Test
    @DisplayName("debería lanzar NotFound cuando se anula un pago inexistente")
    void shouldThrowNotFoundWhenAnulingNonExistentPago() {
        // Given
        Long idInexistente = faker.number().randomNumber();
        given(pagoRepository.findById(idInexistente)).willReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> pagoService.anularPago(idInexistente, "ADMIN"))
                .isInstanceOf(NotFound.class);
    }
}