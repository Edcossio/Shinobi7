// ============================================================
// CARRITO DE COMPRAS
// ============================================================

function obtenerCarrito() {
    const carrito = localStorage.getItem("collector_carrito");
    return carrito ? JSON.parse(carrito) : [];
}

function guardarCarrito(carrito) {
    localStorage.setItem("collector_carrito", JSON.stringify(carrito));
    actualizarContadorCarrito();
}

function actualizarContadorCarrito() {
    const carrito = obtenerCarrito();
    const cantidad = carrito.reduce((total, item) => total + item.cantidad, 0);

    document.querySelectorAll(".nav-item").forEach(enlace => {
        if (enlace.textContent.includes("CARRITO")) {
            enlace.textContent = "🛒 CARRITO (" + cantidad + ")";
        }
    });
}

// ============================================================
// AGREGAR PRODUCTO
// ============================================================

function agregarAlCarrito(productoId) {
    const producto = getProductosBD().find(p => p.id === productoId);

    if (!producto) {
        alert("No se encontró el producto.");
        return;
    }

    const carrito = obtenerCarrito();
    const existente = carrito.find(item => item.id === productoId);

    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            marca: producto.marca,
            precio: producto.precio,
            categoria: producto.categoria,
            imagen: producto.imagen,
            descripcion: producto.descripcion,
            cantidad: 1
        });
    }

    guardarCarrito(carrito);
    alert(producto.nombre + " fue agregado al carrito.");
}

// ============================================================
// CAMBIAR CANTIDAD
// ============================================================

function cambiarCantidadCarrito(index, cantidad) {
    cantidad = parseInt(cantidad);

    if (isNaN(cantidad) || cantidad < 1) {
        alert("La cantidad debe ser mayor a 0.");
        renderizarCarrito();
        return;
    }

    const carrito = obtenerCarrito();

    if (!carrito[index]) return;

    carrito[index].cantidad = cantidad;
    guardarCarrito(carrito);
    renderizarCarrito();
}

// ============================================================
// ELIMINAR
// ============================================================

function eliminarDelCarrito(index) {
    const carrito = obtenerCarrito();

    if (!carrito[index]) return;

    if (!confirm("¿Está seguro de eliminar este producto del carrito?")) {
        return;
    }

    carrito.splice(index, 1);
    guardarCarrito(carrito);
    renderizarCarrito();
}

// ============================================================
// PRECIOS
// ============================================================

function formatearPrecio(valor) {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP"
    }).format(valor);
}

function calcularIVA(total) {
    return Math.round(total * 19 / 119);
}

// ============================================================
// USUARIO ACTIVO
// ============================================================

function obtenerUsuarioActivo() {
    const sesion = sessionStorage.getItem("sesionActiva");

    if (!sesion) return null;

    try {
        const usuarioSesion = JSON.parse(sesion);

        const usuarios = getUsuariosBD();

        const usuarioBD = usuarios.find(
            u =>
                u.correo &&
                usuarioSesion.correo &&
                u.correo.toLowerCase() ===
                usuarioSesion.correo.toLowerCase()
        );

        return usuarioBD || usuarioSesion;

    } catch (error) {
        return null;
    }
}

// ============================================================
// MOSTRAR DESPACHO
// ============================================================

function mostrarDespacho() {
    const info = document.getElementById("informacion-despacho");

    if (info) {
        info.classList.toggle("d-none");
    }
}

function crearSeccionDespacho() {
    const total = document.getElementById("total-carrito");

    if (!total) return;

    const resumen = total.closest(".card");

    if (!resumen) return;

    let seccion = document.getElementById("seccion-despacho");

    if (seccion) {
        seccion.remove();
    }

    const usuario = obtenerUsuarioActivo();

    seccion = document.createElement("div");
    seccion.id = "seccion-despacho";
    seccion.className = "border-top border-2 border-dark pt-3 mb-3";

    if (!usuario) {

        seccion.innerHTML = `
            <div class="alert alert-warning mb-0 py-2">
                Debes iniciar sesión para utilizar el despacho.
            </div>
        `;

    } else {

        const direccion = usuario.direccion || "Dirección no registrada";
        const comuna = usuario.comuna || "";
        const region = usuario.region || "";

        seccion.innerHTML = `
            <h5 class="fw-bold mb-2">Despacho</h5>

            <button
                type="button"
                class="btn btn-outline-primary btn-sm w-100"
                onclick="mostrarDespacho()">

                🚚 Despacho a domicilio

            </button>

            <div
                id="informacion-despacho"
                class="d-none mt-2 p-2 bg-light border rounded small">

                <p class="mb-1">
                    <strong>Modalidad:</strong>
                    Despacho a domicilio
                </p>

                <p class="mb-1">
                    <strong>Dirección:</strong>
                    ${direccion}
                </p>

                <p class="mb-1">
                    <strong>Comuna:</strong>
                    ${comuna}
                </p>

                <p class="mb-1">
                    <strong>Región:</strong>
                    ${region}
                </p>

                <p class="mb-1">
                    <strong>Costo:</strong>
                    Por confirmar
                </p>

                <p class="mb-0">
                    <strong>Entrega:</strong>
                    3 a 5 días hábiles
                </p>

            </div>
        `;
    }

    const botones = resumen.querySelectorAll("button");

    const botonPagar = Array.from(botones).find(
        boton => boton.textContent.trim().includes("PAGAR")
    );

    if (botonPagar) {
        resumen.insertBefore(seccion, botonPagar);
    } else {
        resumen.appendChild(seccion);
    }
}

