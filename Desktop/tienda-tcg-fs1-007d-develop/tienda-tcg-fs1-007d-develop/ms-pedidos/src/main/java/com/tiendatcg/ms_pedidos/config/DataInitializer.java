package com.tiendatcg.ms_pedidos.config;

import com.tiendatcg.ms_pedidos.model.Pedido;
import com.tiendatcg.ms_pedidos.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final PedidoRepository pedidoRepository;

    @Override
    public void run(String... args) throws Exception {

        if (pedidoRepository.count() > 0) {
            log.info(">>> DataInitializer (ms-pedidos): BD ya tiene datos. Omitiendo.");
            return;
        }

        log.info(">>> DataInitializer (ms-pedidos): Insertando pedidos de prueba...");

        // Pedido 1 — Eduardo compra Charizard 1ra edición
        // Pago: COMPLETADO → Pedido: ENTREGADO
        Pedido p1 = new Pedido();
        p1.setIdUsuarioRef(3L);
        p1.setIdCartaRef(1L);
        p1.setCantidad(1);
        p1.setPrecioUnitario(new BigDecimal("150.00"));
        p1.setEstado("ENTREGADO");
        pedidoRepository.save(p1);

        // Pedido 2 — Ana compra Dragon Blanco de Ojos Azules
        // Pago: COMPLETADO → Pedido: ENVIADO
        Pedido p2 = new Pedido();
        p2.setIdUsuarioRef(4L);
        p2.setIdCartaRef(4L);
        p2.setCantidad(1);
        p2.setPrecioUnitario(new BigDecimal("85.00"));
        p2.setEstado("ENVIADO");
        pedidoRepository.save(p2);

        // Pedido 3 — Eduardo compra Mewtwo competitivo x2
        // Pago: PENDIENTE → Pedido: CONFIRMADO
        Pedido p3 = new Pedido();
        p3.setIdUsuarioRef(3L);
        p3.setIdCartaRef(3L);
        p3.setCantidad(2);
        p3.setPrecioUnitario(new BigDecimal("45.99"));
        p3.setEstado("CONFIRMADO");
        pedidoRepository.save(p3);

        // Pedido 4 — Ana compra Pikachu básico x3
        // Pago: ANULADO → Pedido: CANCELADO
        Pedido p4 = new Pedido();
        p4.setIdUsuarioRef(4L);
        p4.setIdCartaRef(2L);
        p4.setCantidad(3);
        p4.setPrecioUnitario(new BigDecimal("5.50"));
        p4.setEstado("CANCELADO");
        pedidoRepository.save(p4);

        log.info(">>> DataInitializer (ms-pedidos): {} pedidos insertados.",
                pedidoRepository.count());
    }
}