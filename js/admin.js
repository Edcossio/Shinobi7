// ============================================================
// FUNCIONES AUXILIARES DE ALMACENAMIENTO UNIFICADO
// ============================================================

function obtenerUsuariosBD() {
    const dataLocal = localStorage.getItem("collector_usuarios");
    if (dataLocal) {
        return JSON.parse(dataLocal);
    }
    return typeof getUsuariosBD === "function" ? getUsuariosBD() : [];
}

function guardarUsuariosBDUnificado(usuarios) {
    localStorage.setItem("collector_usuarios", JSON.stringify(usuarios));
    if (typeof guardarUsuariosBD === "function") guardarUsuariosBD(usuarios);
    if (typeof saveUsuariosBD === "function") saveUsuariosBD(usuarios);
}

// ============================================================
// AJUSTES DE INTERFAZ POR ROLES
// ============================================================

function adaptarPanelSegunRol() {
    const sesionRaw = sessionStorage.getItem("sesionActiva");
    if (!sesionRaw) return;

    const usuario = JSON.parse(sesionRaw);
    const rol = (usuario.rol || "").toLowerCase();

    if (rol === "vendedor") {
        document.querySelectorAll(".admin-nav-link").forEach(link => {
            const href = link.getAttribute("href");
            if (href === "admin_usuarios.html" || href === "admin_home.html") {
                if (link.parentElement) link.parentElement.style.display = "none";
            }
        });
    }
}

// ============================================================
// CRUD Y BÚSQUEDA DE PRODUCTOS
// ============================================================

let productoEnEdicionId = null;

