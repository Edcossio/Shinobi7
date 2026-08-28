// ======================================================
// VARIABLE PARA SABER SI ESTAMOS EDITANDO UN PRODUCTO
// ======================================================

let productoEditando = null;


// ======================================================
// MOSTRAR PRODUCTOS EN LA TABLA
// ======================================================

function renderizarTablaAdminProductos() {

    const tbody = document.getElementById("tabla-admin-productos");

    if (!tbody) {
        return;
    }

    const listaProductos = getProductosBD();

    tbody.innerHTML = "";


    // Si no hay productos
    if (listaProductos.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    No hay productos registrados.
                </td>
            </tr>
        `;

        return;
    }


    // Recorrer productos
    listaProductos.forEach(function(prod, index) {

        const limiteCritico = prod.stockCritico || 3;

        const stockCritico = prod.stock <= limiteCritico;


        // Formatear precio en pesos chilenos
        const precioFormateado = new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP"
        }).format(prod.precio);


        const fila = `
            <tr>

                <td class="fw-bold">
                    ${prod.id}
                </td>

                <td>
                    ${prod.nombre}
                </td>

                <td>
                    ${precioFormateado}
                </td>

                <td class="${stockCritico ? "text-danger fw-bold" : ""}">
                    ${prod.stock} u.
                </td>

                <td>

                    <span class="badge ${stockCritico ? "bg-danger" : "bg-success"}">

                        ${stockCritico
                            ? "STOCK CRÍTICO"
                            : "NORMAL"
                        }

                    </span>

                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-warning btn-sm"
                        onclick="editarProductoAdmin(${index})">

                        Editar

                    </button>


                    <button
                        type="button"
                        class="btn btn-danger btn-sm"
                        onclick="eliminarProductoAdmin(${index})">

                        Eliminar

                    </button>

                </td>

            </tr>
        `;


        tbody.innerHTML += fila;

    });

}



// ======================================================
// GUARDAR PRODUCTO
// SIRVE TANTO PARA AGREGAR COMO PARA EDITAR
// ======================================================

function guardarProductoAdmin(event) {

    event.preventDefault();


    // Obtener valores del formulario

    const codigo = document
        .getElementById("prod-codigo")
        .value
        .trim();


    const nombre = document
        .getElementById("prod-nombre")
        .value
        .trim();


    const precio = Number(
        document.getElementById("prod-precio").value
    );


    const stock = Number(
        document.getElementById("prod-stock").value
    );


    const stockCritico = Number(
        document.getElementById("prod-critico").value
    );



    // ==================================================
    // VALIDACIONES
    // ==================================================

    if (codigo.length < 3) {

        alert("El código debe tener al menos 3 caracteres.");

        return;
    }


    if (nombre === "") {

        alert("Debe ingresar el nombre del producto.");

        return;
    }


    if (precio < 0 || isNaN(precio)) {

        alert("El precio no es válido.");

        return;
    }


    if (
        stock < 0 ||
        isNaN(stock) ||
        !Number.isInteger(stock)
    ) {

        alert("El stock debe ser un número entero mayor o igual a 0.");

        return;
    }


    if (
        stockCritico < 1 ||
        isNaN(stockCritico) ||
        !Number.isInteger(stockCritico)
    ) {

        alert("El límite crítico debe ser un número entero mayor o igual a 1.");

        return;
    }



    const listaProductos = getProductosBD();



    // ==================================================
    // EDITAR PRODUCTO
    // ==================================================

    if (productoEditando !== null) {

        const producto = listaProductos[productoEditando];


        if (!producto) {

            alert("No se encontró el producto.");

            return;
        }


        // Revisar si el nuevo código ya existe

        const codigoExiste = listaProductos.some(
            function(prod, index) {

                return (
                    index !== productoEditando &&
                    prod.id.toLowerCase() === codigo.toLowerCase()
                );

            }
        );


        if (codigoExiste) {

            alert("Ya existe un producto con ese código.");

            return;
        }


        // Actualizar datos

        producto.id = codigo;

        producto.nombre = nombre;

        producto.precio = precio;

        producto.stock = stock;

        producto.stockCritico = stockCritico;


        // Guardar en LocalStorage

        saveProductosBD(listaProductos);


        alert("Producto actualizado correctamente.");


        cancelarEdicionProducto();


        renderizarTablaAdminProductos();


        return;
    }



    // ==================================================
    // AGREGAR PRODUCTO NUEVO
    // ==================================================

    const codigoExiste = listaProductos.some(
        function(prod) {

            return prod.id.toLowerCase() === codigo.toLowerCase();

        }
    );


    if (codigoExiste) {

        alert("Ya existe un producto con ese código.");

        return;
    }



    // Crear producto

    const nuevoProducto = {

        id: codigo,

        nombre: nombre,

        precio: precio,

        categoria: "Anime",

        imagen: "https://via.placeholder.com/300x300?text=Producto",

        destacado: false,

        stock: stock,

        stockCritico: stockCritico,

        descripcion: "Producto registrado en CollectorVault."

    };


    // Agregar al arreglo

    listaProductos.push(nuevoProducto);


    // Guardar

    saveProductosBD(listaProductos);


    alert("Producto agregado correctamente.");


    // Limpiar formulario

    cancelarEdicionProducto();


    // Actualizar tabla

    renderizarTablaAdminProductos();

}



// ======================================================
// EDITAR PRODUCTO
// ======================================================

function editarProductoAdmin(index) {

    const listaProductos = getProductosBD();

    const producto = listaProductos[index];


    if (!producto) {

        alert("Producto no encontrado.");

        return;
    }


    // Guardamos el índice del producto

    productoEditando = index;


    // Cargar datos en formulario

    document.getElementById("prod-codigo").value =
        producto.id;


    document.getElementById("prod-nombre").value =
        producto.nombre;


    document.getElementById("prod-precio").value =
        producto.precio;


    document.getElementById("prod-stock").value =
        producto.stock;


    document.getElementById("prod-critico").value =
        producto.stockCritico || 3;


    // Cambiar título

    document.getElementById("titulo-form-producto").textContent =
        "Editar Producto";


    // Cambiar texto del botón

    document.getElementById("btn-submit-producto").textContent =
        "Guardar Cambios";


    // Mostrar botón cancelar

    document.getElementById("btn-cancelar-edicion").style.display =
        "inline-block";


    // Subir al formulario

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}



// ======================================================
// CANCELAR EDICIÓN
// ======================================================

function cancelarEdicionProducto() {

    productoEditando = null;


    const formulario =
        document.getElementById("form-admin-producto");


    if (formulario) {

        formulario.reset();

    }


    // Restaurar valor por defecto

    document.getElementById("prod-critico").value = 3;


    // Restaurar título

    document.getElementById("titulo-form-producto").textContent =
        "Add Item Configuration";


    // Restaurar botón

    document.getElementById("btn-submit-producto").textContent =
        "Agregar Producto";


    // Ocultar cancelar

    document.getElementById("btn-cancelar-edicion").style.display =
        "none";

}



// ======================================================
// ELIMINAR PRODUCTO
// ======================================================

function eliminarProductoAdmin(index) {

    const listaProductos = getProductosBD();

    const producto = listaProductos[index];


    if (!producto) {

        alert("Producto no encontrado.");

        return;
    }


    const confirmar = confirm(
        "¿Está seguro de eliminar el producto " +
        producto.nombre +
        "?"
    );


    if (!confirmar) {

        return;
    }


    // Eliminar del arreglo

    listaProductos.splice(index, 1);


    // Guardar cambios

    saveProductosBD(listaProductos);


    alert("Producto eliminado correctamente.");


    // Actualizar tabla

    renderizarTablaAdminProductos();

}



// ======================================================
// MOSTRAR TABLA DE USUARIOS
// ======================================================

function renderizarTablaAdminUsuarios() {

    const tbody =
        document.getElementById("tabla-admin-usuarios");


    if (!tbody) {

        return;
    }


    const listaUsuarios = getUsuariosBD();

    tbody.innerHTML = "";


    if (listaUsuarios.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    No hay usuarios registrados.
                </td>
            </tr>
        `;

        return;
    }


    listaUsuarios.forEach(function(u, index) {

        let claseRol = "bg-secondary";


        if (u.rol === "Administrador") {

            claseRol = "bg-primary";

        }
        else if (u.rol === "Vendedor") {

            claseRol = "bg-warning text-dark";

        }
        else if (u.rol === "Cliente") {

            claseRol = "bg-success";

        }


        const fila = `
            <tr>

                <td class="fw-bold">
                    ${u.run}
                </td>

                <td>
                    ${u.nombre}
                </td>

                <td>
                    ${u.correo}
                </td>

                <td>

                    <span class="badge ${claseRol}">
                        ${u.rol}
                    </span>

                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-outline-secondary btn-sm"
                        onclick="cambiarRolUsuario(${index})">

                        Cambiar Rol

                    </button>

                </td>

            </tr>
        `;


        tbody.innerHTML += fila;

    });

}



