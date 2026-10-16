import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ModalCobroPOS from '@/components/organisms/ModalCobroPOS';

describe('ModalCobroPOS - Cobros y cálculo de vuelto', () => {
    const onHide = vi.fn();
    const onFinalizarVenta = vi.fn();

    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    const renderModal = (totalVenta = 10000) => {
        return render(
            <ModalCobroPOS
                show={true}
                onHide={onHide}
                totalVenta={totalVenta}
                onFinalizarVenta={onFinalizarVenta}
            />
        );
    };

    it('debería mostrar el total de la venta', () => {
        renderModal(29500);

        const filaTotal = screen.getByText(/Total a Cobrar:/i).closest('div');

        expect(filaTotal).toHaveTextContent('$29.500');
    });

    it('debería calcular el vuelto al pagar en efectivo', () => {
        renderModal(10000);

        fireEvent.change(screen.getByRole('spinbutton'), {
            target: { value: '15000' }
        });

        fireEvent.click(screen.getByRole('button', { name: /Añadir/i }));

        expect(screen.getByText('$5.000')).toBeInTheDocument();
    });

    it('no debería aceptar un monto vacío o igual a cero', () => {
        renderModal(10000);

        const input = screen.getByRole('spinbutton');

        fireEvent.change(input, { target: { value: '0' } });
        fireEvent.click(screen.getByRole('button', { name: /Añadir/i }));

        expect(window.alert).toHaveBeenCalledWith('Ingresa un monto válido.');
    });

    it('debería impedir que un pago con tarjeta supere el saldo pendiente', () => {
        renderModal(10000);

        fireEvent.change(screen.getByRole('combobox'), {
            target: { value: 'Tarjeta de Crédito' }
        });

        fireEvent.change(screen.getByRole('spinbutton'), {
            target: { value: '12000' }
        });

        fireEvent.click(screen.getByRole('button', { name: /Añadir/i }));

        expect(window.alert).toHaveBeenCalledWith(
            'Pagos con Tarjeta de Crédito no pueden superar el saldo pendiente ($10.000).'
        );
        expect(screen.queryByText(/Tarjeta de Crédito: \$12\.000/)).not.toBeInTheDocument();
    });

    it('debería permitir completar el pago y finalizar la venta', () => {
        renderModal(10000);

        fireEvent.change(screen.getByRole('spinbutton'), {
            target: { value: '10000' }
        });

        fireEvent.click(screen.getByRole('button', { name: /Añadir/i }));

        fireEvent.click(
            screen.getByRole('button', { name: /Emitir Boleta y Finalizar/i })
        );

        expect(onFinalizarVenta).toHaveBeenCalledWith({
            pagos: [{ metodo: 'Efectivo', monto: 10000 }],
            totalCubierto: 10000,
            vuelto: 0
        });

        expect(onHide).toHaveBeenCalledTimes(1);
    });

    it('debería permitir eliminar un pago agregado', () => {
        renderModal(10000);

        fireEvent.change(screen.getByRole('spinbutton'), {
            target: { value: '5000' }
        });

        fireEvent.click(screen.getByRole('button', { name: /Añadir/i }));

        expect(screen.getByText('Efectivo: $5.000')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: '' }));

        expect(screen.queryByText('Efectivo: $5.000')).not.toBeInTheDocument();
    });

    it('no debería finalizar la venta si el pago es insuficiente', () => {
        renderModal(10000);

        fireEvent.change(screen.getByRole('spinbutton'), {
            target: { value: '5000' }
        });

        fireEvent.click(screen.getByRole('button', { name: /Añadir/i }));

        expect(
            screen.getByRole('button', { name: /Emitir Boleta y Finalizar/i })
        ).toBeDisabled();

        expect(onFinalizarVenta).not.toHaveBeenCalled();
    });
});