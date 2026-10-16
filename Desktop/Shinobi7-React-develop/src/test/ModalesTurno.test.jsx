
import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

vi.mock('../services/dataService', () => ({
    validarClaveSupervisorBD: vi.fn((clave) =>
        clave === 'admin123'
            ? { valido: true, admin: { nombre: 'Administrador' } }
            : { valido: false, msj: 'Clave incorrecta' }
    )
}));

import ModalAperturaTurno from '../components/organisms/ModalAperturaTurno';
import ModalAuthSupervisor from '../components/organisms/ModalAuthSupervisor';
import ModalBoletaTermica from '../components/organisms/ModalBoletaTermica';
import ModalCierreTurno from '../components/organisms/ModalCierreTurno';
import ModalHistorialTurno from '../components/organisms/ModalHistorialTurno';

describe('ModalAperturaTurno', () => {
    it('muestra el formulario de apertura', () => {
        render(
            <ModalAperturaTurno
                show
                onHide={vi.fn()}
                onConfirmar={vi.fn()}
            />
        );

        expect(screen.getByText(/Apertura de Turno/i)).toBeTruthy();
        expect(screen.getByText(/Iniciar Jornada de Venta/i)).toBeTruthy();
    });

    it('confirma el monto inicial y cierra el modal', () => {
        const onHide = vi.fn();
        const onConfirmar = vi.fn();

        render(
            <ModalAperturaTurno
                show
                onHide={onHide}
                onConfirmar={onConfirmar}
            />
        );

        fireEvent.click(screen.getByText(/Iniciar Jornada de Venta/i));

        expect(onConfirmar).toHaveBeenCalledWith(50000);
        expect(onHide).toHaveBeenCalled();
    });
});

describe('ModalAuthSupervisor', () => {
    beforeEach(() => {
        vi.spyOn(window, 'alert').mockImplementation(() => {});
    });

    it('muestra el motivo de autorización', () => {
        render(
            <ModalAuthSupervisor
                show
                onHide={vi.fn()}
                motivo="Autorizar anulación"
                onAutorizado={vi.fn()}
            />
        );

        expect(screen.getByText('Autorizar anulación')).toBeTruthy();
    });

    it('rechaza una clave incorrecta', () => {
        render(
            <ModalAuthSupervisor
                show
                onHide={vi.fn()}
                motivo="Autorizar anulación"
                onAutorizado={vi.fn()}
            />
        );

        const campoClave = document.querySelector('input[type="password"]');

        expect(campoClave).not.toBeNull();

        fireEvent.change(campoClave, {
            target: { value: 'incorrecta' }
        });

        fireEvent.click(screen.getByText(/Autorizar Acción/i));

        expect(window.alert).toHaveBeenCalledWith('Clave incorrecta');
    });

    it('autoriza con una clave válida', () => {
        const onHide = vi.fn();
        const onAutorizado = vi.fn();

        render(
            <ModalAuthSupervisor
                show
                onHide={onHide}
                motivo="Autorizar anulación"
                onAutorizado={onAutorizado}
            />
        );

        const campoClave = document.querySelector('input[type="password"]');

        expect(campoClave).not.toBeNull();

        fireEvent.change(campoClave, {
            target: { value: 'admin123' }
        });

        fireEvent.click(screen.getByText(/Autorizar Acción/i));

        expect(onAutorizado).toHaveBeenCalled();
        expect(onHide).toHaveBeenCalled();
    });
});

