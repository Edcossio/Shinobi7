document.addEventListener("DOMContentLoaded", () => {

    // ==========================================================
    // CARRITO
    // ==========================================================
    if (typeof actualizarContadorCarrito === "function") {
        actualizarContadorCarrito();
    }

    // ==========================================================
    // PRODUCTOS
    // ==========================================================
    const listaProductos = getProductosBD();

    if (document.getElementById("contenedor-productos")) {
        renderizarCatalogo(listaProductos, "contenedor-productos");
    }

    if (document.getElementById("contenedor-destacados")) {
        const destacados = listaProductos.filter(p => p.destacado);
        renderizarCatalogo(destacados, "contenedor-destacados");
    }

    if (document.getElementById("contenedor-detalle-producto")) {
        cargarDetalleProducto();
    }

    // ==========================================================
    // REGIONES Y COMUNAS
    // ==========================================================
    const selectRegion = document.getElementById("select-region");
    const selectComuna = document.getElementById("select-comuna");

    if (selectRegion && selectComuna) {

        selectRegion.addEventListener("change", e => {

            selectComuna.innerHTML =
                '<option value="">Seleccione Comuna</option>';

            const region = regionesYComunas.find(
                r => r.codigo === e.target.value
            );

            if (region) {
                region.comunas.forEach(comuna => {

                    const option = document.createElement("option");

                    option.value = comuna;
                    option.textContent = comuna;

                    selectComuna.appendChild(option);
                });
            }
        });
    }

    // ==========================================================
    // LOGIN
    // ==========================================================
    const formLogin = document.getElementById("form-login");

    if (formLogin) {

        formLogin.addEventListener("submit", e => {

            e.preventDefault();

            const correo = document
                .getElementById("correo")
                .value
                .trim();

            const pass = document
                .getElementById("password")
                .value
                .trim();

            const checkCorreo = validarCorreo(correo);

            if (!checkCorreo.valido) {
                return mostrarMensaje(checkCorreo.msj);
            }

            const checkPassword = validarPassword(pass);

            if (!checkPassword.valido) {
                return mostrarMensaje(checkPassword.msj);
            }

            const usuariosBD = getUsuariosBD();

            const usuarioValido = usuariosBD.find(u =>
                u.correo.toLowerCase() === correo.toLowerCase() &&
                u.password === pass
            );

            if (usuarioValido) {

                sessionStorage.setItem(
                    "sesionActiva",
                    JSON.stringify(usuarioValido)
                );

                mostrarMensaje(
                    `¡Bienvenido/a de vuelta, ${usuarioValido.nombre}!`,
                    false
                );

                if (usuarioValido.rol === "Administrador") {
                    window.location.replace("admin_home.html");[cite, 8]
                } else {
                    window.location.replace("index.html");[cite, 8]
                }

            } else {

                mostrarMensaje(
                    "Correo o contraseña incorrectos."
                );
            }
        });
    }

    // ==========================================================
    // NAVBAR / SESIÓN
    // ==========================================================
    function actualizarInterfazSesion() {

        const sesionGuardada =
            sessionStorage.getItem("sesionActiva");

        const sesionActiva =
            sesionGuardada
                ? JSON.parse(sesionGuardada)
                : null;

        const navLinks =
            document.querySelector(".nav-links");

        const enlacesNav =
            document.querySelectorAll(".nav-item");

        if (!sesionActiva) {
            return null;
        }

        // ------------------------------------------------------
        // PANEL ADMIN
        // ------------------------------------------------------
        if (
            sesionActiva.rol === "Administrador" &&
            navLinks &&
            !document.getElementById("link-panel-admin")
        ) {

            const liAdmin = document.createElement("li");

            liAdmin.innerHTML = `
                <a href="admin_home.html"
                   id="link-panel-admin"
                   class="nav-item fw-bold text-danger">
                    ADMIN
                </a>
            `;

            navLinks.insertBefore(
                liAdmin,
                navLinks.firstChild
            );
        }

        // ------------------------------------------------------
        // CERRAR SESIÓN
        // ------------------------------------------------------
        enlacesNav.forEach(enlace => {

            if (
                enlace.textContent.includes(
                    "INICIAR SESIÓN"
                )
            ) {

                const primerNombre =
                    sesionActiva.nombre
                        ? sesionActiva.nombre.split(" ")[0]
                        : "";

                enlace.textContent =
                    `CERRAR SESIÓN (${primerNombre})`;

                enlace.href = "#";
                enlace.classList.add("text-danger");

                enlace.addEventListener("click", e => {

                    e.preventDefault();

                    sessionStorage.removeItem(
                        "sesionActiva"
                    );

                    window.location.href =
                        "index.html";
                });
            }
        });

        return sesionActiva;
    }

    const sesionActiva =
        actualizarInterfazSesion();

    // ==========================================================
    // DATOS DE DESPACHO
    // ==========================================================
    function actualizarDespacho() {

        if (
            !document.getElementById(
                "contenedor-carrito-items"
            )
        ) {
            return;
        }

        const direccionInput =
            document.getElementById(
                "direccion-despacho"
            );

        if (!direccionInput) {
            return;
        }

        const sesionGuardada =
            sessionStorage.getItem("sesionActiva");

        const usuario =
            sesionGuardada
                ? JSON.parse(sesionGuardada)
                : null;

        // ------------------------------------------------------
        // SIN SESIÓN
        // ------------------------------------------------------
        if (!usuario) {

            direccionInput.value =
                "Inicia sesión para ver tu dirección";

            direccionInput.readOnly = true;

            return;
        }

        // ------------------------------------------------------
        // CON SESIÓN
        // ------------------------------------------------------
        if (usuario.direccion) {

            direccionInput.value =
                usuario.direccion;

            direccionInput.readOnly = true;

            direccionInput.style.cursor =
                "default";

            const direccionTexto =
                document.getElementById(
                    "direccion-usuario"
                );

            if (direccionTexto) {

                direccionTexto.textContent =
                    usuario.direccion;
            }
        }
    }

    actualizarDespacho();

    // ==========================================================
    // CONTACTO
    // ==========================================================
    const formContacto =
        document.getElementById("form-contacto");

    if (formContacto) {

        formContacto.addEventListener("submit", e => {

            e.preventDefault();

            const nombre =
                document
                    .getElementById("nombre-contacto")
                    .value
                    .trim();

            const correo =
                document
                    .getElementById("correo-contacto")
                    .value
                    .trim();

            const comentario =
                document
                    .getElementById("comentario")
                    .value
                    .trim();

            if (!nombre || nombre.length > 100) {

                return mostrarMensaje(
                    "Nombre obligatorio (máx. 100 caracteres)."
                );
            }

            const checkCorreo =
                validarCorreo(correo);

            if (!checkCorreo.valido) {
                return mostrarMensaje(
                    checkCorreo.msj
                );
            }

            if (
                !comentario ||
                comentario.length > 500
            ) {

                return mostrarMensaje(
                    "Comentario obligatorio (máx. 500 caracteres)."
                );
            }

            mostrarMensaje(
                "Mensaje enviado con éxito.",
                false
            );

            formContacto.reset();
        });
    }

    // ==========================================================
    // REGISTRO
    // ==========================================================
    const formRegistro =
        document.getElementById("form-registro");

    if (formRegistro) {

        formRegistro.addEventListener("submit", e => {

            e.preventDefault();

            // --------------------------------------------------
            // DATOS
            // --------------------------------------------------
            const run =
                document
                    .getElementById("run")
                    .value
                    .trim();

            const nombre =
                document
                    .getElementById("nombre")
                    .value
                    .trim();

            const correo =
                document
                    .getElementById("correo")
                    .value
                    .trim();

            const pass =
                document
                    .getElementById("password")
                    .value
                    .trim();

            const telefonoElemento =
                document.getElementById("telefono");

            const telefono =
                telefonoElemento
                    ? telefonoElemento.value.trim()
                    : "";

            const direccionElemento =
                document.getElementById("direccion");

            const direccion =
                direccionElemento
                    ? direccionElemento.value.trim()
                    : "";

            const selectRegion =
                document.getElementById(
                    "select-region"
                );

            const selectComuna =
                document.getElementById(
                    "select-comuna"
                );

            const region =
                selectRegion
                    ? selectRegion.value
                    : "";

            const comuna =
                selectComuna
                    ? selectComuna.value
                    : "";

            const checkTerminos =
                document.getElementById(
                    "check-terminos"
                );

            // --------------------------------------------------
            // VALIDACIONES
            // --------------------------------------------------
            const checkRun =
                validarRun(run);

            if (!checkRun.valido) {
                return mostrarMensaje(
                    checkRun.msj
                );
            }

            if (
                !nombre ||
                nombre.length > 50
            ) {

                return mostrarMensaje(
                    "Nombre obligatorio (máx. 50 caracteres)."
                );
            }

            const checkCorreo =
                validarCorreo(correo);

            if (!checkCorreo.valido) {
                return mostrarMensaje(
                    checkCorreo.msj
                );
            }

            const checkPassword =
                validarPassword(pass);

            if (!checkPassword.valido) {
                return mostrarMensaje(
                    checkPassword.msj
                );
            }

            if (!region) {

                return mostrarMensaje(
                    "Debes seleccionar una región."
                );
            }

            if (!comuna) {

                return mostrarMensaje(
                    "Debes seleccionar una comuna."
                );
            }

            if (
                !direccion ||
                direccion.length > 150
            ) {

                return mostrarMensaje(
                    "Debes ingresar una dirección válida (máx. 150 caracteres)."
                );
            }

            if (
                checkTerminos &&
                !checkTerminos.checked
            ) {

                return mostrarMensaje(
                    "Debes aceptar los Términos y Condiciones para continuar."
                );
            }

            // --------------------------------------------------
            // USUARIOS EXISTENTES
            // --------------------------------------------------
            const usuarios =
                getUsuariosBD();

            const existeUsuario =
                usuarios.some(u =>
                    u.run === run ||
                    u.correo.toLowerCase() ===
                    correo.toLowerCase()
                );

            if (existeUsuario) {

                return mostrarMensaje(
                    "Ya existe un usuario registrado con este RUN o correo electrónico."
                );
            }

            // --------------------------------------------------
            // CREAR USUARIO
            // --------------------------------------------------
            const nuevoUsuario = {

                run: run,
                nombre: nombre,
                correo: correo,
                password: pass,
                telefono: telefono,
                region: region,
                comuna: comuna,
                direccion: direccion,
                rol: "Cliente"

            };

            usuarios.push(nuevoUsuario);

            saveUsuariosBD(usuarios);

            // --------------------------------------------------
            // FINALIZAR REGISTRO
            // --------------------------------------------------
            mostrarMensaje(
                "Usuario registrado con éxito.",
                false
            );

            window.location.href =
                "login.html";
        });
    }

});