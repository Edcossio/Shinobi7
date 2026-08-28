// ==========================================================================
// BASE DE DATOS Y PERSISTENCIA LOCAL (js/data.js)
// ==========================================================================

const productosIniciales = [
    {
        id: "FIG-001",
        nombre: "Zekrom & Reshiram Edition",
        marca: "Good Smile Company",
        precio: 189990,
        categoria: "Pokemon",
        imagen: "https://via.placeholder.com/300x300?text=Zekrom+Reshiram",
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
        imagen: "https://via.placeholder.com/300x300?text=Rem+Nendoroid",
        destacado: true,
        stock: 2,
        stockCritico: 3,
        descripcion: "Figura articulada con rostros intercambiables."
    },
    {
        id: "FIG-003",
        nombre: "Emilia 1/7 Scale Figure",
        marca: "Kadokawa",
        precio: 145000,
        categoria: "Anime",
        imagen: "https://via.placeholder.com/300x300?text=Emilia+Scale",
        destacado: false,
        stock: 8,
        stockCritico: 3,
        descripcion: "Estatua detallada a escala 1/7."
    }
];

const usuariosIniciales = [
    {
        run: "111111111",
        nombre: "Jose Pizarro",
        correo: "jose@shinobi7.cl",
        rol: "Administrador",
        password: "admin1234" // Contraseña para el admin
    },
    {
        run: "184567890",
        nombre: "Camila Soto",
        correo: "camila@gmail.com",
        rol: "Vendedor",
        password: "password123" // Contraseña para el vendedor
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