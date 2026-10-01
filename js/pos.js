// ============================================================
// SISTEMA POS SHINOBI7 - LÓGICA FRONT-OFFICE & SEGURIDAD RBAC
// ============================================================

let carritoPOS = [];
let pagosDivididosPOS = [];
let descuentoPorcentajePOS = 0;
let codigoCuponActivoPOS = "";

let accionPendienteSupervisor = null;
let boletaSeleccionadaSupervisor = null;

// ============================================================
// 1. GESTIÓN DE TURNO DE CAJA & ARQUEO A CIEGAS
// ============================================================

function obtenerTurnoActivo() {
    const sesion = sessionStorage.getItem("sesionActiva");
    if (!sesion) return null;
    const usuario = JSON.parse(sesion);

    const turnoRaw = localStorage.getItem("collector_pos_turno_activo");
    if (!turnoRaw) return null;

    const turno = JSON.parse(turnoRaw);
    return (turno && turno.cajeroCorreo === usuario.correo && turno.estado === "ABIERTO") ? turno : null;
}

function actualizarEstadoTurnoUI() {
    const turno = obtenerTurnoActivo();
    const badge = document.getElementById("pos-badge-estado-turno");
    const btnAbrir = document.getElementById("btn-abrir-turno-ui");
    const btnCerrar = document.getElementById("btn-cerrar-turno-ui");
    const btnCobro = document.getElementById("btn-procesar-cobro");

    if (turno) {
        if (badge) {
            badge.className = "badge bg-success text-white border border-dark fw-bold";
            badge.textContent = `TURNO ABIERTO (#${turno.id})`;
        }
        if (btnAbrir) btnAbrir.disabled = true;
        if (btnCerrar) btnCerrar.disabled = false;
        if (btnCobro) btnCobro.disabled = carritoPOS.length === 0;
    } else {
        if (badge) {
            badge.className = "badge bg-danger text-white border border-dark fw-bold";
            badge.textContent = "TURNO CERRADO";
        }
        if (btnAbrir) btnAbrir.disabled = false;
        if (btnCerrar) btnCerrar.disabled = true;
        if (btnCobro) btnCobro.disabled = true;
    }
}

function mostrarModalAperturaTurno() {
    if (obtenerTurnoActivo()) {
        mostrarMensaje("Ya tienes un turno de caja abierto.");
        return;
    }
    abrirModalLimpio("modalAperturaTurno");
}

function confirmarAperturaTurno() {
    const montoInput = document.getElementById("input-monto-inicial")?.value;
    const vMonto = validarMontoDinero(montoInput);

    if (!vMonto.valido) {
        mostrarMensaje(vMonto.msj);
        return;
    }

    const sesion = JSON.parse(sessionStorage.getItem("sesionActiva"));
    const nuevoTurno = {
        id: "TRN-" + Date.now().toString().slice(-6),
        cajeroCorreo: sesion.correo,
        cajeroNombre: sesion.nombre,
        montoInicial: vMonto.monto,
        fechaApertura: new Date().toISOString(),
        estado: "ABIERTO"
    };

    localStorage.setItem("collector_pos_turno_activo", JSON.stringify(nuevoTurno));
    registrarLogAuditoria("APERTURA_TURNO", `Apertura de turno #${nuevoTurno.id} con fondo inicial $${vMonto.monto}`);

    cerrarModal("modalAperturaTurno");
    actualizarEstadoTurnoUI();
    mostrarMensaje(`¡Turno #${nuevoTurno.id} abierto exitosamente con $${vMonto.monto.toLocaleString('es-CL')} de caja inicial!`, false);
}

function mostrarModalCierreTurno() {
    const turno = obtenerTurnoActivo();
    if (!turno) return mostrarMensaje("No hay ningún turno abierto actualmente.");

    document.getElementById("input-monto-declarado").value = "";
    abrirModalLimpio("modalCierreTurno");
}

