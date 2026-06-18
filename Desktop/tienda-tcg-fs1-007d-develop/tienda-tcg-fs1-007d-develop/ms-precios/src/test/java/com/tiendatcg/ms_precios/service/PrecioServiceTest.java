package com.tiendatcg.ms_precios.service;

import com.tiendatcg.ms_precios.client.CatalogoClient;
import com.tiendatcg.ms_precios.dto.PrecioRequestDTO;
import com.tiendatcg.ms_precios.dto.PrecioResponseDTO;
import com.tiendatcg.ms_precios.exception.AccesoDenegado;
import com.tiendatcg.ms_precios.exception.DependenciaFallida;
import com.tiendatcg.ms_precios.exception.NotFound;
import com.tiendatcg.ms_precios.model.GeneradorPrecio;
import com.tiendatcg.ms_precios.repository.PrecioRepository;
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
@DisplayName("Tests unitarios — PrecioService")
class PrecioServiceTest {

    @Mock
    PrecioRepository precioRepository;
    @Mock
    CatalogoClient catalogoClient;
    @InjectMocks
    PrecioService precioService;

    Faker faker = new Faker();

    private GeneradorPrecio buildPrecio() {
        GeneradorPrecio p = new GeneradorPrecio();
        p.setIdPrecio(faker.number().randomNumber());
        p.setIdCartaRef(faker.number().randomNumber());
        p.setValorMercado(BigDecimal.valueOf(
                faker.number().randomDouble(2, 100, 9999)));
        return p;
    }

    private PrecioRequestDTO buildRequestDTO() {
        PrecioRequestDTO dto = new PrecioRequestDTO();
        dto.setIdCartaRef(faker.number().randomNumber());
        dto.setValorMercado(BigDecimal.valueOf(
                faker.number().randomDouble(2, 100, 9999)));
        return dto;
    }

    //obtenerTodos
    @Test
    @DisplayName("debería retornar lista de precios cuando el rol es USER")
    void shouldReturnPrecioListWhenRolIsUser() {
        // Given
        given(precioRepository.findAll())
                .willReturn(List.of(buildPrecio(), buildPrecio(), buildPrecio()));

        // When
        List<PrecioResponseDTO> resultado = precioService.obtenerTodos("USER");

        // Then
        assertThat(resultado).hasSize(3);
        verify(precioRepository).findAll();
    }

    //obtenerPorId

    @Test
    @DisplayName("debería lanzar NotFound cuando el precio no existe")
    void shouldThrowNotFoundWhenPrecioDoesNotExist() {
        // Given
        Long idInexistente = faker.number().randomNumber();
        given(precioRepository.findById(idInexistente)).willReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> precioService.obtenerPorId(idInexistente, "ADMIN"))
                .isInstanceOf(NotFound.class)
                .hasMessageContaining(String.valueOf(idInexistente));
    }

    //guardar

    @Test
    @DisplayName("debería lanzar AccesoDenegado cuando USER intenta registrar un precio")
    void shouldThrowAccesoDenegadoWhenUserTriesToCreatePrecio() {
        // Given
        PrecioRequestDTO dto = buildRequestDTO();

        // When / Then
        assertThatThrownBy(() -> precioService.guardar(dto, "USER"))
                .isInstanceOf(AccesoDenegado.class);

        verify(catalogoClient, never()).verificarCartaExiste(any());
        verify(precioRepository, never()).save(any());
    }

    @Test
    @DisplayName("debería lanzar DependenciaFallida cuando ms-catalogo retorna false")
    void shouldThrowDependenciaFallidaWhenCatalogoReturnsFalse() {
        // Given
        PrecioRequestDTO dto = buildRequestDTO();
        given(catalogoClient.verificarCartaExiste(dto.getIdCartaRef())).willReturn(false);

        // When / Then
        assertThatThrownBy(() -> precioService.guardar(dto, "ADMIN"))
                .isInstanceOf(NotFound.class)
                .hasMessageContaining("catálogo");

        verify(precioRepository, never()).save(any());
    }

    @Test
    @DisplayName("debería lanzar DependenciaFallida cuando ms-catalogo no está disponible")
    void shouldThrowDependenciaFallidaWhenCatalogoIsDown() {
        // Given
        PrecioRequestDTO dto = buildRequestDTO();
        given(catalogoClient.verificarCartaExiste(dto.getIdCartaRef()))
                .willThrow(new RuntimeException("Connection refused"));

        // When / Then
        assertThatThrownBy(() -> precioService.guardar(dto, "ADMIN"))
                .isInstanceOf(DependenciaFallida.class)
                .hasMessageContaining("ms-catalogo");

        verify(precioRepository, never()).save(any());
    }

    @Test
    @DisplayName("debería registrar precio exitosamente cuando la carta existe")
    void shouldCreatePrecioSuccessfullyWhenCartaExists() {
        // Given
        PrecioRequestDTO dto = buildRequestDTO();
        GeneradorPrecio guardado = buildPrecio();
        guardado.setIdCartaRef(dto.getIdCartaRef());
        guardado.setValorMercado(dto.getValorMercado());

        given(catalogoClient.verificarCartaExiste(dto.getIdCartaRef())).willReturn(true);
        given(precioRepository.save(any())).willReturn(guardado);

        // When
        PrecioResponseDTO resultado = precioService.guardar(dto, "ADMIN");

        // Then
        assertThat(resultado).isNotNull();
        assertThat(resultado.getIdCartaRef()).isEqualTo(dto.getIdCartaRef());
        verify(precioRepository).save(any(GeneradorPrecio.class));
    }

    //actualizar
    @Test
    @DisplayName("debería lanzar AccesoDenegado cuando USER intenta actualizar un precio")
    void shouldThrowAccesoDenegadoWhenUserTriesToUpdatePrecio() {
        // Given
        Long id = faker.number().randomNumber();
        PrecioRequestDTO dto = buildRequestDTO();

        // When / Then
        assertThatThrownBy(() -> precioService.actualizar(id, dto, "USER"))
                .isInstanceOf(AccesoDenegado.class);

        verify(precioRepository, never()).findById(any());
    }

    @Test
    @DisplayName("debería lanzar NotFound cuando se actualiza un precio inexistente")
    void shouldThrowNotFoundWhenUpdatingNonExistentPrecio() {
        // Given
        Long idInexistente = faker.number().randomNumber();
        PrecioRequestDTO dto = buildRequestDTO();
        given(precioRepository.findById(idInexistente)).willReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> precioService.actualizar(idInexistente, dto, "ADMIN"))
                .isInstanceOf(NotFound.class);

        verify(precioRepository, never()).save(any());
    }

    //eliminar
    @Test
    @DisplayName("debería lanzar AccesoDenegado cuando EMPLEADO intenta eliminar un precio")
    void shouldThrowAccesoDenegadoWhenEmpleadoTriesToDeletePrecio() {
        // Given
        Long id = faker.number().randomNumber();

        // When / Then
        assertThatThrownBy(() -> precioService.eliminar(id, "EMPLEADO"))
                .isInstanceOf(AccesoDenegado.class);

        verify(precioRepository, never()).deleteById(any());
    }
}