function renderizarTablaAdminProductos() {
    const tbody = document.getElementById("tabla-admin-productos");
    if (!tbody) return;

    const listaProductos = getProductosBD();
    tbody.innerHTML = "";

    if (listaProductos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center p-3">No hay productos registrados.</td></tr>`;
        return;
    }

    listaProductos.forEach((prod, index) => {
        const limiteCritico = prod.stockCritico || 3;
        const esCritico = prod.stock <= limiteCritico;
        const precioFormateado = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(prod.precio);

        const fila = `
            <tr>
                <td class="fw-bold">${prod.id}</td>
                <td>${prod.nombre}</td>
                <td>${precioFormateado}</td>
                <td class="${esCritico ? 'text-danger fw-bold' : ''}">${prod.stock} u.</td>
                <td>
                    <span class="badge ${esCritico ? 'bg-danger' : 'bg-success'}">
                        ${esCritico ? 'STOCK CRÍTICO' : 'NORMAL'}
                    </span>
                </td>
                <td>
                    <button onclick="eliminarProductoAdmin(${index})" class="btn btn-danger btn-sm">Eliminar</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += fila;
    });
}

function renderizarTablaAdminUsuarios() {
    const tbody = document.getElementById("tabla-admin-usuarios");
    if (!tbody) return;

    const listaUsuarios = getUsuariosBD();
    tbody.innerHTML = "";

    listaUsuarios.forEach((u, index) => {
        const fila = `
            <tr>
                <td class="fw-bold">${u.run}</td>
                <td>${u.nombre}</td>
                <td>${u.correo}</td>
                <td>
                    <span class="badge ${u.rol === 'Administrador' ? 'bg-primary' : 'bg-warning text-dark'}">
                        ${u.rol}
                    </span>
                </td>
                <td>
                    <button onclick="cambiarRolUsuario(${index})" class="btn btn-outline-secondary btn-sm">
                        Cambiar Rol
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += fila;
    });
}