package com.ms_inventario.Inventario.ms_inventory.inventario.controller;

import java.util.List;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ms_inventario.Inventario.ms_inventory.inventario.dto.InventarioRequestDTO;
import com.ms_inventario.Inventario.ms_inventory.inventario.dto.InventarioResponseDTO;
import com.ms_inventario.Inventario.ms_inventory.inventario.service.InventarioService;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/inventario")
public class InventarioController {

    private final InventarioService inventarioService;

    @GetMapping
    public ResponseEntity<List<InventarioResponseDTO>> getAllInventarios() {
        return ResponseEntity.ok(inventarioService.getAllInventarios());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventarioResponseDTO> getInventarioById(@PathVariable Long id) {
        return ResponseEntity.ok(inventarioService.getInventarioById(id));
    }

    @GetMapping("/carta/{idCartaRef}")
    public ResponseEntity<List<InventarioResponseDTO>> getInventariosByCartaRef(@PathVariable Long idCartaRef) {
        return ResponseEntity.ok(inventarioService.getInventariosByCartaRef(idCartaRef));
    }

    @GetMapping("/carta/{idCartaRef}/estado/{estadoCarta}")
    public ResponseEntity<InventarioResponseDTO> getInventarioByCartaRefAndEstado(
            @PathVariable Long idCartaRef,
            @PathVariable String estadoCarta) {
        return ResponseEntity.ok(inventarioService.getInventarioByCartaRefAndEstado(idCartaRef, estadoCarta));
    }

    @PostMapping
    public ResponseEntity<InventarioResponseDTO> createInventario(@Valid @RequestBody InventarioRequestDTO requestDTO) {
        InventarioResponseDTO response = inventarioService.saveInventario(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventarioResponseDTO> updateInventario(
            @PathVariable Long id,
            @Valid @RequestBody InventarioRequestDTO requestDTO) {
        return ResponseEntity.ok(inventarioService.updateInventario(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInventario(@PathVariable Long id) {
        inventarioService.deleteInventario(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/stock/add")
    public ResponseEntity<InventarioResponseDTO> addStock(
            @PathVariable Long id,
            @RequestParam int cantidad) {
        return ResponseEntity.ok(inventarioService.addStock(id, cantidad));
    }

    @PatchMapping("/{id}/stock/remove")
    public ResponseEntity<InventarioResponseDTO> removeStock(
            @PathVariable Long id,
            @RequestParam int cantidad) {
        return ResponseEntity.ok(inventarioService.subtractStock(id, cantidad));
    }
}
