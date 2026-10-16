// ==========================================================================
// BASE DE DATOS Y SERVICIOS DE PERSISTENCIA (src/services/dataService.js)
// ==========================================================================

export const productosIniciales = [
    {
        id: "PROX-001",
        nombre: "Kite - Crazy Slots #2",
        precio: 52990,
        categoria: "HUNTER X HUNTER",
        fabricante: "Pop Up Parade",
        stock: 0,
        esProximo: true,
        llegada: "Octubre - Diciembre 2026",
        imagenes: ["/images/kite_1.jpg"],
        descripcion: "Espectacular figura detallada de Kite empuñando la guadaña de su habilidad Crazy Slots. Edición limitada de alta precisión."
    },
    {
        id: "PROX-002",
        nombre: "Nendoroid -Shigeo Kageyama (Mob)",
        precio: 48990,
        categoria: "MOB PSYCHO 100",
        fabricante: "Nendoroid",
        stock: 0,
        esProximo: true,
        llegada: "Enero - Marzo 2027",
        imagenes: ["/images/mob_1.jpg"],
        descripcion: "Figura articulada con rostros intercambiables y efectos de energía psíquica. Incluye base de soporte y accesorios exclusivos."
    },
    {
        id: "PROX-003",
        nombre: "Naruto Uzumaki - Battle Ver.",
        precio: 39990,
        categoria: "NARUTO SHIPPUDEN",
        fabricante: "Vibration Stars",
        stock: 0,
        esProximo: true,
        llegada: "Octubre 2026",
        imagenes: ["/images/naruto_1.jpg"],
        descripcion: "Dinámica postura de combate con kunai en mano. Pintura de sombreado especial inspirado en el manga original."
    },
    {
        id: "FIG-001",
        nombre: "Reshiram - Collector Edition",
        marca: "Good Smile Company",
        precio: 189990,
        categoria: "Pokemon",
        imagenes: [
            "/images/reshiram_1.webp",
            "/images/reshiram_2.webp",
            "/images/reshiram_3.webp",
            "/images/reshiram_4.webp"
        ],
        destacado: true,
        stock: 5,
        stockCritico: 3,
        descripcion: "Figura estática de edición limitada en PVC con detalles translúcidos elementales."
    },
    {
        id: "FIG-002",
        nombre: "Nendoroid Rem - Re:Zero",
        marca: "Good Smile Company",
        precio: 45990,
        categoria: "Anime",
        imagenes: [
            "/images/rem_1.jpeg",
            "/images/rem_2.png",
            "/images/rem_3.png",
            "/images/rem_accesories.png"
        ],
        destacado: true,
        stock: 2,
        stockCritico: 3,
        descripcion: "Figura articulada con rostros intercambiables y accesorios oficiales."
    },
    {
        id: "FIG-003",
        nombre: "Emilia 1/7 - Scale Figure",
        marca: "Kadokawa",
        precio: 145000,
        categoria: "Anime",
        imagenes: [
            "/images/emilia_1.webp",
            "/images/emilia_2.webp"
        ],
        destacado: false,
        stock: 8,
        stockCritico: 3,
        descripcion: "Estatua detallada a escala 1/7 en fino PVC con base acrílica."
    },
    {
        id: "FIG-004",
        nombre: "Satoru Gojo - Jujutsu Kaisen",
        marca: "Max Factory",
        precio: 68990,
        categoria: "Anime",
        imagenes: [
            "/images/satoru_1.jpg",
            "/images/satoru_2.jpg",
            "/images/satoru_3.jpg"
        ],
        destacado: true,
        stock: 4,
        stockCritico: 2,
        descripcion: "Figura articulada que permite recrear poses de expansión de dominio."
    },
    {
        id: "FIG-005",
        nombre: "Tanjiro Kamado Hinokami Kagura",
        marca: "Aniplex",
        precio: 129990,
        categoria: "Anime",
        imagenes: [
            "/images/tanjiro_1.jpg",
            "/images/tanjiro_2.jpg",
            "/images/tanjiro_3.jpg"
        ],
        destacado: true,
        stock: 1,
        stockCritico: 3,
        descripcion: "Estatua con efectos de fuego dinámicos y postura de combate."
    },
    {
        id: "FIG-006",
        nombre: "Hatsune Miku Symphony",
        marca: "Good Smile Company",
        precio: 159990,
        categoria: "Vocaloid",
        imagenes: [
            "/images/miku_1.jpg",
            "/images/miku_2.webp",
            "/images/miku_3.jpg"
        ],
        destacado: false,
        stock: 6,
        stockCritico: 2,
        descripcion: "Edición especial a escala con vestido formal y acabados de alta calidad."
    }
];

