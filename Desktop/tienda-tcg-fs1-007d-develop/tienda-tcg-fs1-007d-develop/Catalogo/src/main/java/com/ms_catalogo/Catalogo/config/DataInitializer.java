package com.ms_catalogo.Catalogo.config;

import com.ms_catalogo.Catalogo.Repository.CatalogoRepository;
import com.ms_catalogo.Catalogo.model.Catalogo;
 // Ajusta el paquete de tu repositorio
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;


@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CatalogoRepository catalogoRepository;

    @Override
    public void run(String... args) throws Exception {

        long totalCartas = catalogoRepository.count();

        
        if (totalCartas > 0) {
            log.info(">>> DataInitializer (ms-catalogo): La BD ya tiene {} cartas. Omitiendo carga.", totalCartas);
            return;
        }

        log.info(">>> DataInitializer (ms-catalogo): BD vacía. Inyectando cartas base al catálogo...");

       
        // ID Esperado: 1
        Catalogo carta1 = Catalogo.builder()
                .nombre("Charizard 1ra Edición")
                .descripcion(
                        "Carta holográfica icónica, extremadamente rara y muy buscada por coleccionistas del set base.")
                .precio(150.00) // Coincide con ms-precios
                .stockBase(5)
                .categoria("Pokémon TCG - Base Set")
                .build();

        // ID Esperado: 2
        Catalogo carta2 = Catalogo.builder()
                .nombre("Pikachu Básico")
                .descripcion("Carta común del ratón eléctrico, ideal para iniciar cualquier mazo.")
                .precio(5.50) // Coincide con ms-precios
                .stockBase(150)
                .categoria("Pokémon TCG - Común")
                .build();

        // ID Esperado: 3
        Catalogo carta3 = Catalogo.builder()
                .nombre("Mewtwo EX")
                .descripcion("Poderoso atacante psíquico. Una de las cartas más fuertes del meta actual competitivo.")
                .precio(45.99) // Coincide con ms-precios
                .stockBase(25)
                .categoria("Pokémon TCG - EX")
                .build();

        // ID Esperado: 4
        Catalogo carta4 = Catalogo.builder()
                .nombre("Dragón Blanco de Ojos Azules")
                .descripcion("Legendario dragón de destrucción. Nadie puede resistirse a su abrumador poder.")
                .precio(85.00) // Coincide con ms-precios
                .stockBase(12)
                .categoria("Yu-Gi-Oh! - Ultra Rare")
                .build();

        catalogoRepository.saveAll(List.of(carta1, carta2, carta3, carta4));

        log.info(">>> DataInitializer (ms-catalogo): Carga completada. {} cartas disponibles en vitrina.",
                catalogoRepository.count());
    }
}