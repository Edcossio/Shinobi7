package com.tiendatcg.ms_notificaciones.config;

import com.tiendatcg.ms_notificaciones.model.Notificacion;
import com.tiendatcg.ms_notificaciones.repository.NotificacionRepository; 
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;


@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final NotificacionRepository notificacionRepository;

    @Override
    public void run(String... args) throws Exception {

        long totalNotificaciones = notificacionRepository.count();

        
        if (totalNotificaciones > 0) {
            log.info(">>> DataInitializer (ms-notificaciones): La BD ya tiene {} notificaciones. Omitiendo carga.",
                    totalNotificaciones);
            return;
        }

        log.info(">>> DataInitializer (ms-notificaciones): BD vacía. Disparando notificaciones de prueba...");

        // Notificación 1: Bienvenida a Eduardo (Usuario 3)
        Notificacion noti1 = new Notificacion();
        noti1.setIdUsuarioDestino(3L);
        noti1.setTitulo("¡Bienvenido a Tienda TCG!");
        noti1.setMensaje("Hola Eduardo, tu cuenta ha sido verificada exitosamente. ¡A coleccionar!");
        noti1.setLeida(true); 

        // Notificación 2: Alerta de envío para Eduardo (Usuario 3)
        Notificacion noti2 = new Notificacion();
        noti2.setIdUsuarioDestino(3L);
        noti2.setTitulo("Tu pedido está en camino 🚚");
        noti2.setMensaje("El pedido #1001 con tu Charizard 1ra Edición ha sido entregado a Starken.");
        noti2.setLeida(false); 

        // Notificación 3: Alerta de Stock para Usuario 1
        Notificacion noti3 = new Notificacion();
        noti3.setIdUsuarioDestino(1L);
        noti3.setTitulo("¡Pikachu volvió al stock!");
        noti3.setMensaje("La carta que tenías en tu lista de deseos vuelve a estar disponible.");
        noti3.setLeida(false);

        // Notificación 4: Interacción en comunidad para Usuario 2
        Notificacion noti4 = new Notificacion();
        noti4.setIdUsuarioDestino(2L);
        noti4.setTitulo("Nueva interacción");
        noti4.setMensaje("A alguien le ha resultado útil tu reseña sobre Mewtwo EX.");
        noti4.setLeida(false);

        
        notificacionRepository.saveAll(List.of(noti1, noti2, noti3, noti4));

        log.info(">>> DataInitializer (ms-notificaciones): Carga completada. {} notificaciones en el buzón.",
                notificacionRepository.count());
    }
}