export const usuariosIniciales = [
    {
        run: "111111111",
        nombre: "Jose Pizarro",
        correo: "jose@shinobi7.cl",
        rol: "Administrador",
        password: btoa("admin1234")
    },
    {
        run: "184567890",
        nombre: "Camila Soto",
        correo: "camila@gmail.com",
        rol: "Vendedor",
        password: btoa("password123")
    }
];

export const regionesYComunas = [
    { region: "Región Metropolitana", codigo: "RM", comunas: ["Santiago", "Providencia", "Maipú", "Las Condes", "Puente Alto"] },
    { region: "Región de Valparaíso", codigo: "VS", comunas: ["Viña del Mar", "Valparaíso", "Quilpué", "Concón", "Villa Alemana"] },
    { region: "Región de La Araucanía", codigo: "AR", comunas: ["Temuco", "Padre Las Casas", "Villarrica", "Pucón"] }
];

export const CUPONES_VALIDOS = {
    "DUOC10": 0.10,
    "SHINOBI20": 0.20,
    "VAULT15": 0.15
};

// --- PRODUCTOS ---
export function getProductosBD() {
    const data = localStorage.getItem("collector_productos");
    if (!data) {
        localStorage.setItem("collector_productos", JSON.stringify(productosIniciales));
        return productosIniciales;
    }
    return JSON.parse(data);
}

export function saveProductosBD(lista) {
    localStorage.setItem("collector_productos", JSON.stringify(lista));
}

// --- USUARIOS ---
export function getUsuariosBD() {
    const data = localStorage.getItem("collector_usuarios");
    if (!data) {
        localStorage.setItem("collector_usuarios", JSON.stringify(usuariosIniciales));
        return usuariosIniciales;
    }
    return JSON.parse(data);
}

export function saveUsuariosBD(lista) {
    localStorage.setItem("collector_usuarios", JSON.stringify(lista));
}

// --- VALIDACIONES ---
export function validarCorreo(correo) {
    if (!correo || correo.length > 100) return { valido: false, msj: "El correo no debe superar los 100 caracteres." };
    const dominios = ["@duoc.cl", "@gmail.com", "@shinobi7.cl", "@7shinobi.cl"];
    const esValido = dominios.some(d => correo.toLowerCase().endsWith(d));
    return esValido
        ? { valido: true }
        : { valido: false, msj: "Solo se permiten dominios @duoc.cl, @gmail.com, @shinobi7.cl o @7shinobi.cl" };
}

export function validarPassword(pass) {
    return (pass && pass.length >= 8 && pass.length <= 32)
        ? { valido: true }
        : { valido: false, msj: "La contraseña debe tener entre 8 y 32 caracteres." };
}

export function validarRun(run) {
    const regexRun = /^[0-9]{6,8}[0-9kK]{1}$/;
    if (!run || run.includes(".") || run.includes("-")) {
        return { valido: false, msj: "El RUN debe ingresarse sin puntos ni guion." };
    }
    return (regexRun.test(run) && run.length >= 7 && run.length <= 9)
        ? { valido: true }
        : { valido: false, msj: "El RUN debe tener entre 7 y 9 caracteres (ej: 19011022K)." };
}

export function validarClaveSupervisorBD(clave) {
    if (!clave || clave.trim().length === 0) {
        return { valido: false, msj: "Por favor ingresa la contraseña de supervisor." };
    }

    const usuarios = getUsuariosBD();
    const passCodificada = btoa(clave.trim());

    const adminValido = usuarios.find(u =>
        (u.rol || "").toLowerCase() === "administrador" &&
        (u.password === clave.trim() || u.password === passCodificada)
    );

    if (!adminValido) {
        return { valido: false, msj: "Contraseña de Administrador/Supervisor incorrecta." };
    }

    return { valido: true, admin: adminValido };

}

// --- POS: TURNOS, BOLETAS Y AUDITORÍA ---
export function getTurnoActivoBD() {
    const data = localStorage.getItem("collector_pos_turno_activo");
    return data ? JSON.parse(data) : null;
}

export function saveTurnoActivoBD(turno) {
    if (turno) {
        localStorage.setItem("collector_pos_turno_activo", JSON.stringify(turno));
    } else {
        localStorage.removeItem("collector_pos_turno_activo");
    }
}

export function getBoletasBD() {
    const data = localStorage.getItem("collector_boletas");
    return data ? JSON.parse(data) : [];
}

export function saveBoletasBD(boletas) {
    localStorage.setItem("collector_boletas", JSON.stringify(boletas));
}

export function registrarLogAuditoriaBD(accion, detalle, correoUsuario) {
    const logs = JSON.parse(localStorage.getItem("collector_audit_logs") || "[]");
    logs.push({
        id: "LOG-" + Date.now(),
        accion,
        detalle,
        usuarioCorreo: correoUsuario || "ANONIMO",
        fechaHora: new Date().toISOString()
    });
    localStorage.setItem("collector_audit_logs", JSON.stringify(logs));
}