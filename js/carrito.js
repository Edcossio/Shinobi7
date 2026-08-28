// ==========================================================================
// CARRITO DE COMPRAS (js/carrito.js)
// ==========================================================================


// ==========================================================================
// OBTENER CARRITO
// ==========================================================================

function obtenerCarrito() {

    const carritoGuardado = localStorage.getItem("collector_carrito");

    if (!carritoGuardado) {
        return [];
    }

    return JSON.parse(carritoGuardado);
}


// ==========================================================================
// GUARDAR CARRITO
// ==========================================================================

function guardarCarrito(carrito) {

    localStorage.setItem(
        "collector_carrito",
        JSON.stringify(carrito)
    );

    actualizarContadorCarrito();
}


// ==========================================================================
// ACTUALIZAR CONTADOR DEL CARRITO
// ==========================================================================

function actualizarContadorCarrito() {

    const carrito = obtenerCarrito();

    let cantidadTotal = 0;

    carrito.forEach(function(item) {

        cantidadTotal += item.cantidad;

    });


    const elementosCarrito =
        document.querySelectorAll(".nav-item");


    elementosCarrito.forEach(function(elemento) {

        if (elemento.textContent.includes("CARRITO")) {

            elemento.textContent =
                "🛒 CARRITO (" + cantidadTotal + ")";

        }

    });

}


// ==========================================================================
// AGREGAR PRODUCTO AL CARRITO
// ==========================================================================

function agregarAlCarrito(productoId) {

    const productos = getProductosBD();

    const producto = productos.find(function(prod) {

        return prod.id === productoId;

    });


    if (!producto) {

        alert("No se encontró el producto.");

        return;

    }


    const carrito = obtenerCarrito();


    const productoExistente = carrito.find(function(item) {

        return item.id === productoId;

    });


    if (productoExistente) {

        productoExistente.cantidad += 1;

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


    alert(
        producto.nombre +
        " fue agregado al carrito."
    );

}


// ==========================================================================
// CAMBIAR CANTIDAD
// ==========================================================================

function cambiarCantidadCarrito(index, cantidad) {

    const carrito = obtenerCarrito();

    cantidad = parseInt(cantidad);


    if (isNaN(cantidad) || cantidad < 1) {

        alert("La cantidad debe ser mayor a 0.");

        renderizarCarrito();

        return;

    }


    if (!carrito[index]) {

        return;

    }


    carrito[index].cantidad = cantidad;


    guardarCarrito(carrito);

    renderizarCarrito();

}


// ==========================================================================
// ELIMINAR PRODUCTO
// ==========================================================================

function eliminarDelCarrito(index) {

    const carrito = obtenerCarrito();


    if (!carrito[index]) {

        return;

    }


    const confirmar = confirm(
        "¿Está seguro de eliminar este producto del carrito?"
    );


    if (!confirmar) {

        return;

    }


    carrito.splice(index, 1);


    guardarCarrito(carrito);

    renderizarCarrito();

}


// ==========================================================================
// MOSTRAR CARRITO
// ==========================================================================

function renderizarCarrito() {

    const contenedor =
        document.getElementById("contenedor-carrito-items");


    const totalElemento =
        document.getElementById("total-carrito");


    if (!contenedor || !totalElemento) {

        return;

    }


    const carrito = obtenerCarrito();


    contenedor.innerHTML = "";


    // Carrito vacío

    if (carrito.length === 0) {

        contenedor.innerHTML = `
            <div class="alert alert-info">
                Tu carrito está vacío.
            </div>
        `;

        totalElemento.textContent = "$0";

        return;

    }


    let total = 0;


    carrito.forEach(function(item, index) {

        const subtotal =
            item.precio * item.cantidad;


        total += subtotal;


        const precioFormateado =
            new Intl.NumberFormat("es-CL", {

                style: "currency",

                currency: "CLP"

            }).format(subtotal);


        const precioUnitario =
            new Intl.NumberFormat("es-CL", {

                style: "currency",

                currency: "CLP"

            }).format(item.precio);


        const itemHTML = `

            <div class="card mb-3 shadow-sm">

                <div class="card-body">

                    <div class="row align-items-center">

                        <div class="col-12 col-md-2 text-center">

                            <img
                                src="${item.imagen}"
                                alt="${item.nombre}"
                                class="img-fluid rounded"
                                style="max-height: 120px;"
                            >

                        </div>


                        <div class="col-12 col-md-4">

                            <h5 class="fw-bold">
                                ${item.nombre}
                            </h5>

                            <p class="text-muted mb-1">
                                ${item.marca}
                            </p>

                            <p class="text-primary fw-bold">
                                ${precioUnitario}
                            </p>

                        </div>


                        <div class="col-6 col-md-3">

                            <label
                                for="cantidad-${index}"
                                class="form-label fw-bold">

                                Cantidad

                            </label>

                            <input
                                type="number"
                                id="cantidad-${index}"
                                value="${item.cantidad}"
                                min="1"
                                class="form-control"
                                onchange="cambiarCantidadCarrito(${index}, this.value)"
                            >

                        </div>


                        <div class="col-6 col-md-3 text-end">

                            <p class="fw-bold mb-2">
                                ${precioFormateado}
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


        contenedor.innerHTML += itemHTML;

    });


    totalElemento.textContent =
        new Intl.NumberFormat("es-CL", {

            style: "currency",

            currency: "CLP"

        }).format(total);

}


// ==========================================================================
// PROCESAR PAGO
// ==========================================================================

function procesarPago() {

    const carrito = obtenerCarrito();


    if (carrito.length === 0) {

        return alert(
            "Tu carrito está vacío. Añade productos antes de pagar."
        );

    }


    // Validar si el usuario inició sesión

    const sesionActiva =
        JSON.parse(sessionStorage.getItem("sesionActiva"));


    if (!sesionActiva) {

        alert(
            "Debes iniciar sesión o registrarte para procesar el pago."
        );

        return window.location.href = "login.html";

    }


    alert(
        `¡Pago procesado con éxito! El comprobante será enviado a: ${sesionActiva.correo}`
    );


    // Vaciar carrito

    localStorage.removeItem("collector_carrito");


    actualizarContadorCarrito();

    renderizarCarrito();


    window.location.href = "index.html";

}


// ==========================================================================
// INICIALIZAR CARRITO
// ==========================================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        actualizarContadorCarrito();

        renderizarCarrito();

    }
);