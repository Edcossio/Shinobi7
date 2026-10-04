document.addEventListener("DOMContentLoaded", () => {

    if (typeof actualizarContadorCarrito === "function") {
        actualizarContadorCarrito();
    }

    if (typeof getProductosBD === "function") {
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
    }

    const selectRegion = document.getElementById("select-region");
    const selectComuna = document.getElementById("select-comuna");

    if (selectRegion && selectComuna && typeof regionesYComunas !== "undefined") {
        selectRegion.addEventListener("change", e => {
            selectComuna.innerHTML = '<option value="">Seleccione Comuna</option>';

            const region = regionesYComunas.find(r => r.codigo === e.target.value);

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

    const formLogin = document.getElementById("form-login");

    if (formLogin) {
        formLogin.addEventListener("submit", e => {
            e.preventDefault();

            const correo = document.getElementById("correo").value.trim();
            const pass = document.getElementById("password").value.trim();

            const checkCorreo = validarCorreo(correo);
            if (!checkCorreo.valido) {
                return mostrarMensaje(checkCorreo.msj);
            }

            const checkPassword = validarPassword(pass);
            if (!checkPassword.valido) {
                return mostrarMensaje(checkPassword.msj);
            }

            const passCodificada = btoa(pass);
            const usuariosBD = getUsuariosBD();

            const usuarioValido = usuariosBD.find(u =>
                u.correo.toLowerCase() === correo.toLowerCase() &&
                (u.password === pass || u.password === passCodificada)
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

                const rol = (usuarioValido.rol || "").toLowerCase();

                if (rol === "administrador" || rol === "vendedor") {
                    window.location.replace("admin_productos.html");
                } else {
                    window.location.replace("index.html");
                }
            } else {
                mostrarMensaje("Correo o contraseña incorrectos.");
            }
        });
    }

    function obtenerSesionActiva() {
        const sesion = sessionStorage.getItem("sesionActiva");

        if (!sesion) {
            return null;
        }

        try {
            return JSON.parse(sesion);
        } catch (error) {
            sessionStorage.removeItem("sesionActiva");
            return null;
        }
    }

    function actualizarNavbarSesion() {
        const usuario = obtenerSesionActiva();
        const navLinks = document.querySelector(".nav-links");

        if (!navLinks || !usuario) {
            return;
        }

        const rol = (usuario.rol || "").toLowerCase();
        let adminLinkHTML = "";

        if (rol === "administrador") {
            adminLinkHTML = `
                <li class="d-flex align-items-center me-2">
                    <a href="admin_home.html" class="nav-btn-brutal admin">
                        PANEL ADMIN
                    </a>
                </li>
            `;
        } else if (rol === "vendedor") {
            adminLinkHTML = `
                <li class="d-flex align-items-center me-2">
                    <a href="admin_productos.html" class="nav-btn-brutal">
                        GESTIÓN PRODUCTOS
                    </a>
                </li>
            `;
        }

        const enlaceLogin = Array.from(
            navLinks.querySelectorAll("a")
        ).find(a => {
            const texto = (a.textContent || "").trim().toUpperCase();
            const href = (a.getAttribute("href") || "").toLowerCase();

            return (
                texto.includes("INICIAR SESIÓN") ||
                href.includes("login.html")
            );
        });

        if (!enlaceLogin) {
            return;
        }

        const itemLogin = enlaceLogin.closest("li") || enlaceLogin;

        itemLogin.outerHTML = `
            ${adminLinkHTML}
            <li class="d-flex align-items-center me-2">
                <a href="#" id="btn-logout-nav" class="nav-item text-danger fw-bold ms-2">
                    CERRAR SESIÓN (${usuario.nombre || "Usuario"})
                </a>
            </li>
        `;

        const btnLogout = document.getElementById("btn-logout-nav");

        if (btnLogout) {
            btnLogout.addEventListener("click", e => {
                e.preventDefault();

                sessionStorage.removeItem("sesionActiva");

                alert("Has cerrado sesión exitosamente.");

                window.location.replace("index.html");
            });
        }
    }

    actualizarNavbarSesion();

    const formContacto = document.getElementById("form-contacto");

    if (formContacto) {
        formContacto.addEventListener("submit", e => {
            e.preventDefault();

            mostrarMensaje("Mensaje enviado con éxito.", false);

            formContacto.reset();
        });
    }
});