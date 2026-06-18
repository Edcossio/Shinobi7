package com.tiendatcg.ms_envios.config;

import com.tiendatcg.ms_envios.model.Envio;
import com.tiendatcg.ms_envios.repository.EnvioRepository; // Asegúrate de que este paquete coincida con el tuyo
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;


@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final EnvioRepository envioRepository;

    @Override
    public void run(String... args) throws Exception {

        long totalEnvios = envioRepository.count();

        
        if (totalEnvios > 0) {
            log.info(">>> DataInitializer (ms-envios): La BD ya tiene {} envíos registrados. Omitiendo carga.", totalEnvios);
            return;
        }

        log.info(">>> DataInitializer (ms-envios): BD vacía. Inyectando estados de envío de prueba...");

        Envio envio1 = new Envio(
                null, 
                1001L, 
                "Av. Siempre Viva 742, Springfield", 
                "Starken", 
                "ENTREGADO", 
                null
        );

        Envio envio2 = new Envio(
                null, 
                1002L, 
                "Calle Falsa 123, Ciudad Capital", 
                "Chilexpress", 
                "EN_TRANSITO", 
                null
        );

        Envio envio3 = new Envio(
                null, 
                1003L, 
                "Avenida Providencia 456, Santiago", 
                "Blue Express", 
                "EN_REPARTO", 
                null
        );

        Envio envio4 = new Envio(
                null, 
                1004L, 
                "Baker Street 221B, Londres", 
                "Correos de Chile", 
                "PREPARANDO_PEDIDO", 
                null
        );

        envioRepository.saveAll(List.of(envio1, envio2, envio3, envio4));

        log.info(">>> DataInitializer (ms-envios): Carga completada. {} guías de envío registradas.", 
                envioRepository.count());
    }
}