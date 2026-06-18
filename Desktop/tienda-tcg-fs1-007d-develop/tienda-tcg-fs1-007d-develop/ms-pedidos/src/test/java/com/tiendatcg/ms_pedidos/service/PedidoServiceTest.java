package com.tiendatcg.ms_pedidos.service;

import com.tiendatcg.ms_pedidos.DTO.PedidoRequestDTO;
import com.tiendatcg.ms_pedidos.DTO.PedidoResponseDTO;
import com.tiendatcg.ms_pedidos.client.CatalogoClient;
import com.tiendatcg.ms_pedidos.client.InventarioClient;
import com.tiendatcg.ms_pedidos.client.UsuarioClient;
import com.tiendatcg.ms_pedidos.exception.AccesoDenegado;
import com.tiendatcg.ms_pedidos.exception.ApiException;
import com.tiendatcg.ms_pedidos.exception.DependenciaFallida;
import com.tiendatcg.ms_pedidos.exception.NotFound;
import com.tiendatcg.ms_pedidos.model.Pedido;
import com.tiendatcg.ms_pedidos.repository.PedidoRepository;
import net.datafaker.Faker;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitarios — PedidoService")
class PedidoServiceTest {

    @Mock
    PedidoRepository pedidoRepository;
    @Mock
    UsuarioClient usuarioClient;
    @Mock
    CatalogoClient catalogoClient;
    @Mock
    InventarioClient inventarioClient;
    @InjectMocks
    PedidoService pedidoService;

    Faker faker = new Faker();

    private Pedido buildPedido(Long idUsuario) {
        Pedido p = new Pedido();
        p.setIdPedido(faker.number().randomNumber());
        p.setIdUsuarioRef(idUsuario);
        p.setIdCartaRef(faker.number().randomNumber());
        p.setCantidad(faker.number().numberBetween(1, 10));
        p.setPrecioUnitario(BigDecimal.valueOf(faker.number().randomDouble(2, 100, 9999)));
        p.setMontoTotal(p.getPrecioUnitario());
        p.setEstado("PENDIENTE");
        return p;
    }

    private PedidoRequestDTO buildRequestDTO(Long idUsuario) {
        PedidoRequestDTO dto = new PedidoRequestDTO();
        dto.setIdUsuarioRef(idUsuario);
        dto.setIdCartaRef(faker.number().randomNumber());
        dto.setCantidad(faker.number().numberBetween(1, 5));
        dto.setPrecioUnitario(BigDecimal.valueOf(faker.number().randomDouble(2, 100, 9999)));
        return dto;
    }

    // obtenerTodos

    @Test
    @DisplayName("debería retornar lista cuando el rol es ADMIN")
    void shouldReturnListWhenRolIsAdmin() {
        // Given
        Long idUsuario = faker.number().randomNumber();
        given(pedidoRepository.findAll())
                .willReturn(List.of(buildPedido(idUsuario), buildPedido(idUsuario)));

        // When
        List<PedidoResponseDTO> resultado = pedidoService.obtenerTodos("ADMIN");

        // Then
        assertThat(resultado).hasSize(2);
        verify(pedidoRepository).findAll();
    }

    @Test
    @DisplayName("debería lanzar AccesoDenegado cuando USER intenta listar todos los pedidos")
    void shouldThrowAccesoDenegadoWhenUserTriesToListAllOrders() {
        // Given / When / Then
        assertThatThrownBy(() -> pedidoService.obtenerTodos("USER"))
                .isInstanceOf(AccesoDenegado.class);

        verify(pedidoRepository, never()).findAll();
    }

    // obtenerPorId