function confirmarCierreTurnoACiegas() {
    const turno = obtenerTurnoActivo();
    if (!turno) return;

    const montoDeclaradoInput = document.getElementById("input-monto-declarado")?.value;
    const vMonto = validarMontoDinero(montoDeclaradoInput);

    if (!vMonto.valido) {
        mostrarMensaje("Ingresa el monto de dinero físico recontado.");
        return;
    }

    const boletas = JSON.parse(localStorage.getItem("collector_boletas") || "[]");
    const boletasTurno = boletas.filter(b => b.turnoId === turno.id && !b.anulada);

    const efectivoVentas = boletasTurno.reduce((acc, b) => {
        const pagoEfectivo = b.pagos.find(p => p.metodo.toLowerCase().includes("efectivo"));
        return acc + (pagoEfectivo ? pagoEfectivo.monto : 0);
    }, 0);

    const saldoEsperadoEfectivo = turno.montoInicial + efectivoVentas;
    const diferenciaCaja = vMonto.monto - saldoEsperadoEfectivo;

    const resumenCierre = {
        ...turno,
        fechaCierre: new Date().toISOString(),
        montoDeclaradoFisico: vMonto.monto,
        saldoEsperadoCalculado: saldoEsperadoEfectivo,
        diferencia: diferenciaCaja,
        estado: "CERRADO"
    };

    const historialTurnos = JSON.parse(localStorage.getItem("collector_pos_turnos_historial") || "[]");
    historialTurnos.push(resumenCierre);
    localStorage.setItem("collector_pos_turnos_historial", JSON.stringify(historialTurnos));
    localStorage.removeItem("collector_pos_turno_activo");

    registrarLogAuditoria("ARQUEO_CERRADO", `Turno #${turno.id} cerrado a ciegas. Declarado: $${vMonto.monto}`);

    cerrarModal("modalCierreTurno");
    actualizarEstadoTurnoUI();

    mostrarMensaje("Turno de caja cerrado correctamente. La entrega de fondos ha sido registrada para revisión de la administración.", false);
}

// ============================================================
// 2. CATÁLOGO, ESCÁNER DE BARRAS Y CARRITO
// ============================================================

function obtenerProductosPOS() {
    const productos = typeof getProductosBD === "function" ? getProductosBD() : [];
    return productos.filter(p => !p.esProximo);
}

