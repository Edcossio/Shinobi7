package com.ms_shopingcart.config;

import com.ms_shopingcart.model.Carrito;
import com.ms_shopingcart.model.ItemCarrito;
import com.ms_shopingcart.repository.CarritoRepository; // Ajusta a tu paquete real
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CarritoRepository carritoRepository;

    @Override
    public void run(String... args) throws Exception {

        long totalCarritos = carritoRepository.count();

        
        if (totalCarritos > 0) {
            log.info(">>> DataInitializer (ms-shopping-cart): La BD ya tiene {} carritos. Omitiendo carga.",
                    totalCarritos);
            return;
        }

        log.info(">>> DataInitializer (ms-shopping-cart): BD vacía. Armando carritos de prueba...");

        // carrito usuario 3 con item 1l e item 2l
        Carrito carritoEduardo = Carrito.builder()
                .usuarioId(3L)
                .build();

       
        ItemCarrito item1 = ItemCarrito.builder()
                // Charizard
                .cartaId(1L) 
                .cantidad(1)
                .precioUnitario(150.00)
                .carrito(carritoEduardo) // 
                .build();
        item1.calcularSubtotal(); 

        ItemCarrito item2 = ItemCarrito.builder()
                // Pikachu
                .cartaId(2L) 
                .cantidad(2)
                .precioUnitario(5.50)
                .carrito(carritoEduardo)
                .build();
        item2.calcularSubtotal();

        
        carritoEduardo.getItems().add(item1);
        carritoEduardo.getItems().add(item2);

        // CARRO 2 ABANDONADO 
        Carrito carritoAbandonado = Carrito.builder()
                .usuarioId(1L)
                // Sobrescribimos el estado 
                .estado("ABANDONADO") 
                .build();

        ItemCarrito item3 = ItemCarrito.builder()
                // Dragón Blanco
                .cartaId(4L) 
                .cantidad(1)
                .precioUnitario(85.00)
                .carrito(carritoAbandonado)
                .build();
        item3.calcularSubtotal();

        carritoAbandonado.getItems().add(item3);

       
        carritoRepository.saveAll(List.of(carritoEduardo, carritoAbandonado));

        log.info(">>> DataInitializer (ms-shopping-cart): Carga completada. {} carritos guardados.",
                carritoRepository.count());
    }
}