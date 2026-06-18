package com.tiendatcg.ms_resenas.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "catalogo")
public interface ProductoClient {
    @GetMapping("/api/productos/{id}")
    Object obtenerProductoPorId(@PathVariable("id") Long id);
}