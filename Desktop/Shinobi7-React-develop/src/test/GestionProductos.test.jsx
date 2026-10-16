
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
import { MemoryRouter } from 'react-router-dom';

const mocks = vi.hoisted(() => ({
    useProducts: vi.fn(),
    agregarProducto: vi.fn(),
    actualizarProducto: vi.fn(),
    eliminarProducto: vi.fn()
}));

vi.mock('../context/ProductContext', () => ({
    useProducts: mocks.useProducts
}));

import GestionProductos from '../pages/admin/GestionProductos';

describe('GestionProductos', () => {
    const renderComponente = () =>
        render(
            <MemoryRouter>
                <GestionProductos />
            </MemoryRouter>
        );

    const obtenerCampo = (texto) => {
        const etiqueta = screen.getByText(texto, { selector: 'label' });
        return etiqueta.parentElement.querySelector('input');
    };

    beforeEach(() => {
        mocks.useProducts.mockReturnValue({
            productos: [
                {
                    id: 'FIG001',
                    nombre: 'Figura Naruto',
                    precio: 15000,
                    stock: 2,
                    stockCritico: 3
                },
                {
                    id: 'FIG002',
                    nombre: 'Figura Sasuke',
                    precio: 20000,
                    stock: 10,
                    stockCritico: 3
                }
            ],
            agregarProducto: mocks.agregarProducto,
            actualizarProducto: mocks.actualizarProducto,
            eliminarProducto: mocks.eliminarProducto
        });

        mocks.agregarProducto.mockReturnValue({
            message: 'Producto agregado correctamente'
        });
        mocks.actualizarProducto.mockReturnValue({
            message: 'Producto actualizado correctamente'
        });

        vi.spyOn(window, 'alert').mockImplementation(() => {});
        vi.spyOn(window, 'confirm').mockReturnValue(true);
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.clearAllMocks();
    });

    it('muestra el formulario, la tabla y el acceso al POS', () => {
        renderComponente();

        expect(screen.getByText('Configuración Productos')).toBeTruthy();
        expect(screen.getByText('Tabla de Inventario')).toBeTruthy();
        expect(screen.getByText('Abrir Caja / POS')).toBeTruthy();
        expect(screen.getByText('FIG001')).toBeTruthy();
        expect(screen.getByText('FIG002')).toBeTruthy();
    });

    it('muestra los estados crítico y OK', () => {
        renderComponente();

        expect(screen.getByText('CRÍTICO (2)')).toBeTruthy();
        expect(screen.getByText('OK (10)')).toBeTruthy();
    });

    it('busca productos por código', () => {
        renderComponente();

        fireEvent.change(screen.getByPlaceholderText('Buscar...'), {
            target: { value: 'FIG001' }
        });

        expect(screen.getByText('Figura Naruto')).toBeTruthy();
        expect(screen.queryByText('Figura Sasuke')).toBeNull();
    });

    it('busca productos por nombre sin distinguir mayúsculas', () => {
        renderComponente();

        fireEvent.change(screen.getByPlaceholderText('Buscar...'), {
            target: { value: 'sasuke' }
        });

        expect(screen.getByText('Figura Sasuke')).toBeTruthy();
        expect(screen.queryByText('Figura Naruto')).toBeNull();
    });

    it('no muestra productos si no hay coincidencias', () => {
        renderComponente();

        fireEvent.change(screen.getByPlaceholderText('Buscar...'), {
            target: { value: 'producto inexistente' }
        });

        expect(screen.queryByText('Figura Naruto')).toBeNull();
        expect(screen.queryByText('Figura Sasuke')).toBeNull();
    });

    it('agrega un producto y muestra el mensaje de resultado', () => {
        renderComponente();

        fireEvent.change(obtenerCampo('Código (min. 3 caracteres):'), {
            target: { value: 'FIG003' }
        });
        fireEvent.change(obtenerCampo('Producto:'), {
            target: { value: 'Figura Luffy' }
        });
        fireEvent.change(obtenerCampo('Precio (CLP):'), {
            target: { value: '25000' }
        });
        fireEvent.change(obtenerCampo('Stock:'), {
            target: { value: '8' }
        });
        fireEvent.change(obtenerCampo('Pocas Unidades:'), {
            target: { value: '3' }
        });

        fireEvent.click(
            screen.getByRole('button', { name: 'Agregar Producto' })
        );

        expect(mocks.agregarProducto).toHaveBeenCalledWith({
            id: 'FIG003',
            nombre: 'Figura Luffy',
            precio: '25000',
            stock: '8',
            stockCritico: '3'
        });
        expect(window.alert).toHaveBeenCalledWith(
            'Producto agregado correctamente'
        );
        expect(obtenerCampo('Código (min. 3 caracteres):').value).toBe('');
    });

    it('carga los datos al seleccionar Editar', () => {
        renderComponente();

        fireEvent.click(
            screen.getAllByRole('button', { name: 'Editar' })[0]
        );

        expect(screen.getByText('Editar Producto')).toBeTruthy();
        expect(obtenerCampo('Código (min. 3 caracteres):').value).toBe('FIG001');
        expect(obtenerCampo('Producto:').value).toBe('Figura Naruto');
        expect(obtenerCampo('Precio (CLP):').value).toBe('15000');
        expect(obtenerCampo('Stock:').value).toBe('2');
        expect(obtenerCampo('Código (min. 3 caracteres):').disabled).toBe(true);
    });

    it('actualiza un producto y muestra el mensaje de resultado', () => {
        renderComponente();

        fireEvent.click(
            screen.getAllByRole('button', { name: 'Editar' })[0]
        );

        fireEvent.change(obtenerCampo('Producto:'), {
            target: { value: 'Figura Naruto Actualizada' }
        });
        fireEvent.change(obtenerCampo('Precio (CLP):'), {
            target: { value: '18000' }
        });
        fireEvent.change(obtenerCampo('Stock:'), {
            target: { value: '5' }
        });

        fireEvent.click(
            screen.getByRole('button', { name: 'Actualizar Producto' })
        );

        expect(mocks.actualizarProducto).toHaveBeenCalledWith('FIG001', {
            nombre: 'Figura Naruto Actualizada',
            precio: '18000',
            stock: '5',
            stockCritico: 3
        });
        expect(window.alert).toHaveBeenCalledWith(
            'Producto actualizado correctamente'
        );
        expect(screen.getByText('Configuración Productos')).toBeTruthy();
    });

    it('cancela la edición y reinicia el formulario', () => {
        renderComponente();

        fireEvent.click(
            screen.getAllByRole('button', { name: 'Editar' })[0]
        );
        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

        expect(screen.getByText('Configuración Productos')).toBeTruthy();
        expect(obtenerCampo('Código (min. 3 caracteres):').value).toBe('');
        expect(obtenerCampo('Producto:').value).toBe('');
        expect(obtenerCampo('Precio (CLP):').value).toBe('');
        expect(obtenerCampo('Stock:').value).toBe('');
        expect(obtenerCampo('Pocas Unidades:').value).toBe('3');
    });

    it('elimina un producto si se confirma', () => {
        renderComponente();

        fireEvent.click(
            screen.getAllByRole('button', { name: 'Eliminar' })[0]
        );

        expect(window.confirm).toHaveBeenCalledWith('¿Eliminar FIG001?');
        expect(mocks.eliminarProducto).toHaveBeenCalledWith('FIG001');
    });

    it('no elimina un producto si se cancela la confirmación', () => {
        window.confirm.mockReturnValue(false);
        renderComponente();

        fireEvent.click(
            screen.getAllByRole('button', { name: 'Eliminar' })[0]
        );

        expect(mocks.eliminarProducto).not.toHaveBeenCalled();
    });
});