function renderizarProductosPOS(lista) {
    const contenedor = document.getElementById("pos-contenedor-productos");
    if (!contenedor) return;

    const productos = lista || obtenerProductosPOS();
    contenedor.innerHTML = "";

    if (productos.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12 p-4 text-center fw-bold text-muted">
                No se encontraron productos disponibles en el inventario.
            </div>
        `;
        return;
    }

    productos.forEach(prod => {
        const sinStock = prod.stock <= 0;
        const esCritico = prod.stock <= (prod.stockCritico || 3);
        const img = Array.isArray(prod.imagenes) ? prod.imagenes[0] : (prod.imagen || 'images/placeholder.jpg');

        contenedor.innerHTML += `
            <div class="col-12 col-sm-6 col-md-4 col-xl-3">
                <div class="card p-2 h-100 border-2 shadow-sm d-flex flex-column justify-content-between ${sinStock ? 'opacity-50' : ''}">
                    <div>
                        <div class="text-center mb-2 bg-white border border-dark" style="height: 100px; display: flex; align-items: center; justify-content: center;">
                            <img src="${img}" alt="${prod.nombre}" style="max-height: 90px; max-width: 100%; object-fit: contain;">
                        </div>
                        <span class="badge bg-dark text-white small mb-1">${prod.id}</span>
                        <h6 class="fw-bold mb-1 text-truncate small text-uppercase" title="${prod.nombre}">${prod.nombre}</h6>
                        <div class="d-flex justify-content-between align-items-center small mb-2">
                            <span class="fw-bold text-primary">$${prod.precio.toLocaleString('es-CL')}</span>
                            <span class="badge ${sinStock ? 'bg-secondary' : (esCritico ? 'bg-danger' : 'bg-success')}">
                                Stock: ${prod.stock}
                            </span>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-primary w-100 fw-bold border-2 border-dark text-uppercase" 
                            onclick="agregarItemPOS('${prod.id}')" ${sinStock ? 'disabled' : ''}>
                        <i class="bi bi-cart-plus"></i> Agregar
                    </button>
                </div>
            </div>
        `;
    });
}

function filtrarProductosPOS() {
    const input = document.getElementById("pos-buscar");
    const query = input?.value.toLowerCase().trim() || "";
    const categoria = document.getElementById("pos-categoria")?.value || "";

    let resultados = obtenerProductosPOS();

    if (query) {
        const coincidenciaExacta = resultados.find(p => p.id.toLowerCase() === query);
        if (coincidenciaExacta && coincidenciaExacta.stock > 0) {
            agregarItemPOS(coincidenciaExacta.id);
            if (input) input.value = "";
            return;
        }

        resultados = resultados.filter(p =>
            p.nombre.toLowerCase().includes(query) ||
            p.id.toLowerCase().includes(query)
        );
    }

    if (categoria) {
        resultados = resultados.filter(p => p.categoria === categoria);
    }

    renderizarProductosPOS(resultados);
}

function agregarItemPOS(idProducto) {
    if (!obtenerTurnoActivo()) {
        mostrarMensaje("Debes abrir un turno de caja antes de agregar productos.");
        mostrarModalAperturaTurno();
        return;
    }

    const productos = obtenerProductosPOS();
    const prod = productos.find(p => p.id === idProducto);
    if (!prod) return;

    const itemExistente = carritoPOS.find(i => i.id === idProducto);
    const cantActual = itemExistente ? itemExistente.cantidad : 0;

    if (cantActual + 1 > prod.stock) {
        mostrarMensaje(`Stock insuficiente para "${prod.nombre}". Unidades disponibles: ${prod.stock}`);
        return;
    }

    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carritoPOS.push({
            id: prod.id,
            nombre: prod.nombre,
            precio: prod.precio,
            cantidad: 1,
            stockMax: prod.stock
        });
    }

    renderizarCarritoPOS();
}

function cambiarCantidadPOS(idProducto, nuevaCant) {
    const cantidad = parseInt(nuevaCant);
    const item = carritoPOS.find(i => i.id === idProducto);
    if (!item) return;

    if (isNaN(cantidad) || cantidad <= 0) {
        eliminarItemPOS(idProducto);
        return;
    }

    if (cantidad > item.stockMax) {
        mostrarMensaje(`No puedes superar el stock disponible (${item.stockMax} unidades).`);
        item.cantidad = item.stockMax;
    } else {
        item.cantidad = cantidad;
    }

    renderizarCarritoPOS();
}

function eliminarItemPOS(idProducto) {
    carritoPOS = carritoPOS.filter(i => i.id !== idProducto);
    renderizarCarritoPOS();
}

function vaciarCarritoPOS() {
    if (carritoPOS.length === 0) return;
    carritoPOS = [];
    descuentoPorcentajePOS = 0;
    codigoCuponActivoPOS = "";

    const selCupon = document.getElementById("pos-select-cupon");
    if (selCupon) selCupon.value = "";

    renderizarCarritoPOS();
}

function aplicarCuponPOS() {
    const cupon = document.getElementById("pos-select-cupon")?.value;
    const CUPONES = { "DUOC10": 0.10, "SHINOBI20": 0.20, "VAULT15": 0.15 };

    if (cupon && CUPONES[cupon]) {
        descuentoPorcentajePOS = CUPONES[cupon];
        codigoCuponActivoPOS = cupon;
    } else {
        descuentoPorcentajePOS = 0;
        codigoCuponActivoPOS = "";
    }

    renderizarCarritoPOS();
}

function renderizarCarritoPOS() {
    const contenedorTicket = document.getElementById("pos-items-ticket");
    const elSubtotal = document.getElementById("pos-subtotal");
    const elDescuento = document.getElementById("pos-descuento");
    const elIva = document.getElementById("pos-iva");
    const elTotal = document.getElementById("pos-total");
    const btnCobro = document.getElementById("btn-procesar-cobro");

    if (!contenedorTicket) return;

    if (carritoPOS.length === 0) {
        contenedorTicket.innerHTML = `
            <div class="text-center text-muted my-4 py-3 border border-2 border-dashed">
                <i class="bi bi-cart-x fs-2 d-block mb-1"></i>
                <span class="fw-bold small">Carrito vacío.</span>
            </div>
        `;
        if (elSubtotal) elSubtotal.textContent = "$0";
        if (elDescuento) elDescuento.textContent = "$0";
        if (elIva) elIva.textContent = "$0";
        if (elTotal) elTotal.textContent = "$0";
        if (btnCobro) btnCobro.disabled = true;
        return;
    }

    contenedorTicket.innerHTML = "";
    let subtotal = 0;

    carritoPOS.forEach(item => {
        const totalLinea = item.precio * item.cantidad;
        subtotal += totalLinea;

        contenedorTicket.innerHTML += `
            <div class="p-2 border-2 border-dark mb-2 bg-white shadow-sm">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-bold small text-truncate" style="max-width: 170px;">${item.nombre}</span>
                    <button class="btn btn-sm btn-link text-danger p-0 border-0" onclick="eliminarItemPOS('${item.id}')">
                        <i class="bi bi-x-circle-fill"></i>
                    </button>
                </div>
                <div class="d-flex justify-content-between align-items-center small">
                    <div class="d-flex align-items-center gap-1">
                        <span class="text-muted">$${item.precio.toLocaleString('es-CL')} x</span>
                        <input type="number" class="form-control form-control-sm border-2 border-dark text-center fw-bold px-1" 
                               style="width: 55px;" value="${item.cantidad}" min="1" max="${item.stockMax}" 
                               onchange="cambiarCantidadPOS('${item.id}', this.value)">
                    </div>
                    <span class="fw-bold text-primary">$${totalLinea.toLocaleString('es-CL')}</span>
                </div>
            </div>
        `;
    });

    const montoDescuento = Math.round(subtotal * descuentoPorcentajePOS);
    const totalConDescuento = subtotal - montoDescuento;
    const montoIva = Math.round(totalConDescuento - (totalConDescuento / 1.19));

    if (elSubtotal) elSubtotal.textContent = `$${subtotal.toLocaleString('es-CL')}`;
    if (elDescuento) elDescuento.textContent = descuentoPorcentajePOS > 0 ? `-$${montoDescuento.toLocaleString('es-CL')} (${codigoCuponActivoPOS})` : "$0";
    if (elIva) elIva.textContent = `$${montoIva.toLocaleString('es-CL')}`;
    if (elTotal) elTotal.textContent = `$${totalConDescuento.toLocaleString('es-CL')}`;
    if (btnCobro) btnCobro.disabled = !obtenerTurnoActivo();
}

// ============================================================
// 3. PAGO DIVIDIDO, INFERENCIA Y MONTO EXACTO EN TARJETAS
// ============================================================

function calcularTotalesCarritoPOS() {
    const subtotal = carritoPOS.reduce((acc, i) => acc + (i.precio * i.cantidad), 0);
    const descuento = Math.round(subtotal * descuentoPorcentajePOS);
    const total = subtotal - descuento;
    const iva = Math.round(total - (total / 1.19));
    return { subtotal, descuento, total, iva };
}

function abrirModalCobro() {
    if (!obtenerTurnoActivo()) return mostrarMensaje("Debes abrir turno.");
    if (carritoPOS.length === 0) return mostrarMensaje("El carrito está vacío.");

    pagosDivididosPOS = [];

    const selectMetodo = document.getElementById("cobro-metodo-sel");
    if (selectMetodo) {
        selectMetodo.value = "Efectivo";
        selectMetodo.onchange = autoInferirMontoPendiente;
    }

    actualizarModalCobroUI();
    autoInferirMontoPendiente();
    abrirModalLimpio("modalCobroPOS");
}

function autoInferirMontoPendiente() {
    const { total } = calcularTotalesCarritoPOS();
    const totalCubierto = pagosDivididosPOS.reduce((acc, p) => acc + p.monto, 0);
    const falta = Math.max(0, total - totalCubierto);

    const inputMonto = document.getElementById("cobro-monto-input");
    const selectMetodo = document.getElementById("cobro-metodo-sel");
    const labelMonto = document.getElementById("cobro-monto-label");
    const helpMetodo = document.getElementById("cobro-metodo-help");

    const metodo = selectMetodo ? selectMetodo.value : "Efectivo";
    const esEfectivo = metodo.toLowerCase().includes("efectivo");

    if (inputMonto) {
        inputMonto.value = falta > 0 ? falta : "";
    }

    if (labelMonto) {
        labelMonto.textContent = esEfectivo
            ? "Monto Recibido en Efectivo:"
            : `Monto a Procesar (${metodo}):`;
    }

    if (helpMetodo) {
        helpMetodo.textContent = esEfectivo
            ? "En efectivo puedes ingresar un monto mayor para calcular el vuelto."
            : "Cobro por monto exacto en terminal POS/Transferencia (No entrega vuelto).";
    }
}

function agregarPagoDividido() {
    const metodo = document.getElementById("cobro-metodo-sel")?.value || "Efectivo";
    const montoInput = document.getElementById("cobro-monto-input")?.value;
    const vMonto = validarMontoDinero(montoInput);

    if (!vMonto.valido || vMonto.monto <= 0) return mostrarMensaje("Ingresa un monto válido.");

    const { total } = calcularTotalesCarritoPOS();
    const totalCubierto = pagosDivididosPOS.reduce((acc, p) => acc + p.monto, 0);
    const falta = Math.max(0, total - totalCubierto);
    const esEfectivo = metodo.toLowerCase().includes("efectivo");

    // REGLA CLAVE: Pagos electrónicos (Tarjeta/Transferencia) NO pueden superar el saldo pendiente
    if (!esEfectivo && vMonto.monto > falta) {
        mostrarMensaje(`Los pagos con ${metodo} no pueden superar el saldo pendiente ($${falta.toLocaleString('es-CL')}) ya que son cobros de monto exacto y no generan vuelto.`);
        return;
    }

    pagosDivididosPOS.push({ metodo, monto: vMonto.monto });
    actualizarModalCobroUI();
    autoInferirMontoPendiente();
}

function eliminarPagoDividido(index) {
    pagosDivididosPOS.splice(index, 1);
    actualizarModalCobroUI();
    autoInferirMontoPendiente();
}

function actualizarModalCobroUI() {
    const { total } = calcularTotalesCarritoPOS();
    const totalCubierto = pagosDivididosPOS.reduce((acc, p) => acc + p.monto, 0);
    const falta = Math.max(0, total - totalCubierto);

    // CÁLCULO EXCLUSIVO DE VUELTO PARA EFECTIVO
    const pagosEfectivo = pagosDivididosPOS.filter(p => p.metodo.toLowerCase().includes("efectivo")).reduce((acc, p) => acc + p.monto, 0);
    const otrosPagos = totalCubierto - pagosEfectivo;
    const restanteParaEfectivo = Math.max(0, total - otrosPagos);
    const vuelto = Math.max(0, pagosEfectivo - restanteParaEfectivo);

    document.getElementById("cobro-modal-total").textContent = `$${total.toLocaleString('es-CL')}`;
    document.getElementById("cobro-modal-cubierto").textContent = `$${totalCubierto.toLocaleString('es-CL')}`;
    document.getElementById("cobro-modal-falta").textContent = `$${falta.toLocaleString('es-CL')}`;
    document.getElementById("cobro-modal-vuelto").textContent = `$${vuelto.toLocaleString('es-CL')}`;

    const listaUL = document.getElementById("lista-pagos-divididos");
    if (listaUL) {
        listaUL.innerHTML = pagosDivididosPOS.map((p, idx) => `
            <li class="list-group-item d-flex justify-content-between align-items-center p-2 small fw-bold">
                <span>${p.metodo}: $${p.monto.toLocaleString('es-CL')}</span>
                <button class="btn btn-sm btn-link text-danger p-0" onclick="eliminarPagoDividido(${idx})"><i class="bi bi-x-circle-fill"></i></button>
            </li>
        `).join('');
    }

    const btnFinalizar = document.getElementById("btn-finalizar-venta-confirmada");
    if (btnFinalizar) {
        btnFinalizar.disabled = totalCubierto < total;
    }
}

function ejecutarVentaFinalPOS() {
    const turno = obtenerTurnoActivo();
    if (!turno) return;

    const { subtotal, descuento, total, iva } = calcularTotalesCarritoPOS();
    const totalCubierto = pagosDivididosPOS.reduce((acc, p) => acc + p.monto, 0);
    const pagosEfectivo = pagosDivididosPOS.filter(p => p.metodo.toLowerCase().includes("efectivo")).reduce((acc, p) => acc + p.monto, 0);
    const otrosPagos = totalCubierto - pagosEfectivo;
    const restanteParaEfectivo = Math.max(0, total - otrosPagos);
    const vueltoCalculado = Math.max(0, pagosEfectivo - restanteParaEfectivo);

    const folioBoleta = "BOL-" + Date.now().toString().slice(-7);
    const sesion = JSON.parse(sessionStorage.getItem("sesionActiva"));

    const boleta = {
        folio: folioBoleta,
        turnoId: turno.id,
        cajeroCorreo: sesion.correo,
        cajeroNombre: sesion.nombre,
        fechaHora: new Date().toISOString(),
        items: [...carritoPOS],
        subtotal,
        descuento,
        iva,
        total,
        montoPagadoTotal: totalCubierto,
        vuelto: vueltoCalculado,
        pagos: [...pagosDivididosPOS],
        anulada: false
    };

    const boletas = JSON.parse(localStorage.getItem("collector_boletas") || "[]");
    boletas.push(boleta);
    localStorage.setItem("collector_boletas", JSON.stringify(boletas));

    let productosBD = typeof getProductosBD === "function" ? getProductosBD() : [];
    carritoPOS.forEach(item => {
        const prod = productosBD.find(p => p.id === item.id);
        if (prod) prod.stock -= item.cantidad;
    });

    if (typeof saveProductosBD === "function") saveProductosBD(productosBD);

    cerrarModal("modalCobroPOS", () => {
        generarTicketTermicoHTML(boleta);
    });

    vaciarCarritoPOS();
    renderizarProductosPOS();
}

// ============================================================
// 4. COMPROBANTE TÉRMICO CON DETALLE DE VUELTO
// ============================================================

function generarTicketTermicoHTML(boleta) {
    const contenedor = document.getElementById("contenedor-boleta-imprimible");
    if (!contenedor) return;

    const fechaFormateada = new Date(boleta.fechaHora).toLocaleString('es-CL');

    const itemsRows = boleta.items.map(i => `
        <tr>
            <td style="padding: 2px 0;">${i.nombre.slice(0, 18)}</td>
            <td style="text-align: center;">${i.cantidad}</td>
            <td style="text-align: right;">$${(i.precio * i.cantidad).toLocaleString('es-CL')}</td>
        </tr>
    `).join('');

    const pagosRows = boleta.pagos.map(p => `
        <div style="display: flex; justify-content: space-between;">
            <span>${p.metodo}:</span>
            <span>$${p.monto.toLocaleString('es-CL')}</span>
        </div>
    `).join('');

    const vueltoHTML = boleta.vuelto > 0 ? `
        <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 3px; border-top: 1px solid #000; padding-top: 2px;">
            <span>VUELTO ENTREGADO:</span>
            <span>$${boleta.vuelto.toLocaleString('es-CL')}</span>
        </div>
    ` : '';

    contenedor.innerHTML = `
        <div style="text-align: center; font-weight: bold; border-bottom: 1px dashed #000; padding-bottom: 5px; margin-bottom: 5px;">
            SHINOBI7 COLECCIONABLES<br>
            R.U.T.: 77.123.456-K<br>
            Condell 1345, Providencia<br>
            BOLETA ELECTRÓNICA: ${boleta.folio}
        </div>
        <div style="font-size: 0.75rem; margin-bottom: 5px;">
            <div>FECHA: ${fechaFormateada}</div>
            <div>CAJERO: ${boleta.cajeroNombre}</div>
            <div>TURNO: #${boleta.turnoId}</div>
        </div>
        <table style="width: 100%; font-size: 0.75rem; border-bottom: 1px dashed #000; margin-bottom: 5px;">
            <thead>
                <tr style="border-bottom: 1px solid #000;">
                    <th style="text-align: left;">ITEM</th>
                    <th style="text-align: center;">CANT</th>
                    <th style="text-align: right;">TOTAL</th>
                </tr>
            </thead>
            <tbody>${itemsRows}</tbody>
        </table>
        <div style="font-size: 0.75rem; text-align: right; margin-bottom: 5px;">
            <div>SUBTOTAL: $${boleta.subtotal.toLocaleString('es-CL')}</div>
            <div>DESCUENTO: -$${boleta.descuento.toLocaleString('es-CL')}</div>
            <div>IVA INCLUIDO (19%): $${boleta.iva.toLocaleString('es-CL')}</div>
            <div style="font-size: 0.9rem; font-weight: bold; margin-top: 3px;">TOTAL: $${boleta.total.toLocaleString('es-CL')}</div>
        </div>
        <div style="font-size: 0.75rem; border-top: 1px dashed #000; padding-top: 5px; margin-bottom: 5px;">
            <div style="font-weight: bold;">FORMAS DE PAGO:</div>
            ${pagosRows}
            ${vueltoHTML}
        </div>
        <div style="text-align: center; font-size: 0.7rem; margin-top: 10px;">
            *** GRACIAS POR TU COMPRA ***<br>
            www.shinobi7.cl
        </div>
    `;

    abrirModalLimpio("modalBoletaTermica");
}

function reimprimirUltimaBoleta() {
    const turno = obtenerTurnoActivo();
    if (!turno) return mostrarMensaje("Abre turno para consultar boletas.");

    const boletas = JSON.parse(localStorage.getItem("collector_boletas") || "[]");
    const boletasCajero = boletas.filter(b => b.cajeroCorreo === turno.cajeroCorreo);

    if (boletasCajero.length === 0) return mostrarMensaje("No has emitido boletas durante esta sesión.");

    const ultima = boletasCajero[boletasCajero.length - 1];
    generarTicketTermicoHTML(ultima);
}

// ============================================================
// 5. HISTORIAL DEL TURNO & ANULACIÓN CON MODALES LIMPIOS
// ============================================================

function mostrarHistorialTurno() {
    const turno = obtenerTurnoActivo();
    if (!turno) return mostrarMensaje("Abre turno para ver tu historial.");

    const boletas = JSON.parse(localStorage.getItem("collector_boletas") || "[]");
    const misBoletas = boletas.filter(b => b.turnoId === turno.id);

    const tbody = document.getElementById("tabla-historial-boletas-turno");
    if (!tbody) return;

    if (misBoletas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-3">No hay ventas registradas en este turno.</td></tr>`;
    } else {
        tbody.innerHTML = misBoletas.map(b => `
            <tr class="${b.anulada ? 'table-danger' : ''}">
                <td><strong>${b.folio}</strong></td>
                <td>${new Date(b.fechaHora).toLocaleTimeString('es-CL')}</td>
                <td>${b.pagos.map(p => p.metodo).join(', ')}</td>
                <td>$${b.total.toLocaleString('es-CL')}</td>
                <td>${b.anulada ? '<span class="badge bg-danger">ANULADA</span>' : '<span class="badge bg-success">EMITIDA</span>'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-dark me-1" onclick="reimprimirBoletaPorFolio('${b.folio}')"><i class="bi bi-printer"></i></button>
                    ${!b.anulada ? `<button class="btn btn-sm btn-danger fw-bold" onclick="solicitarAnulacionBoleta('${b.folio}')">Anular</button>` : ''}
                </td>
            </tr>
        `).join('');
    }

    abrirModalLimpio("modalHistorialTurno");
}

