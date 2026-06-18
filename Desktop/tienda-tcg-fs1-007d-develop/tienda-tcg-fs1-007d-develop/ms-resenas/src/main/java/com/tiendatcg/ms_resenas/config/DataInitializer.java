package com.tiendatcg.ms_resenas.config;

import com.tiendatcg.ms_resenas.model.Resena;
import com.tiendatcg.ms_resenas.repository.ResenaRepository; 
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ResenaRepository resenaRepository;

    @Override
    public void run(String... args) throws Exception {

        long totalResenas = resenaRepository.count();

        
        if (totalResenas > 0) {
            log.info(">>> DataInitializer (ms-resenas): La BD ya tiene {} reseñas. Omitiendo carga.", totalResenas);
            return;
        }

        log.info(">>> DataInitializer (ms-resenas): BD vacía. Inyectando reseñas de la comunidad...");


        // Reseña 1: Eduardo (ID 3) compró el Charizard (ID 1)
        Resena resena1 = new Resena();
        resena1.setIdUsuarioRef(3L);
        resena1.setIdProductoRef(1L);
        resena1.setCalificacion(5);
        resena1.setComentario("¡Increíble carta! Llegó en perfectas condiciones. El Charizard es el rey. 10/10.");

        // Reseña 2: Usuario random compró a Pikachu (ID 2)
        Resena resena2 = new Resena();
        resena2.setIdUsuarioRef(1L);
        resena2.setIdProductoRef(2L);
        resena2.setCalificacion(4);
        resena2.setComentario("Muy bonita, aunque el centrado del arte no es perfecto. Excelente precio.");

        // Reseña 3: Usuario competitivo compró a Mewtwo EX (ID 3)
        Resena resena3 = new Resena();
        resena3.setIdUsuarioRef(2L);
        resena3.setIdProductoRef(3L);
        resena3.setCalificacion(5);
        resena3.setComentario("Destroza en el competitivo. La mejor compra para potenciar mi mazo psíquico.");

        // Reseña 4: Nostálgico compró el Dragón Blanco (ID 4)
        Resena resena4 = new Resena();
        resena4.setIdUsuarioRef(4L);
        resena4.setIdProductoRef(4L);
        resena4.setCalificacion(3);
        resena4.setComentario("La carta es un clásico hermoso, pero el sobre de empaque llegó un poco doblado.");

        // Guardado en lote (batch)
        resenaRepository.saveAll(List.of(resena1, resena2, resena3, resena4));

        log.info(">>> DataInitializer (ms-resenas): Carga completada. {} reseñas publicadas.",
                resenaRepository.count());
    }
}