
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from '@/components/molecules/ProductCard';
import { CartProvider } from '@/context/CartContext';
import { ProductProvider } from '@/context/ProductContext';
import { productosIniciales } from '@/services/dataService';

const productoMock = productosIniciales.find(p => p.id === 'FIG-002');

const renderConProviders = (producto) =>
    render(
        <MemoryRouter>
            <ProductProvider>
                <CartProvider>
                    <ProductCard producto={producto} />
                </CartProvider>
            </ProductProvider>
        </MemoryRouter>
    );

describe('ProductCard - Renderizado y eventos', () => {
    beforeEach(() => {
        localStorage.setItem(
            'collector_productos',
            JSON.stringify(productosIniciales)
        );
        localStorage.removeItem('collector_carrito');
        vi.clearAllMocks();
    });

    it('renderiza nombre, precio, categoría y marca', () => {
        renderConProviders(productoMock);

        expect(screen.getByText(productoMock.nombre)).toBeInTheDocument();
        expect(screen.getByText(/\$45\.990/)).toBeInTheDocument();
        expect(screen.getByText(productoMock.categoria)).toBeInTheDocument();
        expect(screen.getByText(productoMock.marca)).toBeInTheDocument();
    });

    it('muestra el aviso de últimas unidades cuando el stock es crítico', () => {
        const producto = {
            ...productoMock,
            stock: 2,
            stockCritico: 3
        };

        const { container } = renderConProviders(producto);
        const badge = container.querySelector('.badge.position-absolute');

        expect(badge.textContent).toContain('DISPONIBLES');
        expect(badge.className).toContain('bg-danger');
    });

    it('muestra el aviso de disponibilidad cuando el stock no es crítico', () => {
        const producto = {
            ...productoMock,
            stock: 8,
            stockCritico: 3
        };

        const { container } = renderConProviders(producto);
        const badge = container.querySelector('.badge.position-absolute');

        expect(badge.textContent).toContain('DISPONIBLE');
        expect(badge.className).toContain('bg-warning');
    });

    it('utiliza el valor predeterminado del stock crítico cuando no está definido', () => {
        const producto = {
            ...productoMock,
            stock: 3,
            stockCritico: undefined
        };

        const { container } = renderConProviders(producto);
        const badge = container.querySelector('.badge.position-absolute');

        expect(badge.className).toContain('bg-danger');
    });

    it('utiliza la primera imagen del arreglo de imágenes', () => {
        const producto = {
            ...productoMock,
            imagenes: ['/images/primera.jpg', '/images/segunda.jpg']
        };

        renderConProviders(producto);

        expect(screen.getByRole('img', {
            name: producto.nombre
        })).toHaveAttribute('src', '/images/primera.jpg');
    });

    it('utiliza la imagen alternativa cuando el arreglo está vacío', () => {
        const producto = {
            ...productoMock,
            imagenes: [],
            imagen: '/images/alternativa.jpg'
        };

        renderConProviders(producto);

        expect(screen.getByRole('img', {
            name: producto.nombre
        })).toHaveAttribute('src', '/images/alternativa.jpg');
    });

    it('utiliza la imagen de reemplazo cuando no hay imágenes', () => {
        const producto = {
            ...productoMock,
            imagenes: undefined,
            imagen: undefined
        };

        renderConProviders(producto);

        expect(screen.getByRole('img', {
            name: producto.nombre
        })).toHaveAttribute('src', '/images/placeholder.jpg');
    });

    it('muestra Anime cuando el producto no tiene categoría', () => {
        const producto = {
            ...productoMock,
            categoria: undefined
        };

        renderConProviders(producto);

        expect(screen.getByText('Anime')).toBeInTheDocument();
    });

    it('muestra el nombre del producto sin marca cuando esta no existe', () => {
        const producto = {
            ...productoMock,
            marca: undefined
        };

        renderConProviders(producto);

        expect(screen.getByText(producto.nombre)).toBeInTheDocument();
    });

    it('muestra el botón Agotado y lo deshabilita cuando no hay stock', () => {
        const producto = {
            ...productoMock,
            stock: 0
        };

        renderConProviders(producto);

        const boton = screen.getByRole('button', { name: /Agotado/i });

        expect(boton).toBeDisabled();
    });

    it('permite agregar un producto disponible al carrito', () => {
        renderConProviders(productoMock);

        fireEvent.click(
            screen.getByRole('button', { name: /Añadir al Carrito/i })
        );

        expect(window.alert).toHaveBeenCalledOnce();
        expect(window.alert.mock.calls[0][0]).toContain(productoMock.nombre);
    });

    it('genera los enlaces al detalle del producto', () => {
        renderConProviders(productoMock);

        const enlaces = screen.getAllByRole('link', {
            name: new RegExp(productoMock.nombre, 'i')
        });

        expect(enlaces.length).toBeGreaterThan(0);
        expect(enlaces[0]).toHaveAttribute(
            'href',
            `/detalle/${productoMock.id}`
        );
    });
});
