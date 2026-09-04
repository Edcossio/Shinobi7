// ============================================================
// FUNCIONES AUXILIARES DE VALIDACIÓN
// ============================================================

function validarCorreo(correo) {
    if (correo.length > 100) return { valido: false, msj: "El correo no debe superar los 100 caracteres." };
    const dominios = ["@duoc.cl", "@profesor.duoc.cl", "@gmail.com", "@shinobi7.cl", "@7shinobi.cl"];
    const esValido = dominios.some(d => correo.toLowerCase().endsWith(d));
    return esValido
        ? { valido: true }
        : { valido: false, msj: "Solo se permiten dominios @duoc.cl, @profesor.duoc.cl, @gmail.com o @7shinobi.cl" };
}

function validarPassword(pass) {
    return (pass.length >= 8 && pass.length <= 32)
        ? { valido: true }
        : { valido: false, msj: "La contraseña debe tener entre 8 y 32 caracteres." };
}

function validarRun(run) {
    const regexRun = /^[0-9]{6,8}[0-9kK]{1}$/;
    if (run.includes(".") || run.includes("-")) {
        return { valido: false, msj: "El RUN debe ingresarse sin puntos ni guion." };
    }
    return (regexRun.test(run) && run.length >= 7 && run.length <= 9)
        ? { valido: true }
        : { valido: false, msj: "El RUN debe tener entre 7 y 9 caracteres (ej: 19011022K)." };
}

function mostrarMensaje(msj, esError = true) {
    alert(`${esError ? '❌ ERROR: ' : '✅ ÉXITO: '}${msj}`);
}

function solicitarRecuperacion(event) {
    if (event) event.preventDefault();

    const correo = prompt("Ingresa tu correo electrónico registrado para restablecer tu contraseña:");

    if (correo !== null) {
        const correoLimpio = correo.trim();
        if (correoLimpio.length === 0) {
            return mostrarMensaje("Debes ingresar un correo electrónico.");
        }

        const check = validarCorreo(correoLimpio);
        if (check.valido) {
            mostrarMensaje(`Se han enviado las instrucciones de restablecimiento al correo: ${correoLimpio}`, false);
        } else {
            mostrarMensaje(check.msj);
        }
    }
}

// ============================================================
// MANEJO DE EVENTOS Y REGISTRO DE USUARIOS
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    const passInput = document.getElementById("password");
    const confirmInput = document.getElementById("confirm-password");
    const errorConfirm = document.getElementById("error-confirm-password");
    const formRegistro = document.getElementById("form-registro");

    // Feedback visual en tiempo real para confirmar contraseña
    if (confirmInput && passInput && errorConfirm) {
        confirmInput.addEventListener("input", () => {
            if (confirmInput.value && passInput.value !== confirmInput.value) {
                errorConfirm.textContent = "Las contraseñas no coinciden.";
                errorConfirm.classList.remove("d-none");
            } else {
                errorConfirm.classList.add("d-none");
            }
        });
    }

    // Listener para el envio del formulario
    if (formRegistro) {
        formRegistro.addEventListener("submit", (e) => {
            e.preventDefault();

            const run = document.getElementById("run")?.value.trim() || "";
            const nombre = document.getElementById("nombre")?.value.trim() || "";
            const correo = document.getElementById("correo")?.value.trim() || "";
            const pass = document.getElementById("password")?.value || "";
            const confirmPass = document.getElementById("confirm-password")?.value || "";
            const telefono = document.getElementById("telefono")?.value.trim() || "";
            const region = document.getElementById("select-region")?.value || "";
            const comuna = document.getElementById("select-comuna")?.value || "";
            const direccion = document.getElementById("direccion")?.value.trim() || "";
            const checkTerminos = document.getElementById("check-terminos")?.checked;

            // Validar RUN
            const vRun = validarRun(run);
            if (!vRun.valido) {
                mostrarMensaje(vRun.msj);
                return;
            }

            // Validar Correo
            const vCorreo = validarCorreo(correo);
            if (!vCorreo.valido) {
                mostrarMensaje(vCorreo.msj);
                return;
            }

            // Validar Contraseña
            const vPass = validarPassword(pass);
            if (!vPass.valido) {
                mostrarMensaje(vPass.msj);
                return;
            }

            // Validar Coincidencia de Contraseñas
            if (pass !== confirmPass) {
                if (errorConfirm) {
                    errorConfirm.textContent = "Las contraseñas no coinciden.";
                    errorConfirm.classList.remove("d-none");
                } else {
                    mostrarMensaje("Las contraseñas no coinciden. Por favor verifícalas.");
                }
                if (confirmInput) confirmInput.focus();
                return;
            }

            // Validar Términos
            if (!checkTerminos) {
                mostrarMensaje("Debes aceptar los Términos y Condiciones para registrarte.");
                return;
            }

            // Objeto de Usuario
            const nuevoUsuario = {
                run,
                nombre,
                correo,
                password: pass,
                telefono,
                region,
                comuna,
                direccion
            };

            // Guardar Usuario
            let usuarios = JSON.parse(localStorage.getItem("collector_usuarios")) || [];
            const existe = usuarios.some(u => u.correo && u.correo.toLowerCase() === correo.toLowerCase());

            if (existe) {
                mostrarMensaje("El correo ingresado ya se encuentra registrado.");
                return;
            }

            usuarios.push(nuevoUsuario);
            localStorage.setItem("collector_usuarios", JSON.stringify(usuarios));

            mostrarMensaje("¡Registro completado con éxito! Ahora puedes iniciar sesión.", false);
            window.location.href = "login.html";
        });
    }
});