function reimprimirBoletaPorFolio(folio) {
    const boletas = JSON.parse(localStorage.getItem("collector_boletas") || "[]");
    const b = boletas.find(x => x.folio === folio);
    if (b) {
        cerrarModal("modalHistorialTurno", () => {
            generarTicketTermicoHTML(b);
        });
    }
}

// ============================================================
// 6. CONTROL RBAC, SUPERVISOR & CONTROL DE MODALES
// ============================================================

function solicitarAnulacionBoleta(folio) {
    boletaSeleccionadaSupervisor = folio;
    document.getElementById("auth-supervisor-motivo").textContent = `ANULACIÓN DE BOLETA (${folio}): Se requiere clave de Administrador/Supervisor para anular y devolver stock.`;
    document.getElementById("auth-supervisor-pass").value = "";

    accionPendienteSupervisor = ejecutarAnulacionConfirmada;

    cerrarModal("modalHistorialTurno", () => {
        abrirModalLimpio("modalAuthSupervisor");
    });
}

function ejecutarAccionConSupervisor() {
    const passInput = document.getElementById("auth-supervisor-pass")?.value;

    const vSupervisor = validarClaveSupervisorBD(passInput);
    if (!vSupervisor.valido) {
        mostrarMensaje(vSupervisor.msj);
        return;
    }

    cerrarModal("modalAuthSupervisor", () => {
        if (typeof accionPendienteSupervisor === "function") {
            accionPendienteSupervisor(vSupervisor.admin);
        }
    });
}

