// Renderizado dinámico con clases nativas de Bootstrap 5
function renderizarCatalogo(listaOpcional, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    const lista = listaOpcional || getProductosBD();
    contenedor.innerHTML = "";

    if (lista.length === 0) {
        contenedor.innerHTML = `<div class="col-12"><div class="alert alert-warning text-center">No hay productos disponibles en el catálogo.</div></div>`;
        return;
    }

    lista.forEach(prod => {
        const precioFormateado = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(prod.precio);
        const esCritico = prod.stock <= (prod.stockCritico || 3);

        const cardHTML = `
            <div class="col-12 col-sm-6 col-md-4 col-lg-3 d-flex align-items-stretch mb-4">
                <div class="card w-100 shadow-sm border-2">
                    <span class="badge ${esCritico ? 'bg-danger' : 'bg-warning text-dark'} position-absolute top-0 end-0 m-2">
                        ${esCritico ? 'STOCK CRÍTICO' : 'DISPONIBLE'}
                    </span>
                    <a href="detalle.html?id=${prod.id}">
                        <img src="${prod.imagen}" class="card-img-top p-2" alt="${prod.nombre}" style="height: 240px; object-fit: cover;">
                    </a>
                    <div class="card-body d-flex flex-column justify-content-between">
                        <div>
                            <a href="detalle.html?id=${prod.id}" class="text-decoration-none text-dark">
                                <h5 class="card-title text-truncate fs-6 fw-bold">${prod.nombre}</h5>
                            </a>
                            <p class="text-muted small mb-2">${prod.marca}</p>
                        </div>
                        <div>
                            <p class="fs-5 fw-bold text-primary mb-3">${precioFormateado}</p>
                            <button onclick="agregarAlCarrito('${prod.id}')" class="btn btn-primary w-100 fw-bold">
                                Añadir al Carrito
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        contenedor.innerHTML += cardHTML;
    });
}

function cargarDetalleProducto() {
    const params = new URLSearchParams(window.location.search);
    const prodId = params.get("id");
    const contenedor = document.getElementById("contenedor-detalle-producto");

    if (!contenedor) return;

    const lista = getProductosBD();
    const prod = lista.find(p => p.id === prodId) || lista[0];

    if (!prod) return;

    const precioFormateado = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(prod.precio);

    contenedor.innerHTML = `
        <nav aria-label="breadcrumb" class="mb-4">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="index.html">Home</a></li>
                <li class="breadcrumb-item"><a href="productos.html">Catálogo</a></li>
                <li class="breadcrumb-item active" aria-current="page">${prod.nombre}</li>
            </ol>
        </nav>

        <div class="card p-4 shadow-sm border-2">
            <div class="row g-4 align-items-center">
                <div class="col-12 col-md-6 text-center">
                    <img src="${prod.imagen}" class="img-fluid rounded border" alt="${prod.nombre}" style="max-height: 400px; object-fit: cover;">
                </div>
                <div class="col-12 col-md-6">
                    <h2 class="fw-bold mb-2">${prod.nombre}</h2>
                    <p class="badge bg-secondary mb-3">${prod.marca}</p>
                    <h3 class="text-primary fw-bold display-6 mb-3">${precioFormateado}</h3>
                    <p class="text-muted mb-4">${prod.descripcion || 'Figura coleccionable oficial de importación en PVC de alta calidad.'}</p>
                    
                    <div class="row g-2 align-items-center mb-4">
                        <div class="col-auto">
                            <label for="cantidad-detalle" class="col-form-label fw-bold">Cantidad:</label>
                        </div>
                        <div class="col-auto">
                            <input type="number" id="cantidad-detalle" class="form-control text-center" value="1" min="1" style="width: 90px;">
                        </div>
                    </div>

                    <button onclick="agregarAlCarritoDetalle('${prod.id}')" class="btn btn-primary btn-lg w-100 fw-bold">
                        Añadir al Carrito
                    </button>
                </div>
            </div>
        </div>
    `;
}

function agregarAlCarritoDetalle(productoId) {
    const cantInput = document.getElementById("cantidad-detalle");
    const cantidad = cantInput ? parseInt(cantInput.value) : 1;
    if (isNaN(cantidad) || cantidad < 1) return alert("Ingresa una cantidad válida.");

    const carrito = obtenerCarrito();
    const productosBase = getProductosBD();
    const prod = productosBase.find(p => p.id === productoId);

    if (!prod) return;

    const item = carrito.find(i => i.id === productoId);
    if (item) {
        item.cantidad += cantidad;
    } else {
        carrito.push({ ...prod, cantidad: cantidad });
    }

    guardarCarrito(carrito);
    alert(`✅ Se añadieron ${cantidad} unidad(es) de "${prod.nombre}" al carrito.`);
}