import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function ModalBoletaTermica({ show, onHide, boleta }) {
    if (!boleta) return null;

    const montoIva = Math.round(boleta.total - (boleta.total / 1.19));

    // Calcular el total abonado en efectivo si aplica
    const pagosEfectivo = boleta.pagos
        ? boleta.pagos.filter(p => p.metodo.toLowerCase().includes("efectivo")).reduce((acc, p) => acc + p.monto, 0)
        : 0;

    return (
        <Modal show={show} onHide={onHide} centered className="border-3 border-dark">
            <Modal.Header className="bg-dark text-white border-bottom border-3 border-dark" closeButton closeVariant="white">
                <Modal.Title className="fw-black text-uppercase fs-5">
                    <i className="bi bi-receipt me-2"></i>COMPROBANTE DE VENTA
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-4 d-flex justify-content-center bg-light">
                {/* Contenedor estilo Ticket Térmico Punteado */}
                <div
                    id="contenedor-boleta-imprimible"
                    className="ticket-thermal bg-white p-3 shadow-sm"
                    style={{
                        width: '100%',
                        maxWidth: '320px',
                        fontFamily: "'Courier New', Courier, monospace",
                        fontSize: '0.8rem',
                        border: '1px dashed #000',
                        color: '#000'
                    }}
                >
                    <div className="text-center fw-bold border-bottom border-dark border-dashed pb-2 mb-2">
                        <h6 className="fw-black mb-0 text-uppercase" style={{ fontSize: '0.95rem', letterSpacing: '0.5px' }}>
                            SHINOBI7 COLECCIONABLES
                        </h6>
                        <div>R.U.T.: 77.123.456-K</div>
                        <div>Condell 1345, Providencia</div>
                        <strong className="d-block mt-1">BOLETA ELECTRÓNICA: {boleta.folio}</strong>
                    </div>

                    <div className="mb-2 border-bottom border-dark border-dashed pb-2">
                        <div>FECHA: {new Date(boleta.fechaHora).toLocaleString('es-CL')}</div>
                        <div>CAJERO: {boleta.cajeroNombre}</div>
                        <div>TURNO: #{boleta.turnoId}</div>
                    </div>

                    <table className="w-100 mb-2 border-bottom border-dark border-dashed pb-2">
                        <thead>
                            <tr className="border-bottom border-dark">
                                <th className="text-start">ITEM</th>
                                <th className="text-center">CANT</th>
                                <th className="text-end">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {boleta.items.map((i, idx) => (
                                <tr key={idx}>
                                    <td className="text-start">{i.nombre.slice(0, 18)}</td>
                                    <td className="text-center">{i.cantidad}</td>
                                    <td className="text-end">${(i.precio * i.cantidad).toLocaleString('es-CL')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="text-end mb-2 border-bottom border-dark border-dashed pb-2">
                        <div>SUBTOTAL: ${boleta.subtotal.toLocaleString('es-CL')}</div>
                        <div>DESCUENTO: -${(boleta.descuento || 0).toLocaleString('es-CL')}</div>
                        <div>IVA INCLUIDO (19%): ${(boleta.montoIva || montoIva).toLocaleString('es-CL')}</div>
                        <div className="fw-bold fs-6 mt-1">TOTAL: ${boleta.total.toLocaleString('es-CL')}</div>
                    </div>

                    {/* Desglose Formas de Pago y Vuelto */}
                    {boleta.pagos && boleta.pagos.length > 0 && (
                        <div className="mb-2 border-bottom border-dark border-dashed pb-2">
                            <strong className="d-block mb-1 text-uppercase">FORMAS DE PAGO:</strong>
                            {boleta.pagos.map((p, idx) => (
                                <div key={idx} className="d-flex justify-content-between">
                                    <span>{p.metodo}:</span>
                                    <span>${p.monto.toLocaleString('es-CL')}</span>
                                </div>
                            ))}

                            {/* Mostrar Vuelto si hubo pago con efectivo */}
                            {pagosEfectivo > 0 && (
                                <div className="mt-1 pt-1 border-top border-dark border-dashed">
                                    <div className="d-flex justify-content-between">
                                        <span>EFECTIVO RECIBIDO:</span>
                                        <span>${pagosEfectivo.toLocaleString('es-CL')}</span>
                                    </div>
                                    <div className="d-flex justify-content-between fw-bold fs-6 mt-1">
                                        <span>VUELTO:</span>
                                        <span>${(boleta.vuelto || 0).toLocaleString('es-CL')}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="text-center fw-bold mt-3" style={{ fontSize: '0.75rem' }}>
                        *** GRACIAS POR TU COMPRA ***<br />
                        www.shinobi7.cl
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer className="bg-light border-top border-3 border-dark">
                <Button variant="dark" className="fw-bold border-2 border-dark w-100 btn-lg" onClick={() => window.print()}>
                    <i className="bi bi-printer me-2"></i>Imprimir Ticket Térmico
                </Button>
            </Modal.Footer>
        </Modal>
    );
}