function ejecutarAnulacionConfirmada(adminAutorizador) {
    if (!boletaSeleccionadaSupervisor) return;

    let boletas = JSON.parse(localStorage.getItem("collector_boletas") || "[]");
    const index = boletas.findIndex(b => b.folio === boletaSeleccionadaSupervisor);

    if (index === -1) return;

    boletas[index].anulada = true;
    boletas[index].anuladaPor = adminAutorizador.correo;
    boletas[index].fechaAnulacion = new Date().toISOString();

    localStorage.setItem("collector_boletas", JSON.stringify(boletas));

    let productosBD = typeof getProductosBD === "function" ? getProductosBD() : [];
    boletas[index].items.forEach(item => {
        const prod = productosBD.find(p => p.id === item.id);
        if (prod) prod.stock += item.cantidad;
    });
    if (typeof saveProductosBD === "function") saveProductosBD(productosBD);

    registrarLogAuditoria("BOLETA_ANULADA", `Boleta ${boletaSeleccionadaSupervisor} anulada por Admin ${adminAutorizador.correo}`);

    mostrarMensaje(`¡Boleta ${boletaSeleccionadaSupervisor} anulada exitosamente y stock devuelto al inventario!`, false);
    renderizarProductosPOS();
}

function registrarLogAuditoria(accion, detalle) {
    const sesion = JSON.parse(sessionStorage.getItem("sesionActiva") || "{}");
    const logs = JSON.parse(localStorage.getItem("collector_audit_logs") || "[]");

    logs.push({
        id: "LOG-" + Date.now(),
        accion,
        detalle,
        usuarioCorreo: sesion.correo || "ANONIMO",
        fechaHora: new Date().toISOString()
    });

    localStorage.setItem("collector_audit_logs", JSON.stringify(logs));
}

