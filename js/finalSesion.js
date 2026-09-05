// ==========================================================================
// SEGURIDAD Y PROTECCIÓN DE RUTAS ADMIN (ADMIN / VENDEDOR)
// ==========================================================================

function verificarPermisosAcceso() {
    const sesionRaw = sessionStorage.getItem("sesionActiva");

    if (!sesionRaw) {
        alert("Acceso denegado: Debes iniciar sesión.");
        window.location.replace("login.html");
        return false;
    }

    const sesionActiva = JSON.parse(sesionRaw);
    const rol = (sesionActiva.rol || "").toLowerCase().trim();
    const paginaActual = window.location.pathname.split("/").pop().toLowerCase();

    // Permitir acceso a admin_productos tanto a Vendedor como a Administrador
    if (rol === "vendedor") {
        if (paginaActual.includes("admin_usuarios") || paginaActual.includes("admin_home")) {
            alert("Acceso restringido: El rol Vendedor solo tiene acceso a la gestión de productos.");
            window.location.replace("admin_productos.html");
            return false;
        }
    } else if (rol !== "administrador") {
        alert("Acceso denegado: Se requieren permisos de administración o vendedor.");
        window.location.replace("index.html");
        return false;
    }

    return true;
}

// 1. Validar de inmediato al cargar el script
verificarPermisosAcceso();

// 2. Proteger contra el caché del botón "Atrás" (bfcache)
window.addEventListener("pageshow", () => {
    verificarPermisosAcceso();
});

// 3. Configuración unificada de los botones de cierre de sesión
document.addEventListener("DOMContentLoaded", () => {
    const ejecutarCierreSesion = (e) => {
        e.preventDefault();
        sessionStorage.removeItem("sesionActiva");
        alert("Sesión finalizada correctamente.");
        window.location.replace("login.html");
    };

    const btn1 = document.getElementById("btn-cerrar-sesion");
    const btn2 = document.getElementById("btn-cerrar-sesion-top");

    if (btn1) btn1.addEventListener("click", ejecutarCierreSesion);
    if (btn2) btn2.addEventListener("click", ejecutarCierreSesion);
});