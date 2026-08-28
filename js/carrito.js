function renderizarCarrito() {
    const contenedor = document.getElementById("contenedor-carrito-items");
    const elementoTotal = document.getElementById("total-carrito");
    if (!contenedor || !elementoTotal) return;

    const carrito = obtenerCarrito();
    contenedor.innerHTML = "";

    if (carrito.length === 0) {
        contenedor.innerHTML = `<div class="alert alert-info text-center">Tu carrito de compras está vacío.</div>`;
        elementoTotal.textContent = "$0";
        return;
    }

    let totalAcumulado = 0;

    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        totalAcumulado += subtotal;
        const precioFormateado = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(subtotal);

        const itemHTML = `
            <div class="card mb-3 p-3 shadow-sm border-1">
                <div class="row g-3 align-items-center">
                    <div class="col-3 col-sm-2">
                        <img src="${item.imagen}" class="img-fluid rounded border" alt="${item.nombre}">
                    </div>
                    <div class="col-9 col-sm-5">
                        <h5 class="mb-1 fs-6 fw-bold">${item.nombre}</h5>
                        <small class="text-muted">${item.marca}</small>
                    </div>
                    <div class="col-6 col-sm-3">
                        <input type="number" min="1" value="${item.cantidad}" onchange="cambiarCantidadCarrito(${index}, this.value)" class="form-control form-control-sm text-center">
                    </div>
                    <div class="col-6 col-sm-2 text-end">
                        <p class="fw-bold text-primary mb-1">${precioFormateado}</p>
                        <button onclick="eliminarDelCarrito(${index})" class="btn btn-outline-danger btn-sm">Eliminar</button>
                    </div>
                </div>
            </div>
        `;
        contenedor.innerHTML += itemHTML;
    });

    elementoTotal.textContent = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalAcumulado);

    function procesarPago() {
        const carrito = obtenerCarrito();
        if (carrito.length === 0) {
            return alert(" Tu carrito está vacío. Añade productos antes de pagar.");
        }

        // --- NUEVO: Validar si el usuario inició sesión antes de pagar ---
        const sesionActiva = JSON.parse(sessionStorage.getItem("sesionActiva"));
        if (!sesionActiva) {
            alert(" Debes iniciar sesión o registrarte para procesar el pago.");
            return window.location.href = "login.html";
        }

        alert(` ¡Pago procesado con éxito! El comprobante será enviado a: ${sesionActiva.correo}`);
        localStorage.removeItem("carritoCollectorVault");
        actualizarContadorCarrito();
        window.location.href = "index.html";
    }
}
