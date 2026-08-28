function renderizarCatalogo(listaOpcional, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    // Obtiene los productos persistidos desde LocalStorage/data.js
    const lista = listaOpcional || getProductosBD();

    contenedor.innerHTML = "";
    lista.forEach(prod => {
        const precioFormateado = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(prod.precio);
        const cardHTML = `
            <article class="col-md-3 mb-4">
                <div class="card">
                    <span class="badge-new">${prod.stock <= (prod.stockCritico || 3) ? 'STOCK CRÍTICO' : 'DISPONIBLE'}</span>
                    <img src="${prod.imagen}" class="card-img-top" alt="${prod.nombre}">
                    <div class="card-body">
                        <h4 class="card-title text-truncate">${prod.nombre}</h4>
                        <p class="card-brand">${prod.marca}</p>
                        <p class="price-tag">${precioFormateado}</p>
                        <button onclick="agregarAlCarrito('${prod.id}')" class="btn btn-primary w-100">
                            Añadir al Carrito
                        </button>
                    </div>
                </div>
            </article>
        `;
        contenedor.innerHTML += cardHTML;
    });
}