describe('ModalBoletaTermica', () => {
    const boleta = {
        folio: 'BOL-100',
        fechaHora: '2026-10-16T12:00:00.000Z',
        cajeroNombre: 'Jose',
        turnoId: 'TRN-100',
        items: [
            { nombre: 'Figura de prueba', cantidad: 2, precio: 5000 }
        ],
        subtotal: 10000,
        descuento: 0,
        total: 10000,
        pagos: [
            { metodo: 'Efectivo', monto: 12000 }
        ],
        vuelto: 2000
    };

    it('no muestra contenido si no recibe una boleta', () => {
        const { container } = render(
            <ModalBoletaTermica
                show
                onHide={vi.fn()}
                boleta={null}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it('muestra los datos de la boleta y el vuelto', () => {
        render(
            <ModalBoletaTermica
                show
                onHide={vi.fn()}
                boleta={boleta}
            />
        );

        expect(screen.getByText(/BOL-100/)).toBeTruthy();
        expect(screen.getByText('Figura de prueba')).toBeTruthy();
        expect(screen.getByText(/FORMAS DE PAGO/)).toBeTruthy();
        expect(screen.getByText(/VUELTO:/)).toBeTruthy();
    });

    it('permite imprimir el comprobante', () => {
        const imprimir = vi.spyOn(window, 'print').mockImplementation(() => {});

        render(
            <ModalBoletaTermica
                show
                onHide={vi.fn()}
                boleta={boleta}
            />
        );

        fireEvent.click(screen.getByText(/Imprimir Ticket Térmico/i));

        expect(imprimir).toHaveBeenCalled();
    });
});

describe('ModalCierreTurno', () => {
    beforeEach(() => {
        vi.spyOn(window, 'alert').mockImplementation(() => {});
    });

    it('muestra el formulario de cierre', () => {
        render(
            <ModalCierreTurno
                show
                onHide={vi.fn()}
                onConfirmarCierre={vi.fn()}
            />
        );

        expect(screen.getByText(/Arqueo de Caja a Ciegas/i)).toBeTruthy();
        expect(screen.getByText(/Entregar Caja y Cerrar Turno/i)).toBeTruthy();
    });

    it('confirma el monto declarado', () => {
        const onHide = vi.fn();
        const onConfirmarCierre = vi.fn();

        render(
            <ModalCierreTurno
                show
                onHide={onHide}
                onConfirmarCierre={onConfirmarCierre}
            />
        );

        fireEvent.change(screen.getByPlaceholderText('0'), {
            target: { value: '45000' }
        });

        fireEvent.click(screen.getByText(/Entregar Caja y Cerrar Turno/i));

        expect(onConfirmarCierre).toHaveBeenCalledWith(45000);
        expect(onHide).toHaveBeenCalled();
    });
});

describe('ModalHistorialTurno', () => {
    it('muestra el mensaje cuando no hay ventas', () => {
        render(
            <ModalHistorialTurno
                show
                onHide={vi.fn()}
                boletasTurno={[]}
                onReimprimir={vi.fn()}
                onSolicitarAnulacion={vi.fn()}
            />
        );

        expect(screen.getByText(/No hay ventas registradas/i)).toBeTruthy();
    });

    it('permite reimprimir una boleta emitida y solicitar su anulación', () => {
        const onReimprimir = vi.fn();
        const onSolicitarAnulacion = vi.fn();

        const boleta = {
            folio: 'BOL-200',
            fechaHora: '2026-10-16T12:00:00.000Z',
            pagos: [{ metodo: 'Efectivo' }],
            total: 5000,
            anulada: false
        };

        render(
            <ModalHistorialTurno
                show
                onHide={vi.fn()}
                boletasTurno={[boleta]}
                onReimprimir={onReimprimir}
                onSolicitarAnulacion={onSolicitarAnulacion}
            />
        );

        const botones = screen.getAllByRole('button');
        const botonReimprimir = botones.find(
            boton => boton.querySelector('.bi-printer')
        );

        expect(botonReimprimir).toBeTruthy();

        fireEvent.click(botonReimprimir);

        expect(onReimprimir).toHaveBeenCalledWith(boleta);

        fireEvent.click(screen.getByText('Anular'));

        expect(onSolicitarAnulacion).toHaveBeenCalledWith('BOL-200');
    });

    it('no permite anular una boleta ya anulada', () => {
        render(
            <ModalHistorialTurno
                show
                onHide={vi.fn()}
                boletasTurno={[
                    {
                        folio: 'BOL-300',
                        fechaHora: '2026-10-16T12:00:00.000Z',
                        pagos: [{ metodo: 'Efectivo' }],
                        total: 5000,
                        anulada: true
                    }
                ]}
                onReimprimir={vi.fn()}
                onSolicitarAnulacion={vi.fn()}
            />
        );

        expect(screen.getByText('ANULADA')).toBeTruthy();
        expect(screen.queryByText('Anular')).toBeNull();
    });
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});
