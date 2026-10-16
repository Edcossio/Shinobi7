
import React from 'react';
import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach
} from 'vitest';
import {
    render,
    screen,
    fireEvent,
    cleanup
} from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';

const mocks = vi.hoisted(() => ({
    useAuth: vi.fn(),
    useCart: vi.fn(),
    logout: vi.fn()
}));

vi.mock('../context/AuthContext', () => ({
    useAuth: mocks.useAuth
}));

vi.mock('../context/CartContext', () => ({
    useCart: mocks.useCart
}));

import PublicNavbar from '../components/organisms/PublicNavbar';

function UbicacionActual() {
    const location = useLocation();
    return <span data-testid="ubicacion">{location.pathname}</span>;
}

function renderNavbar(ruta = '/') {
    return render(
        <MemoryRouter initialEntries={[ruta]}>
            <PublicNavbar />
            <UbicacionActual />
        </MemoryRouter>
    );
}

describe('PublicNavbar', () => {
    beforeEach(() => {
        mocks.useAuth.mockReturnValue({
            user: null,
            logout: mocks.logout,
            isAdmin: false,
            isVendedor: false
        });

        mocks.useCart.mockReturnValue({
            totalItems: 0
        });

        vi.spyOn(window, 'alert').mockImplementation(() => {});
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.clearAllMocks();
    });

    it('muestra el logo y los enlaces públicos', () => {
        renderNavbar();

        expect(screen.getByAltText('Shinobi7 Logo')).toBeTruthy();
        expect(screen.getAllByText('HOME').length).toBeGreaterThan(0);
        expect(screen.getAllByText('PRODUCTOS').length).toBeGreaterThan(0);
        expect(screen.getByText('QUIÉNES SOMOS')).toBeTruthy();
        expect(screen.getAllByText(/CARRITO/).length).toBeGreaterThan(0);
    });

    it('muestra el acceso de inicio de sesión cuando no hay usuario', () => {
        renderNavbar();

        expect(screen.getByText('INICIAR SESIÓN')).toBeTruthy();
        expect(screen.getByText('LOGIN')).toBeTruthy();
        expect(screen.queryByText(/CERRAR SESIÓN/)).toBeNull();
    });

    it('muestra el nombre del usuario y las opciones para cerrar sesión', () => {
        mocks.useAuth.mockReturnValue({
            user: { nombre: 'Jose Pizarro' },
            logout: mocks.logout,
            isAdmin: false,
            isVendedor: false
        });

        renderNavbar();

        expect(screen.getByText('CERRAR SESIÓN (Jose)')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'SALIR' })).toBeTruthy();
        expect(screen.queryByText('LOGIN')).toBeNull();
    });

    it('muestra el enlace del panel de administración para administradores', () => {
        mocks.useAuth.mockReturnValue({
            user: { nombre: 'Jose Pizarro' },
            logout: mocks.logout,
            isAdmin: true,
            isVendedor: false
        });

        renderNavbar();

        expect(screen.getByText('PANEL ADMIN')).toBeTruthy();
    });

    it('no muestra el panel de administración para usuarios normales', () => {
        renderNavbar();

        expect(screen.queryByText('PANEL ADMIN')).toBeNull();
        expect(screen.queryByText('GESTIÓN PRODUCTOS')).toBeNull();
    });

    it('muestra gestión de productos para vendedores', () => {
        mocks.useAuth.mockReturnValue({
            user: { nombre: 'Ana Torres' },
            logout: mocks.logout,
            isAdmin: false,
            isVendedor: true
        });

        renderNavbar();

        expect(screen.getByText('GESTIÓN PRODUCTOS')).toBeTruthy();
    });

    it('muestra la cantidad de productos en el carrito cuando es mayor que cero', () => {
        mocks.useCart.mockReturnValue({
            totalItems: 3
        });

        renderNavbar();

        expect(screen.getByText('CARRITO (3)')).toBeTruthy();
        expect(screen.getAllByText('3').length).toBeGreaterThan(0);
    });

    it('no muestra la insignia móvil cuando el carrito está vacío', () => {
        mocks.useCart.mockReturnValue({
            totalItems: 0
        });

        renderNavbar();

        expect(screen.queryByText('0')).toBeNull();
    });

    it('cierra la sesión y navega al login desde el enlace de escritorio', () => {
        mocks.useAuth.mockReturnValue({
            user: { nombre: 'Jose Pizarro' },
            logout: mocks.logout,
            isAdmin: false,
            isVendedor: false
        });

        renderNavbar('/');

        fireEvent.click(screen.getByText('CERRAR SESIÓN (Jose)'));

        expect(mocks.logout).toHaveBeenCalledTimes(1);
        expect(window.alert).toHaveBeenCalledWith(
            'Has cerrado sesión exitosamente.'
        );
        expect(screen.getByTestId('ubicacion').textContent).toBe('/login');
    });

    it('cierra la sesión y navega al login desde el botón móvil', () => {
        mocks.useAuth.mockReturnValue({
            user: { nombre: 'Ana Torres' },
            logout: mocks.logout,
            isAdmin: false,
            isVendedor: false
        });

        renderNavbar();

        fireEvent.click(screen.getByRole('button', { name: 'SALIR' }));

        expect(mocks.logout).toHaveBeenCalledTimes(1);
        expect(window.alert).toHaveBeenCalledWith(
            'Has cerrado sesión exitosamente.'
        );
        expect(screen.getByTestId('ubicacion').textContent).toBe('/login');
    });

    it('permite navegar a productos', () => {
        renderNavbar('/');

        fireEvent.click(screen.getAllByText('PRODUCTOS')[0]);

        expect(screen.getByTestId('ubicacion').textContent).toBe('/productos');
    });

    it('permite navegar al carrito', () => {
        renderNavbar('/');

        fireEvent.click(screen.getAllByText(/CARRITO/)[0]);

        expect(screen.getByTestId('ubicacion').textContent).toBe('/carrito');
    });
});
