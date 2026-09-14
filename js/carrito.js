// ============================================================
// GESTIÓN DE CARRITO DE COMPRAS CON DESPACHO Y SESIÓN
// ============================================================

const CUPONES_VALIDOS = {
    "DUOC10": 0.10,
    "SHINOBI20": 0.20,
    "VAULT15": 0.15
};

let descuentoAplicado = 0;
let codigoCuponActivo = "";

function obtenerCarrito() {
    return JSON.parse(localStorage.getItem("collector_carrito")) || [];
}

function guardarCarrito(carrito) {
    localStorage.setItem("collector_carrito", JSON.stringify(carrito));
    actualizarContadorCarrito();
}

function actualizarContadorCarrito() {
    const carrito = obtenerCarrito();
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

    document.querySelectorAll(".nav-item").forEach(el => {
        if (el.textContent.includes("CARRITO")) {
            el.textContent = `CARRITO (${totalItems})`;
        }
    });
}

function agregarAlCarrito(idProducto, cantidadDeseada = 1) {
    const productos = typeof getProductosBD === "function" ? getProductosBD() : [];
    const producto = productos.find(p => p.id === idProducto);

    if (!producto) {
        alert("Producto no encontrado.");
        return;
    }

    if (producto.stock <= 0) {
        alert("¡Producto agotado! No hay unidades disponibles en inventario.");
        return;
    }

    let carrito = obtenerCarrito();
    const itemExistente = carrito.find(item => item.id === idProducto);
    const cantidadActualEnCarrito = itemExistente ? itemExistente.cantidad : 0;
    const nuevaCantidad = cantidadActualEnCarrito + cantidadDeseada;

    if (nuevaCantidad > producto.stock) {
        alert(`No puedes agregar más unidades. El stock máximo disponible para "${producto.nombre}" es de ${producto.stock} unidades.`);
        return;
    }

    if (itemExistente) {
        itemExistente.cantidad = nuevaCantidad;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: (producto.imagenes && producto.imagenes[0]) || 'images/placeholder.jpg',
            cantidad: nuevaCantidad
        });
    }

    guardarCarrito(carrito);
    alert(`Se agregaron ${cantidadDeseada} unidad(es) de "${producto.nombre}" al carrito.`);
}

function cambiarCantidad(idProducto, nuevaCantidad) {
    let cantidad = parseInt(nuevaCantidad);
    if (isNaN(cantidad) || cantidad < 1) cantidad = 1;

    const productos = typeof getProductosBD === "function" ? getProductosBD() : [];
    const productoBD = productos.find(p => p.id === idProducto);

    if (productoBD && cantidad > productoBD.stock) {
        alert(`Stock insuficiente. Solo quedan ${productoBD.stock} unidades de "${productoBD.nombre}".`);
        cantidad = productoBD.stock;
    }

    let carrito = obtenerCarrito();
    const item = carrito.find(i => i.id === idProducto);

    if (item) {
        item.cantidad = cantidad;
        guardarCarrito(carrito);
        renderizarCarrito();
    }
}

function eliminarDelCarrito(idProducto) {
    let carrito = obtenerCarrito();
    carrito = carrito.filter(i => i.id !== idProducto);
    guardarCarrito(carrito);
    renderizarCarrito();
}

function aplicarCupon() {
    const inputCupon = document.getElementById("input-cupon");
    if (!inputCupon) return;

    const codigo = inputCupon.value.trim().toUpperCase();

    if (!codigo) {
        alert("Por favor ingresa un código de cupón.");
        return;
    }

    if (CUPONES_VALIDOS[codigo]) {
        descuentoAplicado = CUPONES_VALIDOS[codigo];
        codigoCuponActivo = codigo;
        alert(`¡Cupón "${codigo}" aplicado exitosamente! Se ha descontado un ${descuentoAplicado * 100}%.`);
        renderizarCarrito();
    } else {
        alert("El código de cupón ingresado no es válido. Prueba con DUOC10, SHINOBI20 o VAULT15.");
    }
}

// ------------------------------------------------------------
// ACTUALIZAR INFORMACIÓN DE DESPACHO EN PANTALLA
// ------------------------------------------------------------
function actualizarDireccionDespacho() {
    const contenedorDespacho = document.getElementById("info-despacho");
    const sesionRaw = sessionStorage.getItem("sesionActiva");

    if (!contenedorDespacho) return;

    if (sesionRaw) {
        const usuario = JSON.parse(sesionRaw);
        const direccion = usuario.direccion ? `${usuario.direccion}, ${usuario.comuna || ''}` : "Dirección no especificada";
        contenedorDespacho.innerHTML = `
            <div class="alert alert-success border-2 border-dark mb-0 p-2 small">
                <strong> Enviar a:</strong> ${usuario.nombre || 'Usuario'}<br>
                <span>${direccion}</span>
            </div>
        `;
    } else {
        contenedorDespacho.innerHTML = `
            <div class="alert alert-warning border-2 border-dark mb-0 p-2 small fw-bold">
                Debes iniciar sesión para utilizar el despacho.
            </div>
        `;
    }
}