// ============================================================
// MOSTRAR CARRITO
// ============================================================

function renderizarCarrito() {
    const contenedor =
        document.getElementById("contenedor-carrito-items");

    const totalElemento =
        document.getElementById("total-carrito");

    if (!contenedor || !totalElemento) return;

    const carrito = obtenerCarrito();

    contenedor.innerHTML = "";

    if (carrito.length === 0) {

        contenedor.innerHTML = `
            <div class="alert alert-info">
                Tu carrito está vacío.
            </div>
        `;

        totalElemento.textContent = "$0";

        const ivaAnterior =
            document.getElementById("iva-carrito");

        if (ivaAnterior) {
            ivaAnterior.remove();
        }

        crearSeccionDespacho();

        return;
    }

    let total = 0;

    carrito.forEach((item, index) => {

        const subtotal =
            item.precio * item.cantidad;

        total += subtotal;

        contenedor.innerHTML += `
            <div class="card mb-2 shadow-sm">
                <div class="card-body py-2">
                    <div class="row align-items-center">

                        <div class="col-3 col-md-2 text-center">
                            <img
                                src="${item.imagen}"
                                alt="${item.nombre}"
                                class="img-fluid rounded"
                                style="max-height:90px;">
                        </div>

                        <div class="col-9 col-md-4">
                            <h6 class="fw-bold mb-1">
                                ${item.nombre}
                            </h6>

                            <p class="text-muted small mb-1">
                                ${item.marca}
                            </p>

                            <p class="text-primary fw-bold mb-0">
                                ${formatearPrecio(item.precio)}
                            </p>
                        </div>

                        <div class="col-6 col-md-3 mt-2 mt-md-0">
                            <label class="form-label small fw-bold mb-1">
                                Cantidad
                            </label>

                            <input
                                type="number"
                                value="${item.cantidad}"
                                min="1"
                                class="form-control form-control-sm"
                                onchange="cambiarCantidadCarrito(
                                    ${index},
                                    this.value
                                )">
                        </div>

                        <div class="col-6 col-md-3 text-end mt-2 mt-md-0">
                            <p class="fw-bold mb-1">
                                ${formatearPrecio(subtotal)}
                            </p>

                            <button
                                type="button"
                                class="btn btn-danger btn-sm"
                                onclick="eliminarDelCarrito(${index})">
                                Eliminar
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        `;
    });

    totalElemento.textContent =
        formatearPrecio(total);

    let ivaElemento =
        document.getElementById("iva-carrito");

    if (!ivaElemento) {

        ivaElemento =
            document.createElement("div");

        ivaElemento.id = "iva-carrito";
        ivaElemento.className =
            "text-muted small text-end";

        totalElemento.parentNode.appendChild(
            ivaElemento
        );
    }

    ivaElemento.textContent =
        "(" + formatearPrecio(calcularIVA(total)) +
        " de IVA incluido)";

    crearSeccionDespacho();
}

// ============================================================
// PAGAR
// ============================================================

function procesarPago() {
    const carrito = obtenerCarrito();

    if (carrito.length === 0) {
        alert(
            "Tu carrito está vacío. Añade productos antes de pagar."
        );
        return;
    }

    const usuario = obtenerUsuarioActivo();

    if (!usuario) {
        alert(
            "Debes iniciar sesión o registrarte para procesar el pago."
        );

        window.location.href = "login.html";
        return;
    }

    if (!usuario.direccion) {
        alert(
            "No tienes una dirección de despacho registrada. " +
            "Puedes agregarla desde tu registro de usuario."
        );
        return;
    }

    alert(
        "¡Pago procesado con éxito! El comprobante será enviado a: " +
        usuario.correo
    );

    localStorage.removeItem("collector_carrito");

    actualizarContadorCarrito();
    renderizarCarrito();

    window.location.href = "index.html";
}

// ============================================================
// INICIAR
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    actualizarContadorCarrito();
    renderizarCarrito();
});