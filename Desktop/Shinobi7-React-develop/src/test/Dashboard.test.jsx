
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

const mocks = vi.hoisted(() => ({
    useProducts: vi.fn(),
    useAuth: vi.fn()
}));

vi.mock('../context/ProductContext', () => ({
    useProducts: mocks.useProducts
}));

vi.mock('../context/AuthContext', () => ({
    useAuth: mocks.useAuth
}));

import Dashboard from '../pages/admin/Dashboard';

describe('Dashboard', () => {
    beforeEach(() => {
        mocks.useProducts.mockReturnValue({
            productos: [
                { id: 'P1', nombre: 'Figura A', stock: 2, stockCritico: 3 },
                { id: 'P2', nombre: 'Figura B', stock: 10, stockCritico: 3 },
                { id: 'P3', nombre: 'Figura C', stock: 0 }
            ]
        });

        mocks.useAuth.mockReturnValue({
            usersList: [
                { correo: 'admin@shinobi7.cl' },
                { correo: 'cliente@gmail.com' },
                { correo: 'vendedor@shinobi7.cl' },
                { correo: 'otro@shinobi7.cl' }
            ]
        });
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('muestra el título y la descripción del panel', () => {
        render(<Dashboard />);

        expect(screen.getByText('Principal Dashboard')).toBeTruthy();
        expect(
            screen.getByText(/Bienvenido al portal de administración/i)
        ).toBeTruthy();
    });

    it('muestra la cantidad total de productos', () => {
        render(<Dashboard />);

        expect(screen.getByText('3')).toBeTruthy();
        expect(screen.getByText('Productos en Inventario')).toBeTruthy();
    });

    it('cuenta los productos con stock crítico', () => {
        render(<Dashboard />);

        expect(screen.getByText('Productos Stock Crítico')).toBeTruthy();
        expect(screen.getByText('2')).toBeTruthy();
    });

    it('muestra la cantidad de usuarios registrados', () => {
        render(<Dashboard />);

        expect(screen.getByText('Usuarios Registrados')).toBeTruthy();
        expect(screen.getByText('4')).toBeTruthy();
    });

    it('muestra cero productos y usuarios si las listas están vacías', () => {
        mocks.useProducts.mockReturnValue({ productos: [] });
        mocks.useAuth.mockReturnValue({ usersList: [] });

        render(<Dashboard />);

        expect(screen.getAllByText('0')).toHaveLength(3);
    });
});
