// ==========================================================================
// SEGURIDAD Y PROTECCIÓN DE RUTAS ADMIN & POS (ADMIN / VENDEDOR)
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

    // Vendedor solo tiene acceso a Gestión de Productos y POS
    if (rol === "vendedor") {
        if (paginaActual.includes("admin_usuarios") || paginaActual.includes("admin_home")) {
            alert("Acceso restringido: El rol Vendedor solo tiene acceso a la gestión de productos y al Punto de Venta (POS).");
            window.location.replace("pos.html");
            return false;
        }
    } else if (rol !== "administrador") {
        alert("Acceso denegado: Se requieren permisos de administración o vendedor.");
        window.location.replace("index.html");
        return false;
    }

    return true;
}

verificarPermisosAcceso();

window.addEventListener("pageshow", () => {
    verificarPermisosAcceso();
});

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