// ==========================================================================
// BASE DE DATOS Y PERSISTENCIA LOCAL (js/data.js)
// ==========================================================================

const productosIniciales = [
    {
        id: "FIG-001",
        nombre: "Reshiram Collector Edition",
        marca: "Good Smile Company",
        precio: 189990,
        categoria: "Pokemon",
        imagenes: [
            "images/reshiram_1.webp",
            "images/reshiram_2.webp",
            "images/reshiram_3.webp",
            "images/reshiram_4.webp"
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
            "images/rem_1.jpeg",
            "images/rem_2.png",
            "images/rem_3.png",
            "images/rem_accesories.png"
        ],
        destacado: true,
        stock: 2,
        stockCritico: 3,
        descripcion: "Figura articulada con rostros intercambiables y accesorios oficiales."
    },
    {
        id: "FIG-003",
        nombre: "Emilia 1/7 Scale Figure",
        marca: "Kadokawa",
        precio: 145000,
        categoria: "Anime",
        imagenes: [
            "images/emilia_1.webp",
            "images/emilia_2.webp"
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
            "images/satoru_1.jpg",
            "images/satoru_2.jpg",
            "images/satoru_3.jpg"
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
            "images/tanjiro_1.jpg",
            "images/tanjiro_2.jpg",
            "images/tanjiro_3.jpg"
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
            "images/miku_1.jpg",
            "images/miku_2.webp",
            "images/miku_3.jpg"
        ],
        destacado: false,
        stock: 6,
        stockCritico: 2,
        descripcion: "Edición especial a escala con vestido formal y acabados de alta calidad."
    }
];

const usuariosIniciales = [
    {
        run: "111111111",
        nombre: "Jose Pizarro",
        correo: "jose@shinobi7.cl",
        rol: "Administrador",
        password: btoa("admin1234") // <-- Con btoa
    },
    {
        run: "184567890",
        nombre: "Camila Soto",
        correo: "camila@gmail.com",
        rol: "Vendedor",
        password: btoa("password123") // <-- Con btoa
    }
];

const regionesYComunas = [
    { region: "Región Metropolitana", codigo: "RM", comunas: ["Santiago", "Providencia", "Maipú", "Las Condes", "Puente Alto"] },
    { region: "Región de Valparaíso", codigo: "VS", comunas: ["Viña del Mar", "Valparaíso", "Quilpué", "Concón", "Villa Alemana"] },
    { region: "Región de La Araucanía", codigo: "AR", comunas: ["Temuco", "Padre Las Casas", "Villarrica", "Pucón"] }
];

// Obtener o inicializar Productos en LocalStorage
function getProductosBD() {
    const data = localStorage.getItem("collector_productos");
    if (!data) {
        localStorage.setItem("collector_productos", JSON.stringify(productosIniciales));
        return productosIniciales;
    }
    return JSON.parse(data);
}

function saveProductosBD(lista) {
    localStorage.setItem("collector_productos", JSON.stringify(lista));
}

// Obtener o inicializar Usuarios en LocalStorage
function getUsuariosBD() {
    const data = localStorage.getItem("collector_usuarios");
    if (!data) {
        localStorage.setItem("collector_usuarios", JSON.stringify(usuariosIniciales));
        return usuariosIniciales;
    }
    return JSON.parse(data);
}

function saveUsuariosBD(lista) {
    localStorage.setItem("collector_usuarios", JSON.stringify(lista));
}