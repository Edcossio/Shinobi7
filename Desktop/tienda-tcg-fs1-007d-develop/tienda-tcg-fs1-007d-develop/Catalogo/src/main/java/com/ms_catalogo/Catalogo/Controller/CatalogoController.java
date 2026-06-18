package com.ms_catalogo.Catalogo.Controller;

import com.ms_catalogo.Catalogo.DTOs.CatalogoRequestDTO;
import com.ms_catalogo.Catalogo.DTOs.CatalogoResponseDTO;
import com.ms_catalogo.Catalogo.Service.CatalogoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalogo")
@RequiredArgsConstructor
public class CatalogoController {

    private final CatalogoService catalogoService;

    @GetMapping
    public ResponseEntity<List<CatalogoResponseDTO>> obtenerTodas() {
        return ResponseEntity.ok(catalogoService.obtenerTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CatalogoResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(catalogoService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<CatalogoResponseDTO> crear(@Valid @RequestBody CatalogoRequestDTO requestDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalogoService.crear(requestDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CatalogoResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CatalogoRequestDTO requestDTO) {
        return ResponseEntity.ok(catalogoService.actualizar(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        catalogoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/nombre/{nombre}")
    public ResponseEntity<?> buscarPorNombre(@PathVariable String nombre) {
        return catalogoService.buscarPorNombre(nombre)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<List<CatalogoResponseDTO>> obtenerPorCategoria(@PathVariable String categoria) {
        return ResponseEntity.ok(catalogoService.obtenerPorCategoria(categoria));
    }

    @GetMapping("/buscar/nombre")
    public ResponseEntity<List<CatalogoResponseDTO>> buscarPorNombreContiene(@RequestParam String termino) {
        return ResponseEntity.ok(catalogoService.buscarPorNombreContiene(termino));
    }

    @GetMapping("/buscar/rango-precio")
    public ResponseEntity<List<CatalogoResponseDTO>> buscarPorRangoPrecio(
            @RequestParam Double precioMinimo,
            @RequestParam Double precioMaximo) {
        return ResponseEntity.ok(catalogoService.buscarPorRangoPrecio(precioMinimo, precioMaximo));
    }

    @GetMapping("/mayor-precio")
    public ResponseEntity<List<CatalogoResponseDTO>> obtenerMayorPrecio(
            @RequestParam(defaultValue = "10") int limite) {
        return ResponseEntity.ok(catalogoService.obtenerCartasConMayorPrecio(limite));
    }

    @GetMapping("/ordenadas")
    public ResponseEntity<List<CatalogoResponseDTO>> obtenerOrdenadas() {
        return ResponseEntity.ok(catalogoService.obtenerOrdenadas());
    }

    @GetMapping("/buscar/categoria-precio")
    public ResponseEntity<List<CatalogoResponseDTO>> buscarPorCategoriaYRangoPrecio(
            @RequestParam String categoria,
            @RequestParam Double precioMinimo,
            @RequestParam Double precioMaximo) {
        return ResponseEntity.ok(catalogoService.buscarPorCategoriaYRangoPrecio(categoria, precioMinimo, precioMaximo));
    }

    @GetMapping("/contar/categoria/{categoria}")
    public ResponseEntity<Long> contarPorCategoria(@PathVariable String categoria) {
        return ResponseEntity.ok(catalogoService.contarPorCategoria(categoria));
    }
}