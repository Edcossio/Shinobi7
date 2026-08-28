// ==========================================================================
// SEGURIDAD Y PROTECCIÓN DE RUTAS ADMIN (js/seguridad.js)
// ==========================================================================

function verificarPermisosAdmin() {
    const sesionActiva = JSON.parse(sessionStorage.getItem("sesionActiva"));

    if (!sesionActiva || sesionActiva.rol !== "Administrador") {
        alert("Acceso denegado: No tienes permisos para acceder a esta página.");
        sessionStorage.removeItem("sesionActiva");
        window.location.replace("login.html");
        return false;
    }
    return true;
}

// 1. Validar de inmediato al cargar el script
verificarPermisosAdmin();

// 2. Proteger obligatoriamente contra el caché del botón "Atrás" (bfcache)
// Nota: NO va dentro de ningún "if", siempre debe escuchar al navegador
window.addEventListener("pageshow", (event) => {
    verificarPermisosAdmin();
});

// 3. Configurar los botones de cierre de sesión cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    const cerrarSesion = (e) => {
        e.preventDefault();
        sessionStorage.removeItem("sesionActiva");
        window.location.replace("login.html");
    };

    const btn1 = document.getElementById("btn-cerrar-sesion");
    const btn2 = document.getElementById("btn-cerrar-sesion-top");

    if (btn1) btn1.addEventListener("click", cerrarSesion);
    if (btn2) btn2.addEventListener("click", cerrarSesion);
});