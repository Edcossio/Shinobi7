import React, { createContext, useContext, useState, useEffect } from 'react';
import { CUPONES_VALIDOS, getProductosBD, saveProductosBD } from '../services/dataService';
import { useProducts } from './ProductContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [cupon, setCupon] = useState("");
    const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0);
    const { refrescarProductos } = useProducts();

    useEffect(() => {
        const cartSaved = localStorage.getItem("collector_carrito");
        if (cartSaved) {
            try { setCart(JSON.parse(cartSaved)); } catch { setCart([]); }
        }
    }, []);

    const guardarCarrito = (nuevoCarrito) => {
        setCart(nuevoCarrito);
        localStorage.setItem("collector_carrito", JSON.stringify(nuevoCarrito));
    };

    const agregarAlCarrito = (productoId, cantidadDeseada = 1) => {
        const productosBD = getProductosBD();
        const prod = productosBD.find(p => p.id === productoId);

        if (!prod) return { success: false, message: "Producto no encontrado." };
        if (prod.stock <= 0) return { success: false, message: "¡Producto agotado!" };

        const itemExistente = cart.find(i => i.id === productoId);
        const cantActual = itemExistente ? itemExistente.cantidad : 0;
        const nuevaCant = cantActual + cantidadDeseada;

        if (nuevaCant > prod.stock) {
            return { success: false, message: `No puedes superar el stock disponible (${prod.stock} unidades).` };
        }

        let nuevoCart = [...cart];
        if (itemExistente) {
            nuevoCart = nuevoCart.map(i => i.id === productoId ? { ...i, cantidad: nuevaCant } : i);
        } else {
            nuevoCart.push({
                id: prod.id,
                nombre: prod.nombre,
                precio: prod.precio,
                imagen: Array.isArray(prod.imagenes) ? prod.imagenes[0] : (prod.imagen || '/images/placeholder.jpg'),
                cantidad: nuevaCant
            });
        }

        guardarCarrito(nuevoCart);
        return { success: true, message: `Se agregaron ${cantidadDeseada} unidad(es) de "${prod.nombre}" al carrito.` };
    };

    const cambiarCantidad = (productoId, nuevaCant) => {
        const cant = parseInt(nuevaCant);
        if (isNaN(cant) || cant < 1) return;

        const productosBD = getProductosBD();
        const prod = productosBD.find(p => p.id === productoId);

        let finalCant = cant;
        if (prod && cant > prod.stock) {
            finalCant = prod.stock;
        }

        const nuevoCart = cart.map(i => i.id === productoId ? { ...i, cantidad: finalCant } : i);
        guardarCarrito(nuevoCart);
    };

    const eliminarDelCarrito = (productoId) => {
        const nuevoCart = cart.filter(i => i.id !== productoId);
        guardarCarrito(nuevoCart);
    };

    const vaciarCarrito = () => {
        guardarCarrito([]);
        setCupon("");
        setDescuentoPorcentaje(0);
    };

    const aplicarCupon = (codigo) => {
        const codUpper = (codigo || "").trim().toUpperCase();
        if (CUPONES_VALIDOS[codUpper]) {
            setCupon(codUpper);
            setDescuentoPorcentaje(CUPONES_VALIDOS[codUpper]);
            return { success: true, message: `¡Cupón "${codUpper}" aplicado (${CUPONES_VALIDOS[codUpper] * 100}% Dcto)!` };
        }
        return { success: false, message: "Código de cupón no válido. Prueba con DUOC10, SHINOBI20 o VAULT15." };
    };

    // --- CÁLCULO DE TOTALES ---
    const subtotal = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const montoDescuento = Math.round(subtotal * descuentoPorcentaje);
    const total = subtotal - montoDescuento;
    const montoIva = Math.round(total - (total / 1.19));

    const procesarPago = (usuarioSesion) => {
        if (!usuarioSesion) return { success: false, message: "Debes iniciar sesión para procesar la compra." };
        if (cart.length === 0) return { success: false, message: "El carrito está vacío." };

        let productosBD = getProductosBD();
        for (let item of cart) {
            const prod = productosBD.find(p => p.id === item.id);
            if (!prod || prod.stock < item.cantidad) {
                return { success: false, message: `Stock insuficiente de "${item.nombre}".` };
            }
        }

        // Descontar inventario
        cart.forEach(item => {
            const prod = productosBD.find(p => p.id === item.id);
            if (prod) prod.stock -= item.cantidad;
        });

        saveProductosBD(productosBD);
        refrescarProductos();
        vaciarCarrito();

        const direccionEnvio = usuarioSesion.direccion ? `${usuarioSesion.direccion}, ${usuarioSesion.comuna || ''}` : "su dirección registrada";
        return { success: true, message: `¡Gracias por tu compra, ${usuarioSesion.nombre}! Tu pedido será despachado a: ${direccionEnvio}.` };
    };

    return (
        <CartContext.Provider value={{
            cart,
            totalItems: cart.reduce((acc, i) => acc + i.cantidad, 0),
            subtotal,
            montoDescuento,
            montoIva,
            total,
            cupon,
            agregarAlCarrito,
            cambiarCantidad,
            eliminarDelCarrito,
            vaciarCarrito,
            aplicarCupon,
            procesarPago
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);