
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
    useAuth: vi.fn(),
    useProducts: vi.fn(),
    getTurnoActivoBD: vi.fn(),
    saveTurnoActivoBD: vi.fn(),
    getBoletasBD: vi.fn(),
    saveBoletasBD: vi.fn(),
    registrarLogAuditoriaBD: vi.fn(),
    refrescarProductos: vi.fn()
}));

vi.mock('../context/AuthContext', () => ({
    useAuth: mocks.useAuth
}));

vi.mock('../context/ProductContext', () => ({
    useProducts: mocks.useProducts
}));

vi.mock('../services/dataService', () => ({
    getTurnoActivoBD: mocks.getTurnoActivoBD,
    saveTurnoActivoBD: mocks.saveTurnoActivoBD,
    getBoletasBD: mocks.getBoletasBD,
    saveBoletasBD: mocks.saveBoletasBD,
    registrarLogAuditoriaBD: mocks.registrarLogAuditoriaBD
}));

vi.mock('../components/organisms/ModalAperturaTurno', () => ({
    default: ({ show, onConfirmar, onHide }) => show ? (
        <div>
            <span>Modal apertura</span>
            <button onClick={() => onConfirmar(50000)}>Confirmar apertura</button>
            <button onClick={onHide}>Cancelar apertura</button>
        </div>
    ) : null
}));

vi.mock('../components/organisms/ModalCobroPOS', () => ({
    default: ({ show, totalVenta, onFinalizarVenta, onHide }) => show ? (
        <div>
            <span>Modal cobro</span>
            <span data-testid="total-cobro">{totalVenta}</span>
            <button onClick={() => onFinalizarVenta({
                pagos: [{ metodo: 'Efectivo', monto: totalVenta }],
                vuelto: 0
            })}>
                Confirmar venta
            </button>
            <button onClick={onHide}>Cancelar cobro</button>
        </div>
    ) : null
}));

vi.mock('../components/organisms/ModalBoletaTermica', () => ({
    default: ({ show, boleta, onHide }) => show ? (
        <div>
            <span>Modal boleta</span>
            <span>{boleta?.folio}</span>
            <button onClick={onHide}>Cerrar boleta</button>
        </div>
    ) : null
}));

vi.mock('../components/organisms/ModalCierreTurno', () => ({
    default: ({ show, onConfirmarCierre, onHide }) => show ? (
        <div>
            <span>Modal cierre</span>
            <button onClick={() => onConfirmarCierre(50000)}>Confirmar cierre</button>
            <button onClick={onHide}>Cancelar cierre</button>
        </div>
    ) : null
}));

vi.mock('../components/organisms/ModalAuthSupervisor', () => ({
    default: ({ show, onAutorizado, onHide }) => show ? (
        <div>
            <span>Modal supervisor</span>
            <button onClick={() => onAutorizado({ correo: 'admin@example.com' })}>
                Autorizar anulación
            </button>
            <button onClick={onHide}>Cancelar autorización</button>
        </div>
    ) : null
}));

vi.mock('../components/organisms/ModalHistorialTurno', () => ({
    default: ({ show, boletasTurno, onReimprimir, onSolicitarAnulacion, onHide }) => show ? (
        <div>
            <span>Modal historial</span>
            {boletasTurno.map(boleta => (
                <div key={boleta.folio}>
                    <span>{boleta.folio}</span>
                    <button onClick={() => onReimprimir(boleta)}>
                        Reimprimir {boleta.folio}
                    </button>
                    <button onClick={() => onSolicitarAnulacion(boleta.folio)}>
                        Anular {boleta.folio}
                    </button>
                </div>
            ))}
            <button onClick={onHide}>Cerrar historial</button>
        </div>
    ) : null
}));

import POS from '../pages/admin/POS';

