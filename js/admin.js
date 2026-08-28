// ==========================================================================
// CONTROLADOR ADMINISTRATIVO (js/admin.js)
// ==========================================================================

// Renderiza la tabla de inventario desde LocalStorage (R.8, R.9, R.10)
function renderizarTablaAdminProductos() {
    const tbody = document.getElementById("tabla-admin-productos");
    if (!tbody) return;

    const listaProductos = getProductosBD();
    tbody.innerHTML = "";

    if (listaProductos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">No hay productos registrados en el inventario.</td></tr>`;
        return;
    }

    listaProductos.forEach((prod, index) => {
        const limiteCritico = prod.stockCritico || 3;
        const esCritico = prod.stock <= limiteCritico;
        const precioFormateado = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(prod.precio);

        const fila = `
            <tr>
                <td><strong>${prod.id}</strong></td>
                <td>${prod.nombre}</td>
                <td>${precioFormateado}</td>
                <td style="${esCritico ? 'color: var(--admin-danger); font-weight: bold;' : ''}">${prod.stock} u.</td>
                <td>
                    <span class="badge-status ${esCritico ? 'badge-critical' : 'badge-ok'}">
                        ${esCritico ? 'CRÍTICO' : 'DISPONIBLE'}
                    </span>
                </td>
                <td>
                    <button onclick="eliminarProductoAdmin(${index})" class="btn-admin btn-admin-danger">Eliminar</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += fila;
    });
}

// Renderiza la tabla de usuarios registrados (R.13)
function renderizarTablaAdminUsuarios() {
    const tbody = document.getElementById("tabla-admin-usuarios");
    if (!tbody) return;

    const listaUsuarios = getUsuariosBD();
    tbody.innerHTML = "";

    listaUsuarios.forEach((u, index) => {
        const fila = `
            <tr>
                <td><strong>${u.run}</strong></td>
                <td>${u.nombre}</td>
                <td>${u.correo}</td>
                <td>
                    <span class="badge-status ${u.rol === 'Administrador' ? 'badge-role-admin' : 'badge-role-vendor'}">
                        ${u.rol}
                    </span>
                </td>
                <td>
                    <button onclick="cambiarRolUsuario(${index})" class="btn-admin" style="border: 1px solid #ccc; background: white;">
                        Cambiar Rol
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += fila;
    });
}

// Elimina producto del inventario y actualiza LocalStorage
function eliminarProductoAdmin(index) {
    const listaProductos = getProductosBD();
    const prod = listaProductos[index];

    if (confirm(`¿Estás seguro de eliminar "${prod.nombre}" del sistema?`)) {
        listaProductos.splice(index, 1);
        saveProductosBD(listaProductos);
        renderizarTablaAdminProductos();
    }
}

// Alterna el rol de usuario entre Administrador y Vendedor (R.13)
function cambiarRolUsuario(index) {
    const listaUsuarios = getUsuariosBD();
    const nuevoRol = listaUsuarios[index].rol === "Administrador" ? "Vendedor" : "Administrador";

    listaUsuarios[index].rol = nuevoRol;
    saveUsuariosBD(listaUsuarios);
    renderizarTablaAdminUsuarios();
}

// Evento de Inicialización
document.addEventListener("DOMContentLoaded", () => {
    renderizarTablaAdminProductos();
    renderizarTablaAdminUsuarios();

    // Formulario de Creación de Producto (R.8, R.9, R.10)
    const formProd = document.getElementById("form-admin-producto");
    if (formProd) {
        formProd.addEventListener("submit", (e) => {
            e.preventDefault();

            const codigo = document.getElementById("prod-codigo").value.trim();
            const nombre = document.getElementById("prod-nombre").value.trim();
            const precio = parseInt(document.getElementById("prod-precio").value);
            const stock = parseInt(document.getElementById("prod-stock").value);
            const critico = parseInt(document.getElementById("prod-critico").value);

            // Validaciones R.8 y R.9
            if (codigo.length < 3) return alert(" ERROR: El código debe tener al menos 3 caracteres.");
            if (nombre.length === 0 || nombre.length > 100) return alert(" ERROR: El nombre es obligatorio (máx. 100 caracteres).");
            if (isNaN(precio) || precio < 0) return alert(" ERROR: El precio debe ser un número mayor o igual a 0.");
            if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) return alert(" ERROR: El stock debe ser un número entero mayor o igual a 0.");

            const listaProductos = getProductosBD();

            // Verificar código duplicado
            if (listaProductos.some(p => p.id.toUpperCase() === codigo.toUpperCase())) {
                return alert(" ERROR: Ya existe un producto registrado con ese código.");
            }

            const nuevoProducto = {
                id: codigo.toUpperCase(),
                nombre: nombre,
                marca: "Importación Oficial",
                precio: precio,
                stock: stock,
                stockCritico: critico,
                destacado: false,
                imagen: "https://via.placeholder.com/300x300?text=" + encodeURIComponent(nombre)
            };

            listaProductos.push(nuevoProducto);
            saveProductosBD(listaProductos);

            alert("✅ ÉXITO: Producto guardado en el inventario.");

            // Alerta de Stock Crítico automática (R.10)
            if (stock <= critico) {
                alert(` ALERTA DE INVENTARIO (R.10):\nEl producto "${nombre}" ha sido ingresado con un stock de ${stock} unidades, alcanzando el límite crítico de ${critico}.`);
            }

            formProd.reset();
            renderizarTablaAdminProductos();
        });
    }
});