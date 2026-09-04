// ============================================================
// RENDERIZADO GENERAL DEL CATÁLOGO (HOME Y PRODUCTOS)
// ============================================================

function renderizarCatalogo(listaOpcional, contenedorId) {
    const contenedor = document.getElementById(contenedorId || "contenedor-productos");
    if (!contenedor) return;

    const lista = listaOpcional || getProductosBD();
    contenedor.innerHTML = "";

    if (lista.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning text-center border-3 border-dark fw-bold p-4">
                    NO SE ENCONTRARON PRODUCTOS QUE COINCIDAN CON TU BÚSQUEDA.
                </div>
            </div>
        `;
        return;
    }

    lista.forEach(prod => {
        const precioFormateado = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(prod.precio);
        const esCritico = prod.stock <= (prod.stockCritico || 3);

        const imagenPrincipal = Array.isArray(prod.imagenes)
            ? prod.imagenes[0]
            : (prod.imagen || 'images/placeholder.jpg');

        const cardHTML = `
            <div class="col-12 col-sm-6 col-md-4 d-flex align-items-stretch">
                <div class="card w-100 shadow-sm border-3">
                    <span class="badge ${esCritico ? 'bg-danger text-white' : 'bg-warning text-dark'} border border-dark border-2 fw-black text-uppercase position-absolute top-0 end-0 m-2">
                        ${esCritico ? '● ÚLTIMOS DISPONIBLES' : '● DISPONIBLE'}
                    </span>
                    <a href="detalle.html?id=${prod.id}">
                        <img src="${imagenPrincipal}" class="card-img-top p-3" alt="${prod.nombre}" style="height: 280px; object-fit: contain; background: #fff;">
                    </a>
                    <div class="card-body d-flex flex-column justify-content-between p-3">
                        <div>
                            <span class="badge bg-dark text-white border border-dark mb-2 text-uppercase fw-bold">${prod.categoria || 'Anime'}</span>
                            <a href="detalle.html?id=${prod.id}" class="text-decoration-none text-dark">
                                <h5 class="card-title text-truncate fs-6 fw-bold text-uppercase mb-1">${prod.nombre}</h5>
                            </a>
                            <p class="text-muted small mb-2">${prod.marca}</p>
                        </div>
                        <div>
                            <p class="fs-4 fw-bold text-primary mb-3">${precioFormateado}</p>
                            <button onclick="agregarAlCarrito('${prod.id}')" class="btn btn-primary w-100 fw-bold text-uppercase border-2 border-dark shadow-sm">
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

// ============================================================
// GALERÍA Y DETALLE DE PRODUCTO
// ============================================================

function cambiarImagenPrincipal(src, elemento) {
    const imgPrincipal = document.getElementById("img-principal-detalle");
    if (imgPrincipal && typeof src === "string") {
        imgPrincipal.src = src;
    }

    document.querySelectorAll('.img-miniatura').forEach(img => img.classList.remove('active'));
    if (elemento && elemento.classList) {
        elemento.classList.add('active');
    }
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
    const listaImagenes = Array.isArray(prod.imagenes) ? prod.imagenes : [prod.imagen || 'images/placeholder.jpg'];
    const imagenPrincipal = listaImagenes[0];
    const esCritico = prod.stock <= (prod.stockCritico || 3);

    const recomendados = lista.filter(p => p.id !== prod.id).slice(0, 4);

    const miniaturasHTML = listaImagenes.map((imgSrc, index) => `
        <img src="${imgSrc}" 
             class="img-miniatura ${index === 0 ? 'active' : ''}" 
             alt="Vista ${index + 1}" 
             onclick="cambiarImagenPrincipal('${imgSrc}', this)">
    `).join('');

    const recomendadosHTML = recomendados.map(rec => {
        const recPrecio = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(rec.precio);
        const recImg = Array.isArray(rec.imagenes) ? rec.imagenes[0] : (rec.imagen || 'images/placeholder.jpg');

        return `
            <div class="col-12 col-sm-6 col-md-3">
                <div class="card h-100 border-3 shadow-sm">
                    <a href="detalle.html?id=${rec.id}">
                        <img src="${recImg}" class="card-img-top p-2" alt="${rec.nombre}" style="height: 180px; object-fit: contain; background: #fff;">
                    </a>
                    <div class="card-body d-flex flex-column justify-content-between p-3">
                        <div>
                            <a href="detalle.html?id=${rec.id}" class="text-decoration-none text-dark">
                                <h6 class="fw-bold text-truncate text-uppercase mb-1">${rec.nombre}</h6>
                            </a>
                            <p class="text-muted small mb-2">${rec.marca}</p>
                        </div>
                        <div>
                            <p class="fw-bold text-primary mb-2">${recPrecio}</p>
                            <a href="detalle.html?id=${rec.id}" class="btn btn-outline-dark btn-sm w-100 fw-bold text-uppercase border-2">
                                VER FICHA
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    contenedor.innerHTML = `
        <nav aria-label="breadcrumb" class="mb-4">
            <ol class="breadcrumb fw-bold text-uppercase">
                <li class="breadcrumb-item"><a href="index.html" class="text-dark text-decoration-none">Home</a></li>
                <li class="breadcrumb-item"><a href="productos.html" class="text-dark text-decoration-none">Catálogo</a></li>
                <li class="breadcrumb-item active text-primary" aria-current="page">${prod.nombre}</li>
            </ol>
        </nav>

        <div class="card p-4 border-3 shadow-sm mb-5">
            <div class="row g-4 align-items-center">
                <!-- Columna Galería -->
                <div class="col-12 col-md-6 text-center">
                    <div class="bg-white border border-dark border-3 p-3 mb-3" style="min-height: 350px; display: flex; align-items: center; justify-content: center;">
                        <img id="img-principal-detalle" src="${imagenPrincipal}" class="img-fluid" alt="${prod.nombre}" style="max-height: 380px; object-fit: contain;">
                    </div>
                    <div class="d-flex justify-content-center flex-wrap gap-2">
                        ${miniaturasHTML}
                    </div>
                </div>

                <!-- Columna Información -->
                <div class="col-12 col-md-6">
                    <div class="d-flex align-items-center gap-2 mb-2">
                        <span class="badge ${esCritico ? 'bg-danger text-white' : 'bg-warning text-dark'} border border-dark border-2 fw-black text-uppercase px-2 py-1">
                            ${esCritico ? 'ÚLTIMOS DISPONIBLES' : '● DISPONIBLE'}
                        </span>
                        <span class="badge bg-dark text-white border border-dark border-2 fw-black text-uppercase px-2 py-1">${prod.categoria || 'Coleccionables'}</span>
                    </div>

                    <h2 class="fw-black text-uppercase display-6 mb-1">${prod.nombre}</h2>
                    <p class="text-muted fw-bold mb-3">FABRICANTE: <span class="text-dark text-uppercase">${prod.marca}</span> | CÓD: <span class="text-dark">${prod.id}</span></p>

                    <div class="p-3 bg-light border border-dark border-3 mb-4">
                        <span class="fs-6 text-muted d-block fw-bold text-uppercase">Precio Contado / Débito:</span>
                        <span class="display-5 fw-bold text-primary">${precioFormateado}</span>
                    </div>

                    <p class="text-dark mb-4 leading-relaxed">${prod.descripcion || 'Figura coleccionable oficial de importación en PVC de alta calidad con acabados de nivel profesional.'}</p>

                    <!-- Selector de Cantidad y Botón -->
                    <div class="row g-2 align-items-center mb-4">
                        <div class="col-auto">
                            <label for="cantidad-detalle" class="col-form-label fw-bold text-uppercase">CANTIDAD:</label>
                        </div>
                        <div class="col-auto">
                            <input type="number" id="cantidad-detalle" class="form-control border-3 border-dark text-center fw-bold" value="1" min="1" max="${prod.stock}" style="width: 90px;">
                        </div>
                    </div>

                    <button onclick="agregarAlCarritoDetalle('${prod.id}')" class="btn btn-primary btn-lg w-100 fw-bold border-3 border-dark text-uppercase">
                        AÑADIR AL CARRITO
                    </button>

                    <!-- Beneficios Estilizados -->
                    <div class="row text-center mt-4 pt-3 border-top border-3 border-dark g-2 small fw-black text-uppercase text-dark">
                        <div class="col-4">❖ ENVÍO BLINDADO</div>
                        <div class="col-4">✦ 100% ORIGINAL</div>
                        <div class="col-4">█ PAGO SEGURO</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Módulo de Productos Recomendados -->
        <section class="mt-5">
            <h3 class="title-accent mb-4">PRODUCTOS RELACIONADOS</h3>
            <div class="row g-4">
                ${recomendadosHTML}
            </div>
        </section>
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

    const imagenUrl = Array.isArray(prod.imagenes) ? prod.imagenes[0] : (prod.imagen || 'images/placeholder.jpg');

    const item = carrito.find(i => i.id === productoId);
    if (item) {
        item.cantidad += cantidad;
    } else {
        carrito.push({
            ...prod,
            imagen: imagenUrl,
            cantidad: cantidad
        });
    }

    guardarCarrito(carrito);
    alert(`Se añadieron ${cantidad} unidad(es) de "${prod.nombre}" al carrito.`);
}

function filtrarProductos() {
    const textoBuscador = document.getElementById("buscar-producto")?.value.toLowerCase().trim() || "";
    const categoriaSel = document.getElementById("filtro-categoria")?.value || "";
    const ordenSel = document.getElementById("orden-precio")?.value || "defecto";
    const contadorBadge = document.getElementById("contador-productos");

    // Verificar si el usuario ha interactuado con alguno de los filtros
    const hayFiltroActivo = textoBuscador !== "" || categoriaSel !== "" || ordenSel !== "defecto";

    let resultados = getProductosBD();

    // 1. Filtrar por texto (nombre o marca)
    if (textoBuscador) {
        resultados = resultados.filter(p =>
            p.nombre.toLowerCase().includes(textoBuscador) ||
            p.marca.toLowerCase().includes(textoBuscador)
        );
    }

    // 2. Filtrar por Categoría
    if (categoriaSel) {
        resultados = resultados.filter(p => p.categoria === categoriaSel);
    }

    // 3. Ordenar por precio
    if (ordenSel === "menor-mayor") {
        resultados.sort((a, b) => a.precio - b.precio);
    } else if (ordenSel === "mayor-menor") {
        resultados.sort((a, b) => b.precio - a.precio);
    }

    // Mostrar u ocultar el badge del contador según la interacción
    if (contadorBadge) {
        if (hayFiltroActivo) {
            contadorBadge.textContent = `${resultados.length} FIGURAS ENCONTRADAS`;
            contadorBadge.classList.remove("d-none");
        } else {
            contadorBadge.classList.add("d-none");
        }
    }

    renderizarCatalogo(resultados, "contenedor-productos");
}