describe('POS', () => {
    const productosIniciales = [
        {
            id: 'FIG001',
            nombre: 'Figura Naruto',
            precio: 15000,
            stock: 5,
            categoria: 'Anime',
            imagen: '/naruto.jpg'
        },
        {
            id: 'FIG002',
            nombre: 'Figura Pikachu',
            precio: 10000,
            stock: 0,
            categoria: 'Pokemon',
            imagenes: ['/pikachu.jpg']
        },
        {
            id: 'FIG003',
            nombre: 'Figura Próxima',
            precio: 20000,
            stock: 3,
            categoria: 'Anime',
            esProximo: true
        }
    ];

    const turnoInicial = {
        id: 'TRN-123456',
        cajeroCorreo: 'cajero@example.com',
        cajeroNombre: 'Jose Pizarro',
        montoInicial: 50000,
        estado: 'ABIERTO'
    };

    const renderPOS = () => render(
        <MemoryRouter>
            <POS />
        </MemoryRouter>
    );

    beforeEach(() => {
        mocks.useAuth.mockReturnValue({
            user: {
                correo: 'cajero@example.com',
                nombre: 'Jose Pizarro'
            }
        });

        mocks.useProducts.mockReturnValue({
            productos: productosIniciales,
            refrescarProductos: mocks.refrescarProductos
        });

        mocks.getTurnoActivoBD.mockReturnValue(null);
        mocks.getBoletasBD.mockReturnValue([]);
        mocks.saveTurnoActivoBD.mockReset();
        mocks.saveBoletasBD.mockReset();
        mocks.registrarLogAuditoriaBD.mockReset();
        mocks.refrescarProductos.mockReset();

        vi.spyOn(window, 'alert').mockImplementation(() => {});
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.clearAllMocks();
    });

    it('muestra el POS, el cajero y el turno cerrado', () => {
        renderPOS();

        expect(screen.getByText('POS CAJA')).toBeTruthy();
        expect(screen.getByText('Cajero: Jose Pizarro')).toBeTruthy();
        expect(screen.getByText('TURNO CERRADO')).toBeTruthy();
        expect(screen.getByText('Sin productos seleccionados')).toBeTruthy();
    });

    it('muestra los productos disponibles y excluye los próximos', () => {
        renderPOS();

        expect(screen.getByText('Figura Naruto')).toBeTruthy();
        expect(screen.getByText('Figura Pikachu')).toBeTruthy();
        expect(screen.queryByText('Figura Próxima')).toBeNull();
    });

    it('deshabilita las acciones de turno cuando no hay turno activo', () => {
        renderPOS();

        expect(screen.getByRole('button', { name: /Abrir Turno/ }).disabled).toBe(false);
        expect(screen.getByRole('button', { name: /Arqueo \/ Cierre/ }).disabled).toBe(true);
        expect(screen.getByRole('button', { name: /Ventas/ }).disabled).toBe(true);
        expect(screen.getByRole('button', { name: /COBRAR/ }).disabled).toBe(true);
    });

    it('abre el modal de apertura de turno', () => {
        renderPOS();

        fireEvent.click(screen.getByRole('button', { name: /Abrir Turno/ }));

        expect(screen.getByText('Modal apertura')).toBeTruthy();
    });

    it('confirma la apertura y registra la auditoría', () => {
        renderPOS();

        fireEvent.click(screen.getByRole('button', { name: /Abrir Turno/ }));
        fireEvent.click(screen.getByRole('button', { name: 'Confirmar apertura' }));

        expect(mocks.saveTurnoActivoBD).toHaveBeenCalledWith(
            expect.objectContaining({
                cajeroCorreo: 'cajero@example.com',
                cajeroNombre: 'Jose Pizarro',
                montoInicial: 50000,
                estado: 'ABIERTO'
            })
        );

        expect(mocks.registrarLogAuditoriaBD).toHaveBeenCalledWith(
            'APERTURA_TURNO',
            expect.stringContaining('50000'),
            'cajero@example.com'
        );

        expect(window.alert).toHaveBeenCalledWith(
            expect.stringContaining('abierto')
        );

        expect(screen.getByText(/TURNO ABIERTO/)).toBeTruthy();
    });

    it('filtra los productos por nombre o código', () => {
        renderPOS();

        fireEvent.change(screen.getByPlaceholderText('Buscar o escanear código...'), {
            target: { value: 'FIG001' }
        });

        expect(screen.getByText('Figura Naruto')).toBeTruthy();
        expect(screen.queryByText('Figura Pikachu')).toBeNull();
    });

    it('filtra los productos por categoría', () => {
        renderPOS();

        fireEvent.change(screen.getByRole('combobox'), {
            target: { value: 'Pokemon' }
        });

        expect(screen.getByText('Figura Pikachu')).toBeTruthy();
        expect(screen.queryByText('Figura Naruto')).toBeNull();
    });

    it('avisa si se intenta agregar un producto sin turno abierto', () => {
        renderPOS();

        fireEvent.click(screen.getAllByRole('button', { name: /\+ Agregar/ })[0]);

        expect(window.alert).toHaveBeenCalledWith(
            'Debes abrir turno primero.'
        );
    });

    it('permite agregar un producto cuando el turno está abierto', () => {
        mocks.getTurnoActivoBD.mockReturnValue(turnoInicial);

        renderPOS();

        fireEvent.click(screen.getAllByRole('button', { name: /\+ Agregar/ })[0]);

        expect(screen.getAllByText('Figura Naruto')).toHaveLength(2);
        expect(screen.getByText('$15.000 x 1')).toBeTruthy();
        expect(screen.getAllByText('$15.000').length).toBeGreaterThan(0);
        expect(screen.getByRole('button', { name: /COBRAR/ }).disabled).toBe(false);
    });

    it('impide agregar productos sin stock', () => {
        mocks.getTurnoActivoBD.mockReturnValue(turnoInicial);

        renderPOS();

        const botonesAgregar = screen.getAllByRole('button', { name: /\+ Agregar/ });
        expect(botonesAgregar[1].disabled).toBe(true);
    });

    it('abre el modal de cobro con el total correcto', () => {
        mocks.getTurnoActivoBD.mockReturnValue(turnoInicial);

        renderPOS();

        fireEvent.click(screen.getAllByRole('button', { name: /\+ Agregar/ })[0]);
        fireEvent.click(screen.getByRole('button', { name: /COBRAR/ }));

        expect(screen.getByText('Modal cobro')).toBeTruthy();
        expect(screen.getByTestId('total-cobro').textContent).toBe('15000');
    });

    it('registra una venta y muestra la boleta', () => {
        mocks.getTurnoActivoBD.mockReturnValue(turnoInicial);
        mocks.getBoletasBD.mockReturnValue([]);

        renderPOS();

        fireEvent.click(screen.getAllByRole('button', { name: /\+ Agregar/ })[0]);
        fireEvent.click(screen.getByRole('button', { name: /COBRAR/ }));
        fireEvent.click(screen.getByRole('button', { name: 'Confirmar venta' }));

        expect(mocks.saveBoletasBD).toHaveBeenCalledWith([
            expect.objectContaining({
                turnoId: 'TRN-123456',
                cajeroCorreo: 'cajero@example.com',
                subtotal: 15000,
                descuento: 0,
                total: 15000,
                anulada: false
            })
        ]);

        expect(mocks.refrescarProductos).toHaveBeenCalled();
        expect(screen.getByText('Modal boleta')).toBeTruthy();
        expect(screen.getByText(/^BOL-/)).toBeTruthy();
        expect(screen.getByText('Sin productos seleccionados')).toBeTruthy();
    });

    it('abre el modal de cierre de turno', () => {
        mocks.getTurnoActivoBD.mockReturnValue(turnoInicial);

        renderPOS();

        fireEvent.click(screen.getByRole('button', { name: /Arqueo \/ Cierre/ }));

        expect(screen.getByText('Modal cierre')).toBeTruthy();
    });

    it('confirma el cierre y limpia el turno activo', () => {
        mocks.getTurnoActivoBD.mockReturnValue(turnoInicial);

        renderPOS();

        fireEvent.click(screen.getByRole('button', { name: 'Arqueo / Cierre' }));
        fireEvent.click(screen.getByRole('button', { name: 'Confirmar cierre' }));

        expect(mocks.saveTurnoActivoBD).toHaveBeenCalledWith(null);
        expect(mocks.registrarLogAuditoriaBD).toHaveBeenCalledWith(
            'ARQUEO_CERRADO',
            'Declarado $50000',
            'cajero@example.com'
        );

        expect(window.alert).toHaveBeenCalledWith(
            'Turno de caja cerrado correctamente.'
        );

        expect(screen.getByText('TURNO CERRADO')).toBeTruthy();
    });

    it('muestra el historial de ventas del turno activo', () => {
        mocks.getTurnoActivoBD.mockReturnValue(turnoInicial);
        mocks.getBoletasBD.mockReturnValue([
            {
                folio: 'BOL-1234567',
                turnoId: 'TRN-123456',
                total: 15000,
                items: [],
                anulada: false
            },
            {
                folio: 'BOL-7654321',
                turnoId: 'TRN-OTRO',
                total: 20000,
                items: [],
                anulada: false
            }
        ]);

        renderPOS();

        fireEvent.click(screen.getByRole('button', { name: /Ventas/ }));

        expect(screen.getByText('Modal historial')).toBeTruthy();
        expect(screen.getByText('BOL-1234567')).toBeTruthy();
        expect(screen.queryByText('BOL-7654321')).toBeNull();
    });

    it('permite reimprimir una boleta desde el historial', () => {
        mocks.getTurnoActivoBD.mockReturnValue(turnoInicial);
        mocks.getBoletasBD.mockReturnValue([
            {
                folio: 'BOL-1234567',
                turnoId: 'TRN-123456',
                total: 15000,
                items: [],
                anulada: false
            }
        ]);

        renderPOS();

        fireEvent.click(screen.getByRole('button', { name: /Ventas/ }));
        fireEvent.click(screen.getByRole('button', { name: 'Reimprimir BOL-1234567' }));

        expect(screen.getByText('Modal boleta')).toBeTruthy();
        expect(screen.getAllByText('BOL-1234567')).toHaveLength(2);
    });

    it('solicita autorización para anular una boleta', () => {
        mocks.getTurnoActivoBD.mockReturnValue(turnoInicial);
        mocks.getBoletasBD.mockReturnValue([
            {
                folio: 'BOL-1234567',
                turnoId: 'TRN-123456',
                total: 15000,
                items: [],
                anulada: false
            }
        ]);

        renderPOS();

        fireEvent.click(screen.getByRole('button', { name: /Ventas/ }));
        fireEvent.click(screen.getByRole('button', { name: 'Anular BOL-1234567' }));

        expect(screen.getByText('Modal supervisor')).toBeTruthy();
    });

    it('anula la boleta cuando el supervisor autoriza', () => {
        mocks.getTurnoActivoBD.mockReturnValue(turnoInicial);
        const boletas = [
            {
                folio: 'BOL-1234567',
                turnoId: 'TRN-123456',
                total: 15000,
                items: [],
                anulada: false
            }
        ];
        mocks.getBoletasBD.mockReturnValue(boletas);

        renderPOS();

        fireEvent.click(screen.getByRole('button', { name: /Ventas/ }));
        fireEvent.click(screen.getByRole('button', { name: 'Anular BOL-1234567' }));
        fireEvent.click(screen.getByRole('button', { name: 'Autorizar anulación' }));

        expect(boletas[0].anulada).toBe(true);
        expect(mocks.saveBoletasBD).toHaveBeenCalledWith(boletas);
        expect(mocks.refrescarProductos).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith(
            '¡Boleta BOL-1234567 anulada exitosamente!'
        );
    });
});
