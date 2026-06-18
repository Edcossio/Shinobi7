package com.tiendatcg.ms_precios.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "ms-catalogo", path = "/api/catalogo", fallback = CatalogoClientFallback.class)
public interface CatalogoClient {

    @GetMapping("/valid/{idCarta}")
    boolean verificarCartaExiste(@PathVariable("idCarta") Long idCarta);
}