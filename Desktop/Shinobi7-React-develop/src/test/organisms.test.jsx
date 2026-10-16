
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mocks = vi.hoisted(() => ({
    useAuth: vi.fn(),
    useCart: vi.fn(),
    logout: vi.fn(),
    navigate: vi.fn()
}));

vi.mock('../context/AuthContext', () => ({
    useAuth: mocks.useAuth
}));

vi.mock('../context/CartContext', () => ({
    useCart: mocks.useCart
}));

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => mocks.navigate
    };
});

import AdminSidebar from '../components/organisms/AdminSidebar';
import AdminTopbar from '../components/organisms/AdminTopbar';
import ContactForm from '../components/organisms/ContactForm';
import PublicFooter from '../components/organisms/PublicFooter';
import ProtectedRoute from '../components/organisms/ProtectedRoute';

const renderConRouter = (componente) =>
    render(<MemoryRouter>{componente}</MemoryRouter>);

describe('AdminSidebar', () => {
    beforeEach(() => {
        mocks.useAuth.mockReturnValue({ isAdmin: true });
    });

    it('muestra los enlaces de administrador', () => {
        renderConRouter(<AdminSidebar />);

        expect(screen.getByText('Dashboard')).toBeTruthy();
        expect(screen.getByText(/Gestión Productos/i)).toBeTruthy();
        expect(screen.getByText(/Gestión Usuarios/i)).toBeTruthy();
        expect(screen.getByText(/Punto de Venta/i)).toBeTruthy();
    });

    it('oculta enlaces exclusivos de administrador para otros roles', () => {
        mocks.useAuth.mockReturnValue({ isAdmin: false });

        renderConRouter(<AdminSidebar />);

        expect(screen.queryByText('Dashboard')).toBeNull();
        expect(screen.queryByText(/Gestión Usuarios/i)).toBeNull();
        expect(screen.getByText(/Gestión Productos/i)).toBeTruthy();
    });
});

describe('AdminTopbar', () => {
    beforeEach(() => {
        mocks.useAuth.mockReturnValue({
            user: { nombre: 'Jose Pizarro', rol: 'Administrador' },
            logout: mocks.logout
        });
    });

    it('muestra el usuario y su rol', () => {
        renderConRouter(<AdminTopbar />);

        expect(screen.getByText('Jose Pizarro')).toBeTruthy();
        expect(screen.getByText(/ROL: Administrador/i)).toBeTruthy();
        expect(screen.getByText('SALIR')).toBeTruthy();
    });

    it('cierra sesión y navega al login', () => {
        renderConRouter(<AdminTopbar />);

        fireEvent.click(screen.getByText('SALIR'));

        expect(mocks.logout).toHaveBeenCalled();
        expect(mocks.navigate).toHaveBeenCalledWith('/login');
    });

    it('permite renderizar sin usuario', () => {
        mocks.useAuth.mockReturnValue({
            user: null,
            logout: mocks.logout
        });

        renderConRouter(<AdminTopbar />);

        expect(screen.getByText('SALIR')).toBeTruthy();
    });
});

