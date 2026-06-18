package com.tiendatcg.ms_usuarios.config;

import com.tiendatcg.ms_usuarios.model.Fidelidad;
import com.tiendatcg.ms_usuarios.model.Usuario;
import com.tiendatcg.ms_usuarios.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;

    @Override
    public void run(String... args) throws Exception {

        long totalUsuarios = usuarioRepository.count();

        
        if (totalUsuarios > 0) {
            log.info(">>> DataInitializer (ms-usuarios): Perfiles ya existentes. Omitiendo carga.");
            return;
        }

        log.info(">>> DataInitializer (ms-usuarios): BD vacía. Creando perfiles y fidelidades de clientes...");

        // admin 1 sin fid 
        Usuario admin = new Usuario(null, 1L, "Administrador General TCG", "admin@tiendatcg.com", null, null);
        usuarioRepository.save(admin); 

        // 2 empleado sin fide
        Usuario empleado = new Usuario(null, 2L, "Soporte y Bodega Empleado", "empleado@tiendatcg.com", null, null);
        usuarioRepository.save(empleado);

        // cliente 3 con fidelidad
        Usuario cliente1 = new Usuario(null, 3L, "Eduardo Cossio", "eduardo@tiendatcg.com", "Calle Falsa 123, Valparaíso", null);
        Fidelidad fidCliente1 = new Fidelidad(null, cliente1, 1500, "Gold"); // Inicializa con puntos y categoría
        cliente1.setPuntos(fidCliente1); // Vinculamos
        usuarioRepository.save(cliente1); // Guarda usuario + fidelidad por CascadeALL

    //    cliente 4 con fid 
        Usuario cliente2 = new Usuario(null, 4L, "Ana Silva", "ana@tiendatcg.com", "Av. Alemania 456, Santiago", null);
        Fidelidad fidCliente2 = new Fidelidad(null, cliente2, 1000, "Gold"); // 0 puntos, sin categoría VIP (es opcional)
        cliente2.setPuntos(fidCliente2);
        usuarioRepository.save(cliente2);

        log.info(">>> DataInitializer (ms-usuarios): Carga completada.");
    }
}