function renderizarTablaProductos(lista) {
    const tbody = document.getElementById("tabla-admin-productos");
    if (!tbody) return;

    const productos = lista || (typeof getProductosBD === "function" ? getProductosBD() : []);
    tbody.innerHTML = "";

    if (productos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-3 fw-bold">No se encontraron productos.</td></tr>`;
        return;
    }

    productos.forEach((p) => {
        const esCritico = p.stock <= (p.stockCritico || 3);
        const statusBadge = esCritico
            ? `<span class="badge bg-danger text-uppercase">CRÍTICO (${p.stock})</span>`
            : `<span class="badge bg-success text-uppercase">OK (${p.stock})</span>`;

        tbody.innerHTML += `
            <tr>
                <td><strong>${p.id}</strong></td>
                <td>${p.nombre}</td>
                <td>$${p.precio.toLocaleString('es-CL')}</td>
                <td>${p.stock}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-warning fw-bold me-1 text-uppercase border border-dark" onclick="prepararEdicionProducto('${p.id}')">Editar</button>
                    <button class="btn btn-sm btn-danger fw-bold text-uppercase border border-dark" onclick="eliminarProductoAdmin('${p.id}')">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

function filtrarTablaProductos() {
    const filtro = document.getElementById("buscar-admin-producto")?.value.toLowerCase().trim() || "";
    const productos = typeof getProductosBD === "function" ? getProductosBD() : [];

    const filtrados = productos.filter(p =>
        p.id.toLowerCase().includes(filtro) ||
        p.nombre.toLowerCase().includes(filtro)
    );

    renderizarTablaProductos(filtrados);
}

function prepararEdicionProducto(id) {
    const productos = typeof getProductosBD === "function" ? getProductosBD() : [];
    const prod = productos.find(p => p.id === id);
    if (!prod) return;

    productoEnEdicionId = prod.id;

    const inputCodigo = document.getElementById("prod-codigo");
    if (inputCodigo) {
        inputCodigo.value = prod.id;
        inputCodigo.disabled = true;
    }

    document.getElementById("prod-nombre").value = prod.nombre;
    document.getElementById("prod-precio").value = prod.precio;
    document.getElementById("prod-stock").value = prod.stock;
    document.getElementById("prod-critico").value = prod.stockCritico || 3;

    const titulo = document.getElementById("titulo-form-producto");
    const btnSubmit = document.getElementById("btn-submit-producto");
    const btnCancelar = document.getElementById("btn-cancelar-edicion");

    if (titulo) titulo.textContent = "Editar Configuración de Producto";
    if (btnSubmit) btnSubmit.textContent = "Actualizar Producto";
    if (btnCancelar) btnCancelar.style.display = "inline-block";

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetFormProducto() {
    productoEnEdicionId = null;
    const form = document.getElementById("form-admin-producto");
    if (form) form.reset();

    const inputCodigo = document.getElementById("prod-codigo");
    if (inputCodigo) inputCodigo.disabled = false;

    const titulo = document.getElementById("titulo-form-producto");
    const btnSubmit = document.getElementById("btn-submit-producto");
    const btnCancelar = document.getElementById("btn-cancelar-edicion");

    if (titulo) titulo.textContent = "Añadir Configuración de Producto";
    if (btnSubmit) btnSubmit.textContent = "Agregar Producto";
    if (btnCancelar) btnCancelar.style.display = "none";
}

function eliminarProductoAdmin(id) {
    if (!confirm(`¿Está seguro de eliminar el producto (${id}) del inventario?`)) return;

    let productos = typeof getProductosBD === "function" ? getProductosBD() : [];
    productos = productos.filter(p => p.id !== id);

    if (typeof guardarProductosBD === "function") guardarProductosBD(productos);

    if (productoEnEdicionId === id) resetFormProducto();
    filtrarTablaProductos();
}

// ============================================================
// CRUD Y BÚSQUEDA DE USUARIOS
// ============================================================

let usuarioEnEdicionCorreo = null;

function renderizarTablaUsuarios(lista) {
    const tbody = document.getElementById("tabla-admin-usuarios");
    if (!tbody) return;

    const usuarios = lista || obtenerUsuariosBD();
    tbody.innerHTML = "";

    if (usuarios.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-3 fw-bold">No se encontraron usuarios.</td></tr>`;
        return;
    }

    usuarios.forEach((u) => {
        const rol = u.rol || "Cliente";
        const badgeColor = (rol.toLowerCase() === "administrador")
            ? "bg-danger"
            : (rol.toLowerCase() === "vendedor" ? "bg-warning text-dark" : "bg-secondary");

        tbody.innerHTML += `
            <tr>
                <td><strong>${u.run || 'N/A'}</strong></td>
                <td>${u.nombre}</td>
                <td>${u.correo}</td>
                <td><span class="badge ${badgeColor} text-uppercase">${rol}</span></td>
                <td>
                    <button class="btn btn-sm btn-warning fw-bold me-1 text-uppercase border border-dark" onclick="prepararEdicionUsuario('${u.correo}')">Editar</button>
                    <button class="btn btn-sm btn-danger fw-bold text-uppercase border border-dark" onclick="eliminarUsuarioAdmin('${u.correo}')">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

function filtrarTablaUsuarios() {
    const filtro = document.getElementById("buscar-admin-usuario")?.value.toLowerCase().trim() || "";
    const usuarios = obtenerUsuariosBD();

    const filtrados = usuarios.filter(u =>
        (u.nombre && u.nombre.toLowerCase().includes(filtro)) ||
        (u.run && u.run.toLowerCase().includes(filtro)) ||
        (u.correo && u.correo.toLowerCase().includes(filtro))
    );

    renderizarTablaUsuarios(filtrados);
}

function prepararEdicionUsuario(correo) {
    const usuarios = obtenerUsuariosBD();
    const u = usuarios.find(user => user.correo.toLowerCase() === correo.toLowerCase());
    if (!u) return;

    usuarioEnEdicionCorreo = u.correo;

    document.getElementById("user-run").value = u.run || "";
    document.getElementById("user-nombre").value = u.nombre || "";

    const inputCorreo = document.getElementById("user-correo");
    if (inputCorreo) {
        inputCorreo.value = u.correo || "";
        inputCorreo.disabled = true;
    }

    document.getElementById("user-password").value = "";
    document.getElementById("user-rol").value = u.rol || "Cliente";

    const titulo = document.getElementById("titulo-form-usuario");
    const btnSubmit = document.getElementById("btn-submit-usuario");
    const btnCancelar = document.getElementById("btn-cancelar-usuario");

    if (titulo) titulo.textContent = "Editar Cuenta de Usuario";
    if (btnSubmit) btnSubmit.textContent = "Actualizar Usuario";
    if (btnCancelar) btnCancelar.style.display = "inline-block";

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetFormUsuario() {
    usuarioEnEdicionCorreo = null;
    const form = document.getElementById("form-admin-usuario");
    if (form) form.reset();

    const inputCorreo = document.getElementById("user-correo");
    if (inputCorreo) inputCorreo.disabled = false;

    const titulo = document.getElementById("titulo-form-usuario");
    const btnSubmit = document.getElementById("btn-submit-usuario");
    const btnCancelar = document.getElementById("btn-cancelar-usuario");

    if (titulo) titulo.textContent = "Añadir Usuario";
    if (btnSubmit) btnSubmit.textContent = "Guardar Usuario";
    if (btnCancelar) btnCancelar.style.display = "none";
}

function eliminarUsuarioAdmin(correo) {
    let usuarios = obtenerUsuariosBD();
    const target = usuarios.find(u => u.correo.toLowerCase() === correo.toLowerCase());

    if (!target) return;

    const sesionRaw = sessionStorage.getItem("sesionActiva");
    if (sesionRaw) {
        const sesion = JSON.parse(sesionRaw);
        if (sesion.correo && sesion.correo.toLowerCase() === correo.toLowerCase()) {
            alert("No puedes eliminar tu propio usuario mientras tienes la sesión activa.");
            return;
        }
    }

    if (!confirm(`¿Eliminar al usuario "${target.nombre}" (${correo})?`)) return;

    usuarios = usuarios.filter(u => u.correo.toLowerCase() !== correo.toLowerCase());
    guardarUsuariosBDUnificado(usuarios);

    if (usuarioEnEdicionCorreo && usuarioEnEdicionCorreo.toLowerCase() === correo.toLowerCase()) {
        resetFormUsuario();
    }

    filtrarTablaUsuarios();
}

// ============================================================
// EVENTOS Y REGISTRO DE EVENTOS FORMULARIO
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    adaptarPanelSegunRol();

    renderizarTablaProductos();
    renderizarTablaUsuarios();

    // FORMULARIO PRODUCTOS
    const formProd = document.getElementById("form-admin-producto");
    if (formProd) {
        formProd.addEventListener("submit", (e) => {
            e.preventDefault();
            let productos = typeof getProductosBD === "function" ? getProductosBD() : [];

            const codigo = document.getElementById("prod-codigo").value.trim();
            const nombre = document.getElementById("prod-nombre").value.trim();
            const precio = parseInt(document.getElementById("prod-precio").value);
            const stock = parseInt(document.getElementById("prod-stock").value);
            const critico = parseInt(document.getElementById("prod-critico").value);

            if (productoEnEdicionId) {
                const index = productos.findIndex(p => p.id === productoEnEdicionId);
                if (index !== -1) {
                    productos[index] = {
                        ...productos[index],
                        nombre,
                        precio,
                        stock,
                        stockCritico: critico
                    };
                    alert("Producto actualizado exitosamente.");
                }
            } else {
                if (productos.some(p => p.id.toLowerCase() === codigo.toLowerCase())) {
                    alert("Error: El código de producto ya existe.");
                    return;
                }

                productos.push({
                    id: codigo,
                    nombre,
                    precio,
                    stock,
                    stockCritico: critico,
                    imagenes: ['images/placeholder.jpg']
                });
                alert("Producto agregado exitosamente.");
            }

            if (typeof guardarProductosBD === "function") guardarProductosBD(productos);
            resetFormProducto();
            filtrarTablaProductos();
        });

        document.getElementById("btn-cancelar-edicion")?.addEventListener("click", resetFormProducto);
    }

    // FORMULARIO USUARIOS
    const formUser = document.getElementById("form-admin-usuario");
    if (formUser) {
        formUser.addEventListener("submit", (e) => {
            e.preventDefault();
            let usuarios = obtenerUsuariosBD();

            const run = document.getElementById("user-run").value.trim();
            const nombre = document.getElementById("user-nombre").value.trim();
            const correoInput = document.getElementById("user-correo");
            const correo = correoInput ? correoInput.value.trim() : "";
            const password = document.getElementById("user-password").value;
            const rol = document.getElementById("user-rol").value;

            if (usuarioEnEdicionCorreo) {
                // MODO EDICIÓN
                const index = usuarios.findIndex(u => u.correo.toLowerCase() === usuarioEnEdicionCorreo.toLowerCase());
                if (index !== -1) {
                    usuarios[index].run = run;
                    usuarios[index].nombre = nombre;
                    usuarios[index].rol = rol;

                    if (password.trim().length > 0) {
                        usuarios[index].password = btoa(password);
                    }

                    // Actualizar sesión activa si te estás editando a ti mismo
                    const sesionRaw = sessionStorage.getItem("sesionActiva");
                    if (sesionRaw) {
                        const sesion = JSON.parse(sesionRaw);
                        if (sesion.correo && sesion.correo.toLowerCase() === usuarioEnEdicionCorreo.toLowerCase()) {
                            sessionStorage.setItem("sesionActiva", JSON.stringify(usuarios[index]));
                        }
                    }

                    alert("Usuario actualizado exitosamente.");
                }
            } else {
                // MODO CREACIÓN
                if (usuarios.some(u => u.correo.toLowerCase() === correo.toLowerCase())) {
                    alert("Error: El correo ingresado ya está registrado.");
                    return;
                }

                usuarios.push({
                    run,
                    nombre,
                    correo,
                    password: btoa(password || "12345678"),
                    rol
                });
                alert("Usuario creado exitosamente.");
            }

            guardarUsuariosBDUnificado(usuarios);
            resetFormUsuario();
            renderizarTablaUsuarios();
        });

        document.getElementById("btn-cancelar-usuario")?.addEventListener("click", resetFormUsuario);
    }
});