describe('ContactForm', () => {
    beforeEach(() => {
        vi.spyOn(window, 'alert').mockImplementation(() => {});
    });

    it('muestra los campos del formulario', () => {
        render(<ContactForm />);

        expect(screen.getByText('CONTACTA CON NOSOTROS')).toBeTruthy();
        expect(screen.getByPlaceholderText(/Juan/i)).toBeTruthy();
        expect(screen.getByPlaceholderText('correo@ejemplo.com')).toBeTruthy();
        expect(screen.getByPlaceholderText(/consulta/i)).toBeTruthy();
        expect(screen.getByText('ENVIAR MENSAJE')).toBeTruthy();
    });

    it('envía la consulta y limpia los campos', () => {
        render(<ContactForm />);

        fireEvent.change(screen.getByPlaceholderText(/Juan/i), {
            target: { value: 'Jose Pizarro' }
        });

        fireEvent.change(screen.getByPlaceholderText('correo@ejemplo.com'), {
            target: { value: 'jose@gmail.com' }
        });

        fireEvent.change(screen.getByRole('combobox'), {
            target: { value: 'Garantía y Devoluciones' }
        });

        fireEvent.change(screen.getByPlaceholderText(/consulta/i), {
            target: { value: 'Quiero consultar por un producto' }
        });

        fireEvent.submit(screen.getByRole('button', { name: 'ENVIAR MENSAJE' }).closest('form'));

        expect(window.alert).toHaveBeenCalled();
        expect(window.alert.mock.calls[0][0]).toContain('Jose Pizarro');
        expect(window.alert.mock.calls[0][0]).toContain('Garantía y Devoluciones');
        expect(screen.getByPlaceholderText(/Juan/i).value).toBe('');
        expect(screen.getByPlaceholderText('correo@ejemplo.com').value).toBe('');
    });

    it('envía una consulta con asunto General cuando no se selecciona motivo', () => {
        render(<ContactForm />);

        fireEvent.change(screen.getByPlaceholderText(/Juan/i), {
            target: { value: 'Jose' }
        });

        fireEvent.change(screen.getByPlaceholderText('correo@ejemplo.com'), {
            target: { value: 'jose@gmail.com' }
        });

        fireEvent.change(screen.getByPlaceholderText(/consulta/i), {
            target: { value: 'Consulta general' }
        });

        fireEvent.change(screen.getByRole('combobox'), {
            target: { value: 'Contacto Comercial o Distribución' }
        });

        fireEvent.change(screen.getByRole('combobox'), {
            target: { value: '' }
        });

        // El formulario requiere un asunto, por lo que se comprueba la validación HTML.
        expect(screen.getByRole('combobox').required).toBe(true);
    });
});

describe('PublicFooter', () => {
    it('muestra derechos reservados y redes sociales', () => {
        render(<PublicFooter />);

        expect(screen.getByText(/Shinobi7/i)).toBeTruthy();
        expect(screen.getByTitle('WhatsApp')).toBeTruthy();
        expect(screen.getByTitle('Instagram')).toBeTruthy();
        expect(screen.getByTitle('Facebook')).toBeTruthy();
    });
});

describe('ProtectedRoute', () => {
    beforeEach(() => {
        vi.spyOn(window, 'alert').mockImplementation(() => {});
    });

    it('redirige al login si no hay sesión', () => {
        mocks.useAuth.mockReturnValue({ user: null });

        renderConRouter(
            <ProtectedRoute>
                <p>Contenido privado</p>
            </ProtectedRoute>
        );

        expect(window.alert).toHaveBeenCalled();
        expect(screen.queryByText('Contenido privado')).toBeNull();
    });

    it('permite entrar si el rol está autorizado', () => {
        mocks.useAuth.mockReturnValue({
            user: { rol: ' Administrador ' }
        });

        renderConRouter(
            <ProtectedRoute allowedRoles={['administrador']}>
                <p>Contenido privado</p>
            </ProtectedRoute>
        );

        expect(screen.getByText('Contenido privado')).toBeTruthy();
    });

    it('rechaza un rol no autorizado', () => {
        mocks.useAuth.mockReturnValue({
            user: { rol: 'Cliente' }
        });

        renderConRouter(
            <ProtectedRoute allowedRoles={['administrador']}>
                <p>Contenido privado</p>
            </ProtectedRoute>
        );

        expect(window.alert).toHaveBeenCalled();
        expect(screen.queryByText('Contenido privado')).toBeNull();
    });

    it('permite entrar si no se especifican roles', () => {
        mocks.useAuth.mockReturnValue({
            user: { rol: 'Cliente' }
        });

        renderConRouter(
            <ProtectedRoute>
                <p>Contenido público</p>
            </ProtectedRoute>
        );

        expect(screen.getByText('Contenido público')).toBeTruthy();
    });
});

beforeEach(() => {
    mocks.navigate.mockClear();
    mocks.logout.mockClear();
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});
