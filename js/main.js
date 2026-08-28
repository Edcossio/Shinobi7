document.addEventListener("DOMContentLoaded", () => {
    // 1. Actualizar contador del carrito
    if (typeof actualizarContadorCarrito === "function") {
        actualizarContadorCarrito();
    }

    const listaProductos = getProductosBD();

    // 2. Renderizar Catálogo Completo (productos.html)
    if (document.getElementById("contenedor-productos")) {
        renderizarCatalogo(listaProductos, "contenedor-productos");
    }

    // 3. Renderizar Destacados (index.html)
    if (document.getElementById("contenedor-destacados")) {
        const destacados = listaProductos.filter(p => p.destacado);
        renderizarCatalogo(destacados, "contenedor-destacados");
    }

    // 4. Renderizar Detalle de Producto (detalle.html)
    if (document.getElementById("contenedor-detalle-producto")) {
        cargarDetalleProducto();
    }

    // 5. Selector Dinámico de Regiones y Comunas (registro.html)
    const selectRegion = document.getElementById("select-region");
    const selectComuna = document.getElementById("select-comuna");
    if (selectRegion && selectComuna) {
        selectRegion.addEventListener("change", (e) => {
            selectComuna.innerHTML = '<option value="">Seleccione Comuna</option>';
            const reg = regionesYComunas.find(r => r.codigo === e.target.value);
            if (reg) {
                reg.comunas.forEach(c => {
                    const opt = document.createElement("option");
                    opt.value = c;
                    opt.textContent = c;
                    selectComuna.appendChild(opt);
                });
            }
        });
    }

    // 6. Listener Formulario Login
    const formLogin = document.getElementById("form-login");
    if (formLogin) {
        formLogin.addEventListener("submit", (e) => {
            e.preventDefault();
            const correo = document.getElementById("correo").value.trim();
            const pass = document.getElementById("password").value.trim();

            const checkC = validarCorreo(correo);
            if (!checkC.valido) return mostrarMensaje(checkC.msj);

            const checkP = validarPassword(pass);
            if (!checkP.valido) return mostrarMensaje(checkP.msj);

            // Buscar usuario que coincida en correo Y contraseña
            const passCodificada = btoa(pass);

            const usuariosBD = getUsuariosBD();
            const usuarioValido = usuariosBD.find(u =>
                u.correo.toLowerCase() === correo.toLowerCase() && u.password === passCodificada
            );

            if (usuarioValido) {
                sessionStorage.setItem("sesionActiva", JSON.stringify(usuarioValido));
                mostrarMensaje(`¡Bienvenido/a de vuelta, ${usuarioValido.nombre}!`, false);

                // Redirección segura reemplazando el historial
                if (usuarioValido.rol === "Administrador") {
                    window.location.replace("admin_home.html");[cite, 8]
                } else {
                    window.location.replace("index.html");[cite, 8]
                }
            } else {
                mostrarMensaje("Correo o contraseña incorrectos.");
            }
        });
    }

    // --- NUEVO: Control Dinámico del Navbar ---
    function actualizarInterfazSesion() {
        const sesionActiva = JSON.parse(sessionStorage.getItem("sesionActiva"));
        const navLinks = document.querySelector(".nav-links");

        if (sesionActiva && navLinks) {
            // Si el usuario es Administrador, agregamos un acceso directo al panel en la barra pública
            if (sesionActiva.rol === "Administrador" && !document.getElementById("link-panel-admin")) {
                const liAdmin = document.createElement("li");
                liAdmin.innerHTML = `<a href="admin_home.html" id="link-panel-admin" class="nav-item fw-bold text-danger" style="background: #ffebee; border-radius: 4px; padding: 5px 10px;">ADMIN</a>`;
                navLinks.insertBefore(liAdmin, navLinks.firstChild);
            }

            // Cambiar "INICIAR SESIÓN" por "CERRAR SESIÓN"
            const enlacesNav = document.querySelectorAll(".nav-item");
            enlacesNav.forEach(el => {
                if (el.textContent.includes("INICIAR SESIÓN")) {
                    el.textContent = "CERRAR SESIÓN"; // <-- Texto limpio sin el nombre
                    el.href = "#";
                    el.classList.add("text-danger");

                    el.addEventListener("click", (e) => {
                        e.preventDefault();
                        sessionStorage.removeItem("sesionActiva");
                        window.location.replace("index.html");[cite, 8]
                    });
                }
            });
        }
    }

    // Ejecutar al cargar cualquier página
    actualizarInterfazSesion();

    // 7. Listener Formulario Contacto
    const formContacto = document.getElementById("form-contacto");
    if (formContacto) {
        formContacto.addEventListener("submit", (e) => {
            e.preventDefault();
            const nombre = document.getElementById("nombre-contacto").value.trim();
            const correo = document.getElementById("correo-contacto").value.trim();
            const comentario = document.getElementById("comentario").value.trim();

            if (!nombre || nombre.length > 100) return mostrarMensaje("Nombre obligatorio (máx. 100 caracteres).");
            const checkC = validarCorreo(correo);
            if (!checkC.valido) return mostrarMensaje(checkC.msj);
            if (!comentario || comentario.length > 500) return mostrarMensaje("Comentario obligatorio (máx. 500 caracteres).");

            mostrarMensaje("Mensaje enviado con éxito.", false);
            formContacto.reset();
        });
    }

    // 8. Listener Formulario Registro (Blindado contra duplicados y con contraseña codificada)
    const formRegistro = document.getElementById("form-registro");
    if (formRegistro) {
        formRegistro.addEventListener("submit", (e) => {
            e.preventDefault();
            const run = document.getElementById("run").value.trim();
            const nombre = document.getElementById("nombre").value.trim();
            const correo = document.getElementById("correo").value.trim();
            const pass = document.getElementById("password").value.trim();
            const checkTerminos = document.getElementById("check-terminos");

            const checkR = validarRun(run);
            if (!checkR.valido) return mostrarMensaje(checkR.msj);
            if (!nombre || nombre.length > 50) return mostrarMensaje("Nombre obligatorio (máx. 50 caracteres).");

            const checkC = validarCorreo(correo);
            if (!checkC.valido) return mostrarMensaje(checkC.msj);

            const checkP = validarPassword(pass);
            if (!checkP.valido) return mostrarMensaje(checkP.msj);

            if (checkTerminos && !checkTerminos.checked) {
                return mostrarMensaje("Debes aceptar los Términos y Condiciones para continuar.");
            }

            const usuarios = getUsuariosBD();

            // Validar que el RUN o el Correo no existan previamente
            const existeUsuario = usuarios.some(u => u.run === run || u.correo.toLowerCase() === correo.toLowerCase());
            if (existeUsuario) {
                return mostrarMensaje("Ya existe un usuario registrado con este RUN o correo electrónico.");
            }

            // Codificar la contraseña en Base64 visualmente
            const passwordCodificada = btoa(pass);

            // Guardar usuario único con la contraseña codificada
            usuarios.push({ run, nombre, correo, password: passwordCodificada, rol: "Cliente" });
            saveUsuariosBD(usuarios);
            mostrarMensaje("Usuario registrado con éxito.", false);
            window.location.replace("login.html");[cite, 8]
        });
    }
});