// ======================================================
// CAMBIAR ROL
// ======================================================

function cambiarRolUsuario(index) {

    const listaUsuarios = getUsuariosBD();

    const usuario = listaUsuarios[index];


    if (!usuario) {

        alert("Usuario no encontrado.");

        return;
    }


    const roles = [
        "Cliente",
        "Vendedor",
        "Administrador"
    ];


    const posicionActual =
        roles.indexOf(usuario.rol);


    let siguientePosicion;


    if (posicionActual === -1) {

        siguientePosicion = 0;

    } else {

        siguientePosicion =
            (posicionActual + 1) % roles.length;

    }


    usuario.rol = roles[siguientePosicion];


    saveUsuariosBD(listaUsuarios);


    alert(
        "El usuario " +
        usuario.nombre +
        " ahora tiene el rol " +
        usuario.rol
    );


    renderizarTablaAdminUsuarios();

}



// ======================================================
// INICIAR PÁGINA
// ======================================================

document.addEventListener("DOMContentLoaded", function() {

    // Mostrar productos

    renderizarTablaAdminProductos();


    // Mostrar usuarios si estamos en esa página

    renderizarTablaAdminUsuarios();


    // Formulario de productos

    const formulario =
        document.getElementById("form-admin-producto");


    if (formulario) {

        formulario.addEventListener(
            "submit",
            guardarProductoAdmin
        );

    }


    // Botón cancelar

    const botonCancelar =
        document.getElementById("btn-cancelar-edicion");


    if (botonCancelar) {

        botonCancelar.addEventListener(
            "click",
            cancelarEdicionProducto
        );

    }

});