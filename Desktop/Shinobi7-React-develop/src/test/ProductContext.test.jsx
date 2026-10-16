import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ProductProvider, useProducts } from '@/context/ProductContext';
import { productosIniciales } from '@/services/dataService';

const wrapper = ({ children }) => <ProductProvider>{children}</ProductProvider>;

describe('ProductContext - CRUD de productos', () => {

    beforeEach(() => {
        // Sembramos productos iniciales para tener una base conocida
        localStorage.setItem('collector_productos', JSON.stringify(productosIniciales));
    });

    it('debería agregar un producto nuevo al inventario', () => {
        const { result } = renderHook(() => useProducts(), { wrapper });

        const cantidadInicial = result.current.productos.length;

        let res;
        act(() => {
            res = result.current.agregarProducto({
                id: 'TEST-001',
                nombre: 'Producto de Prueba',
                precio: 19990,
                stock: 5,
                stockCritico: 2
            });
        });

        expect(res.success).toBe(true);
        expect(result.current.productos.length).toBe(cantidadInicial + 1);
        expect(result.current.productos.some(p => p.id === 'TEST-001')).toBe(true);
    });

    it('NO debería agregar un producto con ID duplicado', () => {
        const { result } = renderHook(() => useProducts(), { wrapper });

        let res;
        act(() => {
            res = result.current.agregarProducto({
                id: 'FIG-002', // ya existe en productosIniciales
                nombre: 'Duplicado',
                precio: 999,
                stock: 1
            });
        });

        expect(res.success).toBe(false);
        expect(res.message).toContain('ya existe');
    });

    it('debería actualizar un producto existente', () => {
        const { result } = renderHook(() => useProducts(), { wrapper });

        let res;
        act(() => {
            res = result.current.actualizarProducto('FIG-002', {
                nombre: 'Rem Edición Especial',
                precio: 55555,
                stock: 10
            });
        });

        expect(res.success).toBe(true);

        const actualizado = result.current.productos.find(p => p.id === 'FIG-002');
        expect(actualizado.nombre).toBe('Rem Edición Especial');
        expect(actualizado.precio).toBe(55555);
        expect(actualizado.stock).toBe(10);
    });

    it('debería eliminar un producto por su ID', () => {
        const { result } = renderHook(() => useProducts(), { wrapper });

        const cantidadInicial = result.current.productos.length;

        let res;
        act(() => {
            res = result.current.eliminarProducto('FIG-002');
        });

        expect(res.success).toBe(true);
        expect(result.current.productos.length).toBe(cantidadInicial - 1);
        expect(result.current.productos.some(p => p.id === 'FIG-002')).toBe(false);
    });
});