// ============================================================
// HELPER PARA MANEJO DE MODALES SIN SOBREPOSICIÓN
// ============================================================

function abrirModalLimpio(idModal) {
    const el = document.getElementById(idModal);
    if (!el) return;
    const inst = bootstrap.Modal.getOrCreateInstance(el);
    inst.show();
}

function cerrarModal(idModal, callback) {
    const el = document.getElementById(idModal);
    if (!el) {
        if (callback) callback();
        return;
    }

    const inst = bootstrap.Modal.getInstance(el);
    if (inst) {
        el.addEventListener('hidden.bs.modal', function handler() {
            el.removeEventListener('hidden.bs.modal', handler);
            if (callback) callback();
        });
        inst.hide();
    } else {
        if (callback) callback();
    }
}

// INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", () => {
    actualizarEstadoTurnoUI();
    renderizarProductosPOS();
    renderizarCarritoPOS();

    const sesion = JSON.parse(sessionStorage.getItem("sesionActiva") || "{}");
    const cajeroEl = document.getElementById("pos-cajero-nombre");
    if (cajeroEl) cajeroEl.textContent = `Cajero: ${sesion.nombre || 'Vendedor'}`;

    const relojEl = document.getElementById("pos-reloj");
    if (relojEl) {
        setInterval(() => {
            relojEl.textContent = new Date().toLocaleTimeString('es-CL');
        }, 1000);
    }
});