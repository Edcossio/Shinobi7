document.addEventListener("DOMContentLoaded", () => {
    actualizarContadorCarrito();

    // 1. Obtener la lista dinámica desde LocalStorage
    const listaProductos = getProductosBD();

    // 2. Renderizar Catálogo (productos.html)
    if (document.getElementById("contenedor-productos")) {
        renderizarCatalogo(listaProductos, "contenedor-productos");
    }

    // 3. Renderizar Destacados (index.html)
    if (document.getElementById("contenedor-destacados")) {
        const destacados = listaProductos.filter(p => p.destacado);
        renderizarCatalogo(destacados, "contenedor-destacados");
    }

    // ... (Mantén el resto de tu código de Regiones y Comunas intacto debajo de esto)
    const selectRegion = document.getElementById("select-region");
    const selectComuna = document.getElementById("select-comuna");
    if (selectRegion && selectComuna) {

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
    }

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

            mostrarMensaje("Sesión iniciada correctamente.", false);
            window.location.href = "index.html";
        });
    }

    const formContacto = document.getElementById("form-contacto");
    if (formContacto) {
        formContacto.addEventListener("submit", (e) => {
            e.preventDefault();
            const nombre = document.getElementById("nombre-contacto").value.trim();
            const correo = document.getElementById("correo-contacto").value.trim();
            const comentario = document.getElementById("comentario").value.trim();

            if (!nombre || nombre.length > 100) return mostrarMensaje("Nombre obligatorio (máx 100 caracteres).");
            const checkC = validarCorreo(correo);
            if (!checkC.valido) return mostrarMensaje(checkC.msj);
            if (!comentario || comentario.length > 500) return mostrarMensaje("Comentario obligatorio (máx 500 caracteres).");

            mostrarMensaje("Mensaje enviado con éxito.", false);
            formContacto.reset();
        });
    }

    const formRegistro = document.getElementById("form-registro");
    if (formRegistro) {
        formRegistro.addEventListener("submit", (e) => {
            e.preventDefault();
            const run = document.getElementById("run").value.trim();
            const nombre = document.getElementById("nombre").value.trim();
            const correo = document.getElementById("correo").value.trim();
            const pass = document.getElementById("password").value.trim();

            const checkR = validarRun(run);
            if (!checkR.valido) return mostrarMensaje(checkR.msj);
            if (!nombre || nombre.length > 50) return mostrarMensaje("Nombre obligatorio (máx 50 caracteres).");
            const checkC = validarCorreo(correo);
            if (!checkC.valido) return mostrarMensaje(checkC.msj);
            const checkP = validarPassword(pass);
            if (!checkP.valido) return mostrarMensaje(checkP.msj);

            mostrarMensaje("Usuario registrado con éxito.", false);
            window.location.href = "login.html";
        });
    }
});