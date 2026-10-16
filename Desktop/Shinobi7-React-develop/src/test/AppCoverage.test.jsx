import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Outlet } from 'react-router-dom';

vi.mock('../components/templates/StoreLayout', () => ({
    default: () => {
        return <div data-testid="store-layout"><Outlet /></div>;
    }
}));

vi.mock('../components/templates/AdminLayout', () => ({
    default: ({ tituloBreadcrumb }) => {
        return <div data-testid="admin-layout"><h1>{tituloBreadcrumb}</h1><Outlet /></div>;
    }
}));

vi.mock('../components/organisms/ProtectedRoute', () => ({
    default: ({ children }) => <div data-testid="protected-route">{children}</div>
}));

vi.mock('../pages/public/Home', () => ({ default: () => <div>Public Home Page</div> }));
vi.mock('../pages/public/Productos', () => ({ default: () => <div>Public Products Page</div> }));
vi.mock('../pages/public/DetalleProducto', () => ({ default: () => <div>Product Detail Page</div> }));
vi.mock('../pages/public/Carrito', () => ({ default: () => <div>Shopping Cart Page</div> }));
vi.mock('../pages/public/Login', () => ({ default: () => <div>Login Page</div> }));
vi.mock('../pages/public/Registro', () => ({ default: () => <div>Register Page</div> }));
vi.mock('../pages/public/Nosotros', () => ({ default: () => <div>About Page</div> }));
vi.mock('../pages/public/Contacto', () => ({ default: () => <div>Contact Page</div> }));
vi.mock('../pages/admin/Dashboard', () => ({ default: () => <div>Admin Dashboard Page</div> }));
vi.mock('../pages/admin/GestionProductos', () => ({ default: () => <div>Admin Products Page</div> }));
vi.mock('../pages/admin/GestionUsuarios', () => ({ default: () => <div>Admin Users Page</div> }));
vi.mock('../pages/admin/POS', () => ({ default: () => <div>Point Of Sale Page</div> }));

import App from '../App';

function renderAt(path) {
    window.history.pushState({}, '', path);
    return render(<App />);
}

describe('App: rutas de la aplicación', () => {
    beforeEach(() => {
        window.history.pushState({}, '', '/');
    });

    afterEach(() => {
        cleanup();
    });

    it('muestra la página de inicio en la ruta raíz', () => {
        renderAt('/');
        expect(screen.getByText('Public Home Page')).toBeTruthy();
        expect(screen.getByTestId('store-layout')).toBeTruthy();
    });

    it.each([
        ['/productos', 'Public Products Page'],
        ['/detalle/123', 'Product Detail Page'],
        ['/nosotros', 'About Page'],
        ['/contacto', 'Contact Page'],
        ['/carrito', 'Shopping Cart Page'],
        ['/login', 'Login Page'],
        ['/registro', 'Register Page']
    ])('muestra la página correcta para %s', async (path, expectedText) => {
        renderAt(path);
        expect(await screen.findByText(expectedText)).toBeTruthy();
    });

    it.each([
        ['/admin/home', 'Admin Dashboard Page'],
        ['/admin/productos', 'Admin Products Page'],
        ['/admin/usuarios', 'Admin Users Page']
    ])('muestra la vista administrativa para %s', async (path, expectedText) => {
        renderAt(path);
        expect(await screen.findByText(expectedText)).toBeTruthy();
        expect(screen.getAllByTestId('protected-route').length).toBeGreaterThan(0);
        expect(screen.getByTestId('admin-layout')).toBeTruthy();
    });

    it('muestra la vista del punto de venta', async () => {
        renderAt('/pos');
        expect(await screen.findByText('Point Of Sale Page')).toBeTruthy();
        expect(screen.getAllByTestId('protected-route').length).toBeGreaterThan(0);
    });

    it('redirige una ruta inexistente a la página de inicio', async () => {
        renderAt('/ruta-que-no-existe');
        expect(await screen.findByText('Public Home Page')).toBeTruthy();
    });
});
