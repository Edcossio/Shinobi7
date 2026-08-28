// ==========================================================================
// PERSISTENCIA Y LÓGICA DEL CARRITO (js/carrito.js)
// ==========================================================================

function obtenerCarrito() {
    return JSON.parse(localStorage.getItem("carritoCollectorVault")) || [];
}

function guardarCarrito(carrito) {
    localStorage.setItem("carritoCollectorVault", JSON.stringify(carrito));
    actualizarContadorCarrito();
}

function agregarAlCarrito(productoId) {
    const carrito = obtenerCarrito();
    const productosBase = getProductosBD();
    const prodEncontrado = productosBase.find(p => p.id === productoId);

    if (!prodEncontrado) return;

    const itemExistente = carrito.find(item => item.id === productoId);
    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        carrito.push({ ...prodEncontrado, cantidad: 1 });
    }

    guardarCarrito(carrito);
    alert(` "${prodEncontrado.nombre}" se agregó al carrito.`);
}

function actualizarContadorCarrito() {
    const carrito = obtenerCarrito();
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const enlacesNav = document.querySelectorAll(".nav-item");

    enlacesNav.forEach(el => {
        if (el.textContent.includes("CARRITO")) {
            el.textContent = `🛒 CARRITO (${totalItems})`;
        }
    });
}

function renderizarCarrito() {
    const contenedor = document.getElementById("contenedor-carrito-items");
    const elementoTotal = document.getElementById("total-carrito");
    if (!contenedor || !elementoTotal) return;

    const carrito = obtenerCarrito();
    contenedor.innerHTML = "";

    if (carrito.length === 0) {
        contenedor.innerHTML = `<div class="card p-4 text-center"><p style="color: var(--text-muted);">Tu carrito está vacío.</p></div>`;
        elementoTotal.textContent = "$0";
        return;
    }

    let totalAcumulado = 0;

    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        totalAcumulado += subtotal;
        const precioFormateado = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(subtotal);

        const itemHTML = `
            <div class="card p-3 mb-3 d-flex align-items-center justify-content-between" style="flex-direction: row; gap: 15px;">
                <img src="${item.imagen}" style="width: 70px; height: 70px; object-fit: cover;" alt="${item.nombre}">
                <div style="flex-grow: 1;">
                    <h4 style="font-size: 1rem; margin-bottom: 4px;">${item.nombre}</h4>
                    <p style="color: var(--accent-blue); font-size: 0.8rem;">${item.marca}</p>
                </div>
                <div style="text-align: right;">
                    <p style="font-weight: 900; font-size: 1.1rem; color: var(--accent-yellow); margin-bottom: 5px;">${precioFormateado}</p>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="number" min="1" value="${item.cantidad}" onchange="cambiarCantidadCarrito(${index}, this.value)" style="width: 55px; padding: 4px; text-align: center;">
                        <button onclick="eliminarDelCarrito(${index})" class="btn" style="background: var(--accent-red); color: white; padding: 4px 8px; font-size: 0.75rem;">X</button>
                    </div>
                </div>
            </div>
        `;
        contenedor.innerHTML += itemHTML;
    });

    elementoTotal.textContent = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalAcumulado);
}

function cambiarCantidadCarrito(index, nuevaCantidad) {
    const carrito = obtenerCarrito();
    const cant = parseInt(nuevaCantidad);
    if (cant > 0) {
        carrito[index].cantidad = cant;
        guardarCarrito(carrito);
        renderizarCarrito();
    }
}

function eliminarDelCarrito(index) {
    const carrito = obtenerCarrito();
    carrito.splice(index, 1);
    guardarCarrito(carrito);
    renderizarCarrito();
}

function procesarPago() {
    const carrito = obtenerCarrito();
    if (carrito.length === 0) {
        return alert(" Tu carrito está vacío. Añade productos antes de pagar.");
    }
    alert(" ¡Pago procesado con éxito! Gracias por tu compra en CollectorVault.");
    localStorage.removeItem("carritoCollectorVault");
    actualizarContadorCarrito();
    window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
    renderizarCarrito();
});