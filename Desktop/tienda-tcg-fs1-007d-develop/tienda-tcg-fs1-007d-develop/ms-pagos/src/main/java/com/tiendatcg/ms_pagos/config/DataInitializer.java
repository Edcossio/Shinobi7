package com.tiendatcg.ms_pagos.config;

import com.tiendatcg.ms_pagos.model.Pago;
import com.tiendatcg.ms_pagos.repository.PagoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final PagoRepository pagoRepository;

    @Override
    public void run(String... args) throws Exception {

        long totalPagos = pagoRepository.count();

        if (totalPagos > 0) {
            log.info(">>> DataInitializer (ms-pagos): La BD ya tiene {} pagos. Omitiendo carga.",
                    totalPagos);
            return;
        }

        log.info(">>> DataInitializer (ms-pagos): BD vacía. Insertando pagos de prueba...");

        // Pago completado — pedido 1 de Eduardo (Charizard 1ra edición)
        Pago pago1 = new Pago();
        pago1.setIdPedidoRef(1L);
        pago1.setMontoTotal(new BigDecimal("150.00"));
        pago1.setMetodoPago("TARJETA_CREDITO");
        pago1.setEstadoPago("COMPLETADO");
        pagoRepository.save(pago1);

        // Pago completado — pedido 2 de Ana (Dragon Blanco de Ojos Azules)
        Pago pago2 = new Pago();
        pago2.setIdPedidoRef(2L);
        pago2.setMontoTotal(new BigDecimal("85.00"));
        pago2.setMetodoPago("TRANSFERENCIA");
        pago2.setEstadoPago("COMPLETADO");
        pagoRepository.save(pago2);

        // Pago pendiente — pedido 3 de Eduardo (Mewtwo competitivo)
        Pago pago3 = new Pago();
        pago3.setIdPedidoRef(3L);
        pago3.setMontoTotal(new BigDecimal("45.99"));
        pago3.setMetodoPago("EFECTIVO");
        pago3.setEstadoPago("PENDIENTE");
        pagoRepository.save(pago3);

        // Pago anulado — pedido 4 (devolución)
        Pago pago4 = new Pago();
        pago4.setIdPedidoRef(4L);
        pago4.setMontoTotal(new BigDecimal("5.50"));
        pago4.setMetodoPago("TARJETA_DEBITO");
        pago4.setEstadoPago("ANULADO");
        pagoRepository.save(pago4);

        log.info(">>> DataInitializer (ms-pagos): Carga completada. {} pagos insertados.",
                pagoRepository.count());
    }
}