package com.tiendatcg.ms_envios.service;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

import com.tiendatcg.ms_envios.model.Envio;
import com.tiendatcg.ms_envios.repository.EnvioRepository;
import com.tiendatcg.ms_envios.client.PagoClient;
import com.tiendatcg.ms_envios.dto.EnvioRequestDTO;
import com.tiendatcg.ms_envios.dto.EnvioResponseDTO;

// NUESTRAS NUEVAS EXCEPCIONES ESTANDARIZADAS
import com.tiendatcg.ms_envios.exception.NotFound;
import com.tiendatcg.ms_envios.exception.AccesoDenegado;
import com.tiendatcg.ms_envios.exception.DependenciaFallida;
import feign.FeignException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EnvioService {
    
    private final EnvioRepository envioRepository;
    private final PagoClient pagoClient; 

    private boolean esRolPermitido(String rolUsuario, String... roles) {
        if (rolUsuario == null) return false;
        for (String rol : roles) {
            if (rolUsuario.equalsIgnoreCase(rol)) {
                return true;
            }
        }
        return false;
    }

    public List<EnvioResponseDTO> obtenerTodos(String rol) {
        if (!esRolPermitido(rol, "EMPLEADO", "ADMIN")) {
            throw new AccesoDenegado("Acceso denegado: no tienes permisos para ver el historial de envíos.");
        }
        
        return envioRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public EnvioResponseDTO obtenerPorId(Long id, String rol) {
        if (!esRolPermitido(rol, "USER", "EMPLEADO", "ADMIN")) {
            throw new AccesoDenegado("Acceso denegado.");
        }

        Envio envio = envioRepository.findById(id)
                .orElseThrow(() -> new NotFound("Envio no encontrado con ID: " + id));
        return mapToResponseDTO(envio);
    }

    public EnvioResponseDTO crearEnvio(EnvioRequestDTO request, String rol) {
        if (!esRolPermitido(rol, "EMPLEADO", "ADMIN")) {
            throw new AccesoDenegado("Acceso denegado: solo el personal autorizado puede registrar envíos.");
        }

        //  INICIO DE VALIDACIÓN EXTERNA  
        try {
            // Le preguntamos al ms-pagos si el Pedido existe
            pagoClient.obtenerEstadoPago(request.getIdPedidoRef());
        } catch (FeignException.NotFound e) {
            // Si ms-pagos devuelve 404, lanzamos nuestro error formateado
            throw new NotFound("No se puede registrar el envío: El pedido con ID " + request.getIdPedidoRef() + " no existe o no tiene un pago.");
        } catch (FeignException e) {
            // Si ms-pagos está apagado o falla, atrapamos el error
            throw new DependenciaFallida("Error de comunicación con el servicio de pagos.");
        }
        // --- FIN DE VALIDACIÓN EXTERNA ---

        Envio envio = new Envio();
        envio.setIdPedidoRef(request.getIdPedidoRef());
        envio.setDireccionDestino(request.getDireccionDestino());
        envio.setTransportadora(request.getTransportadora());
        envio.setEstadoEnvio(request.getEstadoEnvio());
        
        return mapToResponseDTO(envioRepository.save(envio));
    }

    public EnvioResponseDTO actualizarEnvio(Long id, EnvioRequestDTO request, String rol) {
        if (!esRolPermitido(rol, "EMPLEADO", "ADMIN")) {
            throw new AccesoDenegado("Acceso denegado: solo el personal autorizado puede actualizar envíos.");
        }

        // También validamos externamente en el PUT por si cambian el ID del pedido por error
        try {
            pagoClient.obtenerEstadoPago(request.getIdPedidoRef());
        } catch (FeignException.NotFound e) {
            throw new NotFound("No se puede actualizar: El pedido con ID " + request.getIdPedidoRef() + " no existe.");
        } catch (FeignException e) {
            throw new DependenciaFallida("Error de comunicación con el servicio de pagos.");
        }

        Envio envioExistente = envioRepository.findById(id)
                .orElseThrow(() -> new NotFound("Envio no encontrado con ID: " + id));

        envioExistente.setIdPedidoRef(request.getIdPedidoRef());
        envioExistente.setDireccionDestino(request.getDireccionDestino());
        envioExistente.setTransportadora(request.getTransportadora());
        envioExistente.setEstadoEnvio(request.getEstadoEnvio());
        
        return mapToResponseDTO(envioRepository.save(envioExistente));
    }

    public void eliminarEnvio(Long id, String rol) {
        if (!esRolPermitido(rol, "ADMIN")) {
            throw new AccesoDenegado("Acceso denegado: solo los administradores pueden eliminar envíos.");
        }

        Envio envioExistente = envioRepository.findById(id)
                .orElseThrow(() -> new NotFound("Envio no encontrado con ID: " + id));

        envioRepository.delete(envioExistente);
    }

    private EnvioResponseDTO mapToResponseDTO(Envio envio) {
        EnvioResponseDTO dto = new EnvioResponseDTO();
        dto.setIdEnvio(envio.getIdEnvio());
        dto.setIdPedidoRef(envio.getIdPedidoRef());
        dto.setDireccionDestino(envio.getDireccionDestino());
        dto.setTransportadora(envio.getTransportadora());
        dto.setEstadoEnvio(envio.getEstadoEnvio());
        dto.setFechaCreacion(envio.getFechaCreacion());
        return dto;
    }
}