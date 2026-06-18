package com.tiendatcg.ms_pedidos.service;

import com.tiendatcg.ms_pedidos.client.CatalogoClient;
import com.tiendatcg.ms_pedidos.client.InventarioClient;
import com.tiendatcg.ms_pedidos.client.UsuarioClient;
import com.tiendatcg.ms_pedidos.DTO.PedidoRequestDTO;
import com.tiendatcg.ms_pedidos.DTO.PedidoResponseDTO;
import com.tiendatcg.ms_pedidos.exception.AccesoDenegado;
import com.tiendatcg.ms_pedidos.exception.ApiException;
import com.tiendatcg.ms_pedidos.exception.DependenciaFallida;
import com.tiendatcg.ms_pedidos.exception.NotFound;
import com.tiendatcg.ms_pedidos.model.Pedido;
import com.tiendatcg.ms_pedidos.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final UsuarioClient usuarioClient;
    private final CatalogoClient catalogoClient;
    private final InventarioClient inventarioClient;

    //Mapper
    private PedidoResponseDTO mapToDTO(Pedido pedido) {
        return PedidoResponseDTO.builder()
                .idPedido(pedido.getIdPedido())
                .idUsuarioRef(pedido.getIdUsuarioRef())
                .idCartaRef(pedido.getIdCartaRef())
                .cantidad(pedido.getCantidad())
                .precioUnitario(pedido.getPrecioUnitario())
                .montoTotal(pedido.getMontoTotal())
                .estado(pedido.getEstado())
                .fechaPedido(pedido.getFechaPedido())
                .build();
    }

    private boolean esRolPermitido(String rol, String... roles) {
        if (rol == null)
            return false;
        for (String r : roles) {
            if (rol.equalsIgnoreCase(r))
                return true;
        }
        return false;
    }

    //GET todos
    public List<PedidoResponseDTO> obtenerTodos(String rol) {
        if (!esRolPermitido(rol, "ADMIN", "EMPLEADO")) {
            throw new AccesoDenegado(
                    "Acceso denegado: solo administradores o empleados pueden ver todos los pedidos.");
        }
        log.info("[MS-PEDIDOS] Listando todos los pedidos. Rol: {}", rol);
        return pedidoRepository.findAll()
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // GET por ID 
    public Optional<PedidoResponseDTO> obtenerPorId(Long id, String rol,
            Long idUsuarioLogueado) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new NotFound(
                        "Pedido no encontrado con ID: " + id));

        // USER solo puede ver sus propios pedidos
        if (esRolPermitido(rol, "USER")) {
            if (!pedido.getIdUsuarioRef().equals(idUsuarioLogueado)) {
                throw new AccesoDenegado(
                        "Acceso denegado: no puedes ver el pedido de otro usuario.");
            }
        }
        return Optional.of(mapToDTO(pedido));
    }

    // GET por usuario
    public List<PedidoResponseDTO> obtenerPorUsuario(Long idUsuario, String rol,
            Long idUsuarioLogueado) {
        if (esRolPermitido(rol, "USER")) {
            if (!idUsuario.equals(idUsuarioLogueado)) {
                throw new AccesoDenegado(
                        "Acceso denegado: no puedes ver los pedidos de otro usuario.");
            }
        }
        return pedidoRepository.findByIdUsuarioRef(idUsuario)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // POST crear pedido
    public PedidoResponseDTO crear(PedidoRequestDTO dto, String rol,
            Long idUsuarioLogueado) {

        // USER solo puede crear pedidos para sí mismo
        if (esRolPermitido(rol, "USER")) {
            if (!dto.getIdUsuarioRef().equals(idUsuarioLogueado)) {
                throw new AccesoDenegado(
                        "Acceso denegado: no puedes crear un pedido para otro usuario.");
            }
        }

        // 1. Validar que el usuario existe en ms-usuarios
        boolean usuarioExiste;
        try {
            usuarioExiste = usuarioClient.verificarExistencia(dto.getIdUsuarioRef());
        } catch (Exception e) {
            log.error("[MS-PEDIDOS] ms-usuarios no disponible al verificar usuario ID {}: {}",
                    dto.getIdUsuarioRef(), e.getMessage());
            throw new DependenciaFallida(
                    "No se pudo verificar el usuario con ID " + dto.getIdUsuarioRef()
                            + " en ms-usuarios.");
        }
        if (!usuarioExiste) {
            throw new DependenciaFallida(
                    "No se pudo verificar el usuario con ID " + dto.getIdUsuarioRef()
                            + " en ms-usuarios.");
        }

        // 2. Validar que la carta existe en ms-catalogo
        boolean cartaExiste;
        try {
            cartaExiste = catalogoClient.verificarCartaExiste(dto.getIdCartaRef());
        } catch (Exception e) {
            log.error("[MS-PEDIDOS] ms-catalogo no disponible al verificar carta ID {}: {}",
                    dto.getIdCartaRef(), e.getMessage());
            throw new DependenciaFallida(
                    "No se pudo verificar la carta con ID " + dto.getIdCartaRef()
                            + " en ms-catalogo.");
        }
        if (!cartaExiste) {
            throw new NotFound(
                    "La carta con ID " + dto.getIdCartaRef()
                            + " no existe en el catálogo.");
        }

        // 3. Validar stock disponible en ms-inventario
        boolean hayStock;
        try {
            hayStock = inventarioClient.verificarStock(dto.getIdCartaRef(), dto.getCantidad());
        } catch (Exception e) {
            log.error("[MS-PEDIDOS] ms-inventario no disponible al verificar stock carta ID {}: {}",
                    dto.getIdCartaRef(), e.getMessage());
            throw new DependenciaFallida(
                    "No se pudo verificar el stock de la carta con ID " + dto.getIdCartaRef()
                            + " en ms-inventario.");
        }
        if (!hayStock) {
            throw new ApiException(
                    "Stock insuficiente para la carta con ID " + dto.getIdCartaRef()
                            + ". Cantidad solicitada: " + dto.getCantidad(),
                    HttpStatus.CONFLICT);
        }

        // Crear y guardar el pedido
        Pedido pedido = new Pedido();
        pedido.setIdUsuarioRef(dto.getIdUsuarioRef());
        pedido.setIdCartaRef(dto.getIdCartaRef());
        pedido.setCantidad(dto.getCantidad());
        pedido.setPrecioUnitario(dto.getPrecioUnitario());
        // montoTotal y fechaPedido se calculan en @PrePersist

        log.info("[MS-PEDIDOS] Pedido creado para usuario ID {} carta ID {}",
                dto.getIdUsuarioRef(), dto.getIdCartaRef());
        return mapToDTO(pedidoRepository.save(pedido));
    }

    // PUT cambiar estado
    public PedidoResponseDTO cambiarEstado(Long id, String nuevoEstado, String rol) {

        if (!esRolPermitido(rol, "ADMIN", "EMPLEADO")) {
            throw new AccesoDenegado(
                    "Acceso denegado: solo administradores o empleados "
                            + "pueden cambiar el estado de un pedido.");
        }

        List<String> estadosValidos = List.of(
                "PENDIENTE", "CONFIRMADO", "EN_PROCESO",
                "ENVIADO", "ENTREGADO", "CANCELADO");

        if (!estadosValidos.contains(nuevoEstado.toUpperCase())) {
            throw new ApiException(
                    "Estado inválido. Los estados permitidos son: " + estadosValidos,
                    HttpStatus.BAD_REQUEST);
        }

        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new NotFound(
                        "Pedido no encontrado con ID: " + id));

        log.info("[MS-PEDIDOS] Cambiando estado pedido ID {} de {} a {}",
                id, pedido.getEstado(), nuevoEstado.toUpperCase());
        pedido.setEstado(nuevoEstado.toUpperCase());
        return mapToDTO(pedidoRepository.save(pedido));
    }

    // DELETE cancelar pedido 
    public void cancelar(Long id, String rol, Long idUsuarioLogueado) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new NotFound(
                        "Pedido no encontrado con ID: " + id));

        if (esRolPermitido(rol, "USER")) {
            if (!pedido.getIdUsuarioRef().equals(idUsuarioLogueado)) {
                throw new AccesoDenegado(
                        "Acceso denegado: no puedes cancelar el pedido de otro usuario.");
            }
        }

        if (!pedido.getEstado().equals("PENDIENTE")
                && !pedido.getEstado().equals("CONFIRMADO")) {
            throw new ApiException(
                    "No se puede cancelar un pedido en estado: " + pedido.getEstado(),
                    HttpStatus.CONFLICT);
        }

        log.info("[MS-PEDIDOS] Cancelando pedido ID {}", id);
        pedido.setEstado("CANCELADO");
        pedidoRepository.save(pedido);
    }

    // ── Validaciones internas para otros microservicios
    public boolean verificarPedidoExiste(Long idPedido) {
        return pedidoRepository.existsById(idPedido);
    }

    public boolean verificarPropietario(Long idPedido, Long idUsuario) {
        return pedidoRepository.findById(idPedido)
                .map(p -> p.getIdUsuarioRef().equals(idUsuario))
                .orElse(false);
    }
}