function validarCorreo(correo) {
    if (correo.length > 100) return { valido: false, msj: "El correo no debe superar los 100 caracteres." };
    const dominios = ["@shinobi7.cl", "@gmail.com"];
    const esValido = dominios.some(d => correo.toLowerCase().endsWith(d));
    return esValido
        ? { valido: true }
        : { valido: false, msj: "Solo se permiten dominios @shinobi7.cl o @gmail.com" };
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
    alert(`${esError ? ' ERROR: ' : ' ÉXITO: '}${msj}`);
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