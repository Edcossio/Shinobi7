
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

const mocks = vi.hoisted(() => ({
    useAuth: vi.fn(),
    registrarUsuario: vi.fn(),
    actualizarUsuario: vi.fn(),
    eliminarUsuario: vi.fn()
}));

vi.mock('../context/AuthContext', () => ({
    useAuth: mocks.useAuth
}));

import GestionUsuarios from '../pages/admin/GestionUsuarios';

describe('GestionUsuarios', () => {
    const usuariosIniciales = [
        {
            run: '11111111-1',
            nombre: 'Jose Pizarro',
            correo: 'jose@example.com',
            rol: 'Administrador'
        },
        {
            run: '22222222-2',
            nombre: 'Ana Torres',
            correo: 'ana@example.com',
            rol: 'Cliente'
        }
    ];

    const renderComponente = () => render(<GestionUsuarios />);

    const obtenerCampo = (texto) => {
        const etiqueta = screen.getByText(texto, { selector: 'label' });
        return etiqueta.parentElement.querySelector('input, select');
    };

    beforeEach(() => {
        mocks.useAuth.mockReturnValue({
            usersList: usuariosIniciales,
            registrarUsuario: mocks.registrarUsuario,
            actualizarUsuario: mocks.actualizarUsuario,
            eliminarUsuario: mocks.eliminarUsuario
        });

        mocks.registrarUsuario.mockReturnValue({
            message: 'Usuario registrado correctamente'
        });

        mocks.actualizarUsuario.mockReturnValue({
            message: 'Usuario actualizado correctamente'
        });

        mocks.eliminarUsuario.mockReturnValue({
            message: 'Usuario eliminado correctamente'
        });

        vi.spyOn(window, 'alert').mockImplementation(() => {});
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.clearAllMocks();
    });

    it('muestra el formulario y la lista de usuarios', () => {
        renderComponente();

        expect(screen.getByText('Añadir Usuario')).toBeTruthy();
        expect(screen.getByText('Lista de Usuarios')).toBeTruthy();
        expect(screen.getByText('Jose Pizarro')).toBeTruthy();
        expect(screen.getByText('Ana Torres')).toBeTruthy();
    });

    it('muestra los roles de los usuarios en la tabla', () => {
        renderComponente();

        expect(
            screen.getByRole('row', { name: /Jose Pizarro/ })
                .querySelector('.badge').textContent
        ).toBe('Administrador');

        expect(
            screen.getByRole('row', { name: /Ana Torres/ })
                .querySelector('.badge').textContent
        ).toBe('Cliente');
    });

    it('busca usuarios por nombre', () => {
        renderComponente();

        fireEvent.change(screen.getByPlaceholderText('Buscar...'), {
            target: { value: 'ana' }
        });

        expect(screen.getByText('Ana Torres')).toBeTruthy();
        expect(screen.queryByText('Jose Pizarro')).toBeNull();
    });

    it('busca usuarios por correo', () => {
        renderComponente();

        fireEvent.change(screen.getByPlaceholderText('Buscar...'), {
            target: { value: 'jose@example.com' }
        });

        expect(screen.getByText('Jose Pizarro')).toBeTruthy();
        expect(screen.queryByText('Ana Torres')).toBeNull();
    });

    it('no muestra usuarios si no hay coincidencias', () => {
        renderComponente();

        fireEvent.change(screen.getByPlaceholderText('Buscar...'), {
            target: { value: 'noexiste@example.com' }
        });

        expect(screen.queryByText('Jose Pizarro')).toBeNull();
        expect(screen.queryByText('Ana Torres')).toBeNull();
    });

    it('registra un usuario nuevo', () => {
        renderComponente();

        fireEvent.change(obtenerCampo('RUN:'), {
            target: { value: '33333333-3' }
        });

        fireEvent.change(obtenerCampo('Nombre Completo:'), {
            target: { value: 'Pedro Soto' }
        });

        fireEvent.change(obtenerCampo('Correo Electrónico:'), {
            target: { value: 'pedro@example.com' }
        });

        fireEvent.change(obtenerCampo('Contraseña:'), {
            target: { value: 'clave12345' }
        });

        fireEvent.change(obtenerCampo('Rol Asignado:'), {
            target: { value: 'Vendedor' }
        });

        fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

        expect(mocks.registrarUsuario).toHaveBeenCalledWith({
            run: '33333333-3',
            nombre: 'Pedro Soto',
            correo: 'pedro@example.com',
            password: 'clave12345',
            rol: 'Vendedor'
        });

        expect(window.alert).toHaveBeenCalledWith(
            'Usuario registrado correctamente'
        );

        expect(screen.getByText('Añadir Usuario')).toBeTruthy();
    });

    it('carga los datos al editar un usuario', () => {
        renderComponente();

        fireEvent.click(
            screen.getAllByRole('button', { name: 'Editar' })[0]
        );

        expect(screen.getByText('Editar Usuario')).toBeTruthy();
        expect(obtenerCampo('RUN:').value).toBe('11111111-1');
        expect(obtenerCampo('Nombre Completo:').value).toBe('Jose Pizarro');
        expect(obtenerCampo('Correo Electrónico:').value).toBe('jose@example.com');
        expect(obtenerCampo('Correo Electrónico:').disabled).toBe(true);
        expect(obtenerCampo('Contraseña:').value).toBe('');
        expect(obtenerCampo('Contraseña:').required).toBe(false);
    });

    it('actualiza un usuario existente', () => {
        renderComponente();

        fireEvent.click(
            screen.getAllByRole('button', { name: 'Editar' })[0]
        );

        fireEvent.change(obtenerCampo('Nombre Completo:'), {
            target: { value: 'Jose Actualizado' }
        });

        fireEvent.change(obtenerCampo('Rol Asignado:'), {
            target: { value: 'Vendedor' }
        });

        fireEvent.change(obtenerCampo('Contraseña:'), {
            target: { value: 'nuevaClave123' }
        });

        fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));

        expect(mocks.actualizarUsuario).toHaveBeenCalledWith(
            'jose@example.com',
            {
                run: '11111111-1',
                nombre: 'Jose Actualizado',
                rol: 'Vendedor',
                password: 'nuevaClave123'
            }
        );

        expect(window.alert).toHaveBeenCalledWith(
            'Usuario actualizado correctamente'
        );

        expect(screen.getByText('Añadir Usuario')).toBeTruthy();
    });

    it('permite cancelar una edición', () => {
        renderComponente();

        fireEvent.click(
            screen.getAllByRole('button', { name: 'Editar' })[0]
        );

        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

        expect(screen.getByText('Añadir Usuario')).toBeTruthy();
        expect(obtenerCampo('RUN:').value).toBe('');
        expect(obtenerCampo('Nombre Completo:').value).toBe('');
        expect(obtenerCampo('Correo Electrónico:').value).toBe('');
        expect(obtenerCampo('Contraseña:').value).toBe('');
        expect(obtenerCampo('Rol Asignado:').value).toBe('Cliente');
    });

    it('elimina un usuario y muestra el mensaje de resultado', () => {
        renderComponente();

        fireEvent.click(
            screen.getAllByRole('button', { name: 'Eliminar' })[0]
        );

        expect(mocks.eliminarUsuario).toHaveBeenCalledWith('jose@example.com');

        expect(window.alert).toHaveBeenCalledWith(
            'Usuario eliminado correctamente'
        );
    });

    it('permite asignar el rol Administrador en el formulario', () => {
        renderComponente();

        fireEvent.change(obtenerCampo('Rol Asignado:'), {
            target: { value: 'Administrador' }
        });

        expect(obtenerCampo('Rol Asignado:').value).toBe('Administrador');
    });

    it('carga valores por defecto al editar un usuario con datos incompletos', () => {
        mocks.useAuth.mockReturnValue({
            usersList: [
                {
                    correo: 'incompleto@example.com'
                }
            ],
            registrarUsuario: mocks.registrarUsuario,
            actualizarUsuario: mocks.actualizarUsuario,
            eliminarUsuario: mocks.eliminarUsuario
        });

        renderComponente();

        fireEvent.click(
            screen.getByRole('button', { name: 'Editar' })
        );

        expect(obtenerCampo('RUN:').value).toBe('');
        expect(obtenerCampo('Nombre Completo:').value).toBe('');
        expect(obtenerCampo('Correo Electrónico:').value).toBe(
            'incompleto@example.com'
        );
        expect(obtenerCampo('Rol Asignado:').value).toBe('Cliente');
    });
});
