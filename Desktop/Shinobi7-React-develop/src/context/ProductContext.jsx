import { createContext, useContext, useEffect, useState } from 'react';
import { getProductosBD, saveProductosBD } from '../services/dataService';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [productos, setProductos] = useState([]);

    useEffect(() => {
        setProductos(getProductosBD());
    }, []);

    const refrescarProductos = () => {
        setProductos(getProductosBD());
    };

    const agregarProducto = (nuevoProd) => {
        let lista = getProductosBD();
        if (lista.some(p => p.id.toLowerCase() === nuevoProd.id.toLowerCase())) {
            return { success: false, message: "El código de producto ya existe." };
        }

        const productoFinal = {
            ...nuevoProd,
            precio: Number(nuevoProd.precio),
            stock: Number(nuevoProd.stock),
            stockCritico: Number(nuevoProd.stockCritico || 3),
            imagenes: nuevoProd.imagenes || ["/images/placeholder.jpg"]
        };

        lista.push(productoFinal);
        saveProductosBD(lista);
        setProductos(lista);
        return { success: true, message: "Producto agregado con éxito." };
    };

    const actualizarProducto = (id, prodEditado) => {
        let lista = getProductosBD();
        const idx = lista.findIndex(p => p.id === id);
        if (idx === -1) return { success: false, message: "Producto no encontrado." };

        lista[idx] = {
            ...lista[idx],
            ...prodEditado,
            precio: Number(prodEditado.precio),
            stock: Number(prodEditado.stock),
            stockCritico: Number(prodEditado.stockCritico || 3)
        };

        saveProductosBD(lista);
        setProductos(lista);
        return { success: true, message: "Producto actualizado con éxito." };
    };

    const eliminarProducto = (id) => {
        let lista = getProductosBD().filter(p => p.id !== id);
        saveProductosBD(lista);
        setProductos(lista);
        return { success: true, message: "Producto eliminado con éxito." };
    };

    return (
        <ProductContext.Provider value={{
            productos,
            refrescarProductos,
            agregarProducto,
            actualizarProducto,
            eliminarProducto
        }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => useContext(ProductContext);