
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '@/context/CartContext';
import { ProductProvider } from '@/context/ProductContext';
import { productosIniciales } from '@/services/dataService';

const wrapper = ({ children }) => (
    <ProductProvider>
        <CartProvider>{children}</CartProvider>
    </ProductProvider>
);

describe('CartContext - Lógica del carrito', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem(
            'collector_productos',
            JSON.stringify(productosIniciales)
        );
    });

    it('agrega un producto y calcula la cantidad total', () => {
        const { result } = renderHook(() => useCart(), { wrapper });
        let respuesta;

        act(() => {
            respuesta = result.current.agregarAlCarrito('FIG-002', 1);
        });

        expect(respuesta.success).toBe(true);
        expect(result.current.cart).toHaveLength(1);
        expect(result.current.cart[0].id).toBe('FIG-002');
        expect(result.current.totalItems).toBe(1);
        expect(localStorage.getItem('collector_carrito')).not.toBeNull();
    });

    it('rechaza un producto inexistente', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        let respuesta;
        act(() => {
            respuesta = result.current.agregarAlCarrito('NO-EXISTE', 1);
        });

        expect(respuesta.success).toBe(false);
        expect(respuesta.message).toContain('no encontrado');
    });

    it('rechaza productos sin stock', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        let respuesta;
        act(() => {
            respuesta = result.current.agregarAlCarrito('PROX-001', 1);
        });

        expect(respuesta.success).toBe(false);
        expect(respuesta.message).toContain('agotado');
    });

    it('rechaza cantidades superiores al stock', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        let respuesta;
        act(() => {
            respuesta = result.current.agregarAlCarrito('FIG-005', 5);
        });

        expect(respuesta.success).toBe(false);
        expect(respuesta.message).toContain('stock');
        expect(result.current.cart).toHaveLength(0);
    });

    it('acumula cantidades cuando se agrega el mismo producto', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.agregarAlCarrito('FIG-002', 1);
        });

        act(() => {
            result.current.agregarAlCarrito('FIG-002', 1);
        });

        expect(result.current.cart).toHaveLength(1);
        expect(result.current.cart[0].cantidad).toBe(2);
        expect(result.current.totalItems).toBe(2);
    });

    it('rechaza superar el stock al agregar más unidades a un producto existente', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.agregarAlCarrito('FIG-002', 1);
        });

        let respuesta;
        act(() => {
            respuesta = result.current.agregarAlCarrito('FIG-002', 99);
        });

        expect(respuesta.success).toBe(false);
        expect(result.current.cart[0].cantidad).toBe(1);
    });

    it('cambia la cantidad de un producto', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.agregarAlCarrito('FIG-002', 1);
        });

        act(() => {
            result.current.cambiarCantidad('FIG-002', 2);
        });

        expect(result.current.cart[0].cantidad).toBe(2);
        expect(result.current.totalItems).toBe(2);
    });

    it('limita la cantidad modificada al stock disponible', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.agregarAlCarrito('FIG-002', 1);
        });

        act(() => {
            result.current.cambiarCantidad('FIG-002', 99);
        });

        expect(result.current.cart[0].cantidad).toBe(2);
    });

    it('ignora cantidades inválidas o menores que uno', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.agregarAlCarrito('FIG-002', 1);
        });

        act(() => {
            result.current.cambiarCantidad('FIG-002', 0);
        });

        expect(result.current.cart[0].cantidad).toBe(1);

        act(() => {
            result.current.cambiarCantidad('FIG-002', 'abc');
        });

        expect(result.current.cart[0].cantidad).toBe(1);
    });

    it('elimina un producto del carrito', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.agregarAlCarrito('FIG-002', 1);
        });

        act(() => {
            result.current.eliminarDelCarrito('FIG-002');
        });

        expect(result.current.cart).toHaveLength(0);
        expect(result.current.totalItems).toBe(0);
    });

    it('vacía el carrito y reinicia el cupón', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.agregarAlCarrito('FIG-002', 1);
            result.current.aplicarCupon('DUOC10');
        });

        act(() => {
            result.current.vaciarCarrito();
        });

        expect(result.current.cart).toHaveLength(0);
        expect(result.current.totalItems).toBe(0);
        expect(result.current.cupon).toBe('');
        expect(result.current.montoDescuento).toBe(0);
        expect(result.current.total).toBe(0);
    });

    it('calcula el subtotal, IVA y total sin descuento', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.agregarAlCarrito('FIG-002', 1);
        });

        expect(result.current.subtotal).toBe(45990);
        expect(result.current.montoDescuento).toBe(0);
        expect(result.current.total).toBe(45990);
        expect(result.current.montoIva).toBe(
            Math.round(45990 - 45990 / 1.19)
        );
    });

    it('aplica un cupón válido sin distinguir mayúsculas', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.agregarAlCarrito('FIG-002', 1);
        });

        let respuesta;
        act(() => {
            respuesta = result.current.aplicarCupon('duoc10');
        });

        expect(respuesta.success).toBe(true);
        expect(result.current.cupon).toBe('DUOC10');
        expect(result.current.montoDescuento).toBe(4599);
        expect(result.current.total).toBe(41391);
    });

    it('rechaza un cupón inválido sin aplicar descuento', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        let respuesta;
        act(() => {
            respuesta = result.current.aplicarCupon('CUPONFALSO');
        });

        expect(respuesta.success).toBe(false);
        expect(result.current.cupon).toBe('');
        expect(result.current.montoDescuento).toBe(0);
    });

    it('restaura un carrito guardado en localStorage', () => {
        const carritoGuardado = [{
            id: 'FIG-002',
            nombre: 'Nendoroid Rem - Re:Zero',
            precio: 45990,
            imagen: '/images/rem_1.jpeg',
            cantidad: 2
        }];

        localStorage.setItem(
            'collector_carrito',
            JSON.stringify(carritoGuardado)
        );

        const { result } = renderHook(() => useCart(), { wrapper });

        expect(result.current.cart).toEqual(carritoGuardado);
        expect(result.current.totalItems).toBe(2);
        expect(result.current.subtotal).toBe(91980);
    });

    it('recupera un carrito vacío cuando el JSON guardado es inválido', () => {
        localStorage.setItem('collector_carrito', '{texto inválido');

        const { result } = renderHook(() => useCart(), { wrapper });

        expect(result.current.cart).toEqual([]);
        expect(result.current.totalItems).toBe(0);
    });

    it('impide procesar el pago sin iniciar sesión', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.agregarAlCarrito('FIG-002', 1);
        });

        let respuesta;
        act(() => {
            respuesta = result.current.procesarPago(null);
        });

        expect(respuesta.success).toBe(false);
        expect(respuesta.message).toContain('iniciar sesión');
        expect(result.current.cart).toHaveLength(1);
    });

    it('impide procesar el pago con el carrito vacío', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        let respuesta;
        act(() => {
            respuesta = result.current.procesarPago({
                nombre: 'Jose'
            });
        });

        expect(respuesta.success).toBe(false);
        expect(respuesta.message).toContain('vacío');
    });

    it('rechaza el pago si el stock disminuyó antes de comprar', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.agregarAlCarrito('FIG-002', 1);
        });

        const productos = JSON.parse(
            localStorage.getItem('collector_productos')
        );

        const producto = productos.find(p => p.id === 'FIG-002');
        producto.stock = 0;

        localStorage.setItem(
            'collector_productos',
            JSON.stringify(productos)
        );

        let respuesta;
        act(() => {
            respuesta = result.current.procesarPago({
                nombre: 'Jose'
            });
        });

        expect(respuesta.success).toBe(false);
        expect(respuesta.message).toContain('Stock insuficiente');
        expect(result.current.cart).toHaveLength(1);
    });

    it('procesa una compra, descuenta el stock y vacía el carrito', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.agregarAlCarrito('FIG-002', 1);
        });

        let respuesta;
        act(() => {
            respuesta = result.current.procesarPago({
                nombre: 'Jose',
                direccion: 'Av. Principal 123',
                comuna: 'Santiago'
            });
        });

        expect(respuesta.success).toBe(true);
        expect(respuesta.message).toContain('Jose');
        expect(respuesta.message).toContain('Santiago');
        expect(result.current.cart).toHaveLength(0);

        const productosGuardados = JSON.parse(
            localStorage.getItem('collector_productos')
        );

        expect(
            productosGuardados.find(p => p.id === 'FIG-002').stock
        ).toBe(1);
    });
});
