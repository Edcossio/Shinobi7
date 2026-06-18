package com.tiendatcg.ms_auth.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // Import encoder
import org.springframework.stereotype.Component;

import com.tiendatcg.ms_auth.model.Autenticacion;
import com.tiendatcg.ms_auth.repository.AuthRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AuthRepository authRepository;
    private final BCryptPasswordEncoder passwordEncoder; 

    @Override
    public void run(String... args) throws Exception {

        long conteoInicial = authRepository.count();

        // Si ya existen datos, evitamos duplicados en cada reinicio del servidor
        if (conteoInicial > 0) {
            log.info(">>> DataInitializer (ms-auth): La BD ya tiene {} registros. Omitiendo carga.", conteoInicial);
            return; 
        }

        log.info(">>> DataInitializer (ms-auth): Base de datos vacía. Insertando cuentas de prueba con hash BCrypt...");

        // passwordEncoder.encode() para transformar el texto plano en un Hash seguro de una sola via
        authRepository.save(new Autenticacion(null, 1L, "admin_tcg", passwordEncoder.encode("admin123"), "ADMIN"));
        authRepository.save(new Autenticacion(null, 2L, "empleado_tcg", passwordEncoder.encode("empleado123"), "EMPLEADO"));
        authRepository.save(new Autenticacion(null, 3L, "eduardo_tcg", passwordEncoder.encode("eduardo123"), "USER"));
        authRepository.save(new Autenticacion(null, 4L, "ana_tcg", passwordEncoder.encode("ana123"), "USER"));

        long conteoFinal = authRepository.count();
        log.info(">>> DataInitializer (ms-auth): Carga exitosa con seguridad BCrypt. Total en BD: {} cuentas listas.", conteoFinal);
    }
}