    @Test
    @DisplayName("debería lanzar NotFound cuando el pedido no existe")
    void shouldThrowNotFoundWhenOrderDoesNotExist() {
        // Given
        Long idInexistente = faker.number().randomNumber();
        given(pedidoRepository.findById(idInexistente)).willReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> pedidoService.obtenerPorId(idInexistente, "ADMIN", null))
                .isInstanceOf(NotFound.class)
                .hasMessageContaining(String.valueOf(idInexistente));
    }

    @Test
    @DisplayName("debería lanzar AccesoDenegado cuando USER intenta ver pedido ajeno")
    void shouldThrowAccesoDenegadoWhenUserTriesToViewAnotherOrder() {
        // Given
        Long idUsuarioPropietario = faker.number().randomNumber();
        Long idUsuarioLogueado = idUsuarioPropietario + 99L;
        Pedido pedido = buildPedido(idUsuarioPropietario);

        given(pedidoRepository.findById(pedido.getIdPedido()))
                .willReturn(Optional.of(pedido));

        // When / Then
        assertThatThrownBy(() -> pedidoService.obtenerPorId(pedido.getIdPedido(), "USER", idUsuarioLogueado))
                .isInstanceOf(AccesoDenegado.class)
                .hasMessageContaining("Acceso denegado: no puedes ver el pedido de otro usuario.");
    }

    // crear

    @Test
    @DisplayName("debería lanzar AccesoDenegado cuando USER crea pedido para otro usuario")
    void shouldThrowAccesoDenegadoWhenUserCreatesOrderForAnotherUser() {
        // Given
        Long idUsuarioLogueado = faker.number().randomNumber();
        PedidoRequestDTO dto = buildRequestDTO(idUsuarioLogueado + 99L);

        // When / Then
        assertThatThrownBy(() -> pedidoService.crear(dto, "USER", idUsuarioLogueado))
                .isInstanceOf(AccesoDenegado.class);

        verify(usuarioClient, never()).verificarExistencia(any());
    }

    @Test
    @DisplayName("debería lanzar DependenciaFallida cuando ms-usuarios retorna false")
    void shouldThrowDependenciaFallidaWhenUsuariosReturnsFalse() {
        // Given
        Long idUsuario = faker.number().randomNumber();
        PedidoRequestDTO dto = buildRequestDTO(idUsuario);

        given(usuarioClient.verificarExistencia(dto.getIdUsuarioRef())).willReturn(false);

        // When / Then
        assertThatThrownBy(() -> pedidoService.crear(dto, "ADMIN", null))
                .isInstanceOf(DependenciaFallida.class)
                .hasMessageContaining("ms-usuarios");

        verify(catalogoClient, never()).verificarCartaExiste(any());
    }

    @Test
    @DisplayName("debería lanzar NotFound cuando la carta no existe en catálogo")
    void shouldThrowNotFoundWhenCartaDoesNotExistInCatalogo() {
        // Given
        Long idUsuario = faker.number().randomNumber();
        PedidoRequestDTO dto = buildRequestDTO(idUsuario);

        given(usuarioClient.verificarExistencia(dto.getIdUsuarioRef())).willReturn(true);
        given(catalogoClient.verificarCartaExiste(dto.getIdCartaRef())).willReturn(false);

        // When / Then
        assertThatThrownBy(() -> pedidoService.crear(dto, "ADMIN", null))
                .isInstanceOf(NotFound.class)
                .hasMessageContaining("catálogo");

        verify(inventarioClient, never()).verificarStock(any(), any());
    }

    @Test
    @DisplayName("debería lanzar ApiException 409 cuando el stock es insuficiente")
    void shouldThrowApiExceptionWhenStockIsInsufficient() {
        // Given
        Long idUsuario = faker.number().randomNumber();
        PedidoRequestDTO dto = buildRequestDTO(idUsuario);

        given(usuarioClient.verificarExistencia(dto.getIdUsuarioRef())).willReturn(true);
        given(catalogoClient.verificarCartaExiste(dto.getIdCartaRef())).willReturn(true);
        given(inventarioClient.verificarStock(dto.getIdCartaRef(), dto.getCantidad()))
                .willReturn(false);

        // When / Then
        assertThatThrownBy(() -> pedidoService.crear(dto, "ADMIN", null))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Stock insuficiente");
    }

    @Test
    @DisplayName("debería crear pedido exitosamente cuando todas las validaciones pasan")
    void shouldCreateOrderSuccessfullyWhenAllValidationsPass() {
        // Given
        Long idUsuario = faker.number().randomNumber();
        PedidoRequestDTO dto = buildRequestDTO(idUsuario);
        Pedido pedidoGuardado = buildPedido(idUsuario);

        given(usuarioClient.verificarExistencia(dto.getIdUsuarioRef())).willReturn(true);
        given(catalogoClient.verificarCartaExiste(dto.getIdCartaRef())).willReturn(true);
        given(inventarioClient.verificarStock(dto.getIdCartaRef(), dto.getCantidad()))
                .willReturn(true);
        given(pedidoRepository.save(any())).willReturn(pedidoGuardado);

        // When
        PedidoResponseDTO resultado = pedidoService.crear(dto, "ADMIN", null);

        // Then
        assertThat(resultado).isNotNull();
        verify(pedidoRepository).save(any(Pedido.class));
    }

    //cambiarEstado

    @Test
    @DisplayName("debería lanzar AccesoDenegado cuando USER intenta cambiar estado")
    void shouldThrowAccesoDenegadoWhenUserTriesToChangeOrderStatus() {
        // Given
        Long id = faker.number().randomNumber();

        // When / Then
        assertThatThrownBy(() -> pedidoService.cambiarEstado(id, "CONFIRMADO", "USER"))
                .isInstanceOf(AccesoDenegado.class);

        verify(pedidoRepository, never()).findById(any());
    }

    @Test
    @DisplayName("debería lanzar ApiException 400 cuando el estado es inválido")
    void shouldThrowApiExceptionWhenEstadoIsInvalid() {
        // Given
        Long id = faker.number().randomNumber();

        // When / Then
        assertThatThrownBy(() -> pedidoService.cambiarEstado(id, "VOLANDO", "ADMIN"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Estado inválido");

        verify(pedidoRepository, never()).findById(any());
    }

    // cancelar

    @Test
    @DisplayName("debería lanzar ApiException 409 al cancelar pedido en estado ENVIADO")
    void shouldThrowApiExceptionWhenCancellingOrderInSentStatus() {
        // Given
        Long idUsuario = faker.number().randomNumber();
        Pedido pedido = buildPedido(idUsuario);
        pedido.setEstado("ENVIADO");

        given(pedidoRepository.findById(pedido.getIdPedido()))
                .willReturn(Optional.of(pedido));

        // When / Then
        assertThatThrownBy(() -> pedidoService.cancelar(pedido.getIdPedido(), "ADMIN", idUsuario))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("ENVIADO");
    }
}