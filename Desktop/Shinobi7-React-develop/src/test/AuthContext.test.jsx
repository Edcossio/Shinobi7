import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { usuariosIniciales } from '../services/dataService';

const wrapper = ({ children }) => (
    <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem(
            'collector_usuarios',
            JSON.stringify(usuariosIniciales)
        );
    });

    afterEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    it('inicia sesión con credenciales válidas', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        let respuesta;

        act(() => {
            respuesta = result.current.login(
                'jose@shinobi7.cl',
                'admin1234'
            );
        });

        expect(respuesta.success).toBe(true);
        expect(respuesta.user.rol).toBe('Administrador');
        expect(result.current.user).not.toBeNull();
        expect(result.current.isAdmin).toBe(true);
        expect(sessionStorage.getItem('sesionActiva')).not.toBeNull();
    });

    it('rechaza un correo de dominio no permitido', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        let respuesta;

        act(() => {
            respuesta = result.current.login(
                'test@yahoo.com',
                'admin1234'
            );
        });

        expect(respuesta.success).toBe(false);
        expect(respuesta.message).toContain('@duoc.cl');
    });

    it('rechaza una contraseña incorrecta', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        let respuesta;

        act(() => {
            respuesta = result.current.login(
                'jose@shinobi7.cl',
                'otraClave123'
            );
        });

        expect(respuesta.success).toBe(false);
        expect(respuesta.message).toBeTruthy();
        expect(result.current.user).toBeNull();
    });

    it('cierra la sesión y elimina la sesión almacenada', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        act(() => {
            result.current.login('jose@shinobi7.cl', 'admin1234');
        });

        act(() => {
            result.current.logout();
        });

        expect(result.current.user).toBeNull();
        expect(sessionStorage.getItem('sesionActiva')).toBeNull();
        expect(result.current.isAdmin).toBe(false);
        expect(result.current.isVendedor).toBe(false);
    });

    it('registra un usuario nuevo con rol Cliente por defecto', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        let respuesta;

        act(() => {
            respuesta = result.current.registrarUsuario({
                run: '201234567',
                nombre: 'Test User',
                correo: 'test@gmail.com',
                password: 'password123'
            });
        });

        expect(respuesta.success).toBe(true);
        expect(result.current.usersList).toHaveLength(3);
        expect(result.current.usersList[2].rol).toBe('Cliente');
        expect(result.current.usersList[2].password).toBe(
            btoa('password123')
        );
    });

    it('rechaza un RUN inválido al registrar', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        let respuesta;

        act(() => {
            respuesta = result.current.registrarUsuario({
                run: 'abc',
                nombre: 'Test User',
                correo: 'test@gmail.com',
                password: 'password123'
            });
        });

        expect(respuesta.success).toBe(false);
    });

    it('rechaza un correo inválido al registrar', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        let respuesta;

        act(() => {
            respuesta = result.current.registrarUsuario({
                run: '201234567',
                nombre: 'Test User',
                correo: 'test@yahoo.com',
                password: 'password123'
            });
        });

        expect(respuesta.success).toBe(false);
    });

    it('rechaza una contraseña inválida al registrar', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        let respuesta;

        act(() => {
            respuesta = result.current.registrarUsuario({
                run: '201234567',
                nombre: 'Test User',
                correo: 'test@gmail.com',
                password: '123'
            });
        });

        expect(respuesta.success).toBe(false);
    });

    it('rechaza el registro con un correo ya utilizado', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        let respuesta;

        act(() => {
            respuesta = result.current.registrarUsuario({
                run: '201234567',
                nombre: 'Otro Usuario',
                correo: 'JOSE@SHINOBI7.CL',
                password: 'password123'
            });
        });

        expect(respuesta.success).toBe(false);
        expect(respuesta.message).toContain('ya se encuentra registrado');
    });

    it('rechaza actualizar un usuario inexistente', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        let respuesta;

        act(() => {
            respuesta = result.current.actualizarUsuario(
                'noexiste@gmail.com',
                { nombre: 'Nuevo Nombre' }
            );
        });

        expect(respuesta.success).toBe(false);
        expect(respuesta.message).toContain('no encontrado');
    });

    it('actualiza los datos de un usuario existente', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        let respuesta;

        act(() => {
            respuesta = result.current.actualizarUsuario(
                'camila@gmail.com',
                { nombre: 'Camila Actualizada' }
            );
        });

        expect(respuesta.success).toBe(true);
        expect(
            result.current.usersList.find(
                usuario => usuario.correo === 'camila@gmail.com'
            ).nombre
        ).toBe('Camila Actualizada');
    });

    it('codifica una nueva contraseña al actualizar un usuario', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        act(() => {
            result.current.actualizarUsuario(
                'camila@gmail.com',
                { password: 'nuevaClave123' }
            );
        });

        const usuariosGuardados = JSON.parse(
            localStorage.getItem('collector_usuarios')
        );

        const camila = usuariosGuardados.find(
            usuario => usuario.correo === 'camila@gmail.com'
        );

        expect(camila.password).toBe(btoa('nuevaClave123'));
    });

    it('actualiza la sesión cuando modifica al usuario activo', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        act(() => {
            result.current.login('jose@shinobi7.cl', 'admin1234');
        });

        act(() => {
            result.current.actualizarUsuario(
                'jose@shinobi7.cl',
                { nombre: 'Jose Actualizado' }
            );
        });

        expect(result.current.user.nombre).toBe('Jose Actualizado');

        const sesion = JSON.parse(
            sessionStorage.getItem('sesionActiva')
        );

        expect(sesion.nombre).toBe('Jose Actualizado');
    });

    it('impide eliminar la cuenta del usuario activo', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        act(() => {
            result.current.login('jose@shinobi7.cl', 'admin1234');
        });

        let respuesta;

        act(() => {
            respuesta = result.current.eliminarUsuario('jose@shinobi7.cl');
        });

        expect(respuesta.success).toBe(false);
        expect(result.current.user).not.toBeNull();
        expect(result.current.usersList).toHaveLength(2);
    });

    it('elimina otro usuario correctamente', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        let respuesta;

        act(() => {
            respuesta = result.current.eliminarUsuario('camila@gmail.com');
        });

        expect(respuesta.success).toBe(true);
        expect(result.current.usersList).toHaveLength(1);
        expect(
            result.current.usersList.some(
                usuario => usuario.correo === 'camila@gmail.com'
            )
        ).toBe(false);
    });

    it('restaura una sesión válida desde sessionStorage', () => {
        const usuario = usuariosIniciales[0];

        sessionStorage.setItem('sesionActiva', JSON.stringify(usuario));

        const { result } = renderHook(() => useAuth(), { wrapper });

        expect(result.current.user).toEqual(usuario);
        expect(result.current.isAdmin).toBe(true);
    });

    it('elimina una sesión almacenada con JSON inválido', () => {
        sessionStorage.setItem('sesionActiva', '{texto inválido');

        renderHook(() => useAuth(), { wrapper });

        expect(sessionStorage.getItem('sesionActiva')).toBeNull();
    });

    it('identifica correctamente un usuario vendedor', () => {
        const vendedor = usuariosIniciales.find(
            usuario => usuario.rol === 'Vendedor'
        );

        sessionStorage.setItem('sesionActiva', JSON.stringify(vendedor));

        const { result } = renderHook(() => useAuth(), { wrapper });

        expect(result.current.isVendedor).toBe(true);
        expect(result.current.isAdmin).toBe(false);
    });
});