function renderizarCarrito() {
    const contenedorItems = document.getElementById("contenedor-carrito-items");
    const elSubtotal = document.getElementById("cart-subtotal");
    const elDescuento = document.getElementById("cart-descuento");
    const elIva = document.getElementById("cart-iva");
    const elTotal = document.getElementById("cart-total");

    if (!contenedorItems) return;

    const carrito = obtenerCarrito();
    const productosBD = typeof getProductosBD === "function" ? getProductosBD() : [];

    actualizarDireccionDespacho();

    if (carrito.length === 0) {
        contenedorItems.innerHTML = `
            <div class="card p-4 text-center border-2 border-dark shadow-sm">
                <h4>Tu carrito está vacío</h4>
                <p class="text-muted mb-3">Explora nuestro catálogo para añadir tus figuras favoritas.</p>
                <div>
                    <a href="productos.html" class="btn btn-primary fw-bold text-uppercase border-2 border-dark">Ver Productos</a>
                </div>
            </div>
        `;
        if (elSubtotal) elSubtotal.textContent = "$0";
        if (elDescuento) elDescuento.textContent = "$0";
        if (elIva) elIva.textContent = "$0";
        if (elTotal) elTotal.textContent = "$0";
        return;
    }

    contenedorItems.innerHTML = "";
    let subtotal = 0;

    carrito.forEach(item => {
        const prodBD = productosBD.find(p => p.id === item.id);
        const stockMax = prodBD ? prodBD.stock : 99;
        const totalLinea = item.precio * item.cantidad;
        subtotal += totalLinea;

        contenedorItems.innerHTML += `
            <div class="card mb-3 p-3 border-2 border-dark shadow-sm">
                <div class="row align-items-center g-3">
                    <div class="col-3 col-md-2 text-center">
                        <img src="${item.imagen}" class="img-fluid rounded border border-dark" alt="${item.nombre}" style="max-height: 90px; object-fit: contain;">
                    </div>
                    <div class="col-9 col-md-4">
                        <h6 class="fw-bold mb-1">${item.nombre}</h6>
                        <span class="text-muted small">Cód: ${item.id}</span><br>
                        <span class="fw-bold text-primary">$${item.precio.toLocaleString('es-CL')}</span>
                        <div class="small text-muted mt-1">Stock dispon.: <strong>${stockMax}</strong></div>
                    </div>
                    <div class="col-6 col-md-3">
                        <label class="form-label small fw-bold mb-1">Cantidad:</label>
                        <input type="number" 
                               class="form-control border-2 border-dark text-center fw-bold" 
                               value="${item.cantidad}" 
                               min="1" 
                               max="${stockMax}" 
                               onchange="cambiarCantidad('${item.id}', this.value)">
                    </div>
                    <div class="col-6 col-md-3 text-end">
                        <div class="fw-bold fs-5 mb-2">$${totalLinea.toLocaleString('es-CL')}</div>
                        <button class="btn btn-sm btn-danger fw-bold border-2 border-dark" onclick="eliminarDelCarrito('${item.id}')">Eliminar</button>
                    </div>
                </div>
            </div>
        `;
    });

    const montoDescuento = Math.round(subtotal * descuentoAplicado);
    const total = subtotal - montoDescuento;

    // CÁLCULO DEL IVA (19% INCLUIDO EN EL TOTAL)
    const montoIva = Math.round(total - (total / 1.19));

    if (elSubtotal) elSubtotal.textContent = `$${subtotal.toLocaleString('es-CL')}`;
    if (elDescuento) {
        elDescuento.textContent = descuentoAplicado > 0
            ? `-$${montoDescuento.toLocaleString('es-CL')} (${codigoCuponActivo})`
            : "$0";
    }
    if (elIva) elIva.textContent = `$${montoIva.toLocaleString('es-CL')}`;
    if (elTotal) elTotal.textContent = `$${total.toLocaleString('es-CL')}`;
}

// ------------------------------------------------------------
// PROCESAR PAGO CON VALIDACIÓN DE SESIÓN Y DIRECCIÓN
// ------------------------------------------------------------
function procesarPago() {
    const sesionRaw = sessionStorage.getItem("sesionActiva");
    if (!sesionRaw) {
        alert("Debes iniciar sesión con tu cuenta para poder procesar la compra y gestionar el despacho.");
        window.location.href = "login.html";
        return;
    }

    const usuario = JSON.parse(sesionRaw);
    const carrito = obtenerCarrito();

    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    let productosBD = typeof getProductosBD === "function" ? getProductosBD() : [];

    for (let item of carrito) {
        const prod = productosBD.find(p => p.id === item.id);
        if (!prod || prod.stock < item.cantidad) {
            alert(`No hay suficiente stock de "${item.nombre}". Unidades disponibles: ${prod ? prod.stock : 0}.`);
            renderizarCarrito();
            return;
        }
    }

    // Descontar inventario
    carrito.forEach(item => {
        const prod = productosBD.find(p => p.id === item.id);
        if (prod) {
            prod.stock -= item.cantidad;
        }
    });

    if (typeof guardarProductosBD === "function") {
        guardarProductosBD(productosBD);
    } else {
        localStorage.setItem("collector_productos", JSON.stringify(productosBD));
    }

    localStorage.removeItem("collector_carrito");
    descuentoAplicado = 0;
    codigoCuponActivo = "";

    const direccionEnvio = usuario.direccion ? `${usuario.direccion}, ${usuario.comuna || ''}` : "su dirección registrada";
    alert(`¡Gracias por tu compra, ${usuario.nombre}! Tu pedido será despachado a: ${direccionEnvio}.`);
    window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
    actualizarContadorCarrito();
    renderizarCarrito();

    const btnPagar = document.getElementById("btn-pagar");
    if (btnPagar) {
        btnPagar.addEventListener("click", (e) => {
            e.preventDefault();
            procesarPago();
        });
    }
});

// Funciones globales
window.aplicarCupon = aplicarCupon;
window.procesarPago = procesarPago;
window.cambiarCantidad = cambiarCantidad;
window.eliminarDelCarrito = eliminarDelCarrito;