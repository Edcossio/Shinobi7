import React, { useState } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';

export default function ModalCobroPOS({ show, onHide, totalVenta, onFinalizarVenta }) {
    const [metodo, setMetodo] = useState("Efectivo");
    const [montoInput, setMontoInput] = useState("");
    const [pagos, setPagos] = useState([]);

    const totalCubierto = pagos.reduce((acc, p) => acc + p.monto, 0);
    const falta = Math.max(0, totalVenta - totalCubierto);

    // Vuelto exclusivo para efectivo
    const pagosEfectivo = pagos.filter(p => p.metodo.toLowerCase().includes("efectivo")).reduce((acc, p) => acc + p.monto, 0);
    const otrosPagos = totalCubierto - pagosEfectivo;
    const restanteParaEfectivo = Math.max(0, totalVenta - otrosPagos);
    const vuelto = Math.max(0, pagosEfectivo - restanteParaEfectivo);

    const handleAgregarPago = () => {
        const montoNum = parseInt(montoInput);
        if (isNaN(montoNum) || montoNum <= 0) {
            return alert("Ingresa un monto válido.");
        }

        const esEfectivo = metodo.toLowerCase().includes("efectivo");
        if (!esEfectivo && montoNum > falta) {
            return alert(`Pagos con ${metodo} no pueden superar el saldo pendiente ($${falta.toLocaleString('es-CL')}).`);
        }

        setPagos([...pagos, { metodo, monto: montoNum }]);
        setMontoInput("");
    };

    const handleEliminarPago = (index) => {
        setPagos(pagos.filter((_, i) => i !== index));
    };

    const handleConfirmarVenta = () => {
        onFinalizarVenta({
            pagos,
            totalCubierto,
            vuelto
        });
        setPagos([]);
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="border-3 border-dark">
            <Modal.Header className="bg-dark text-white border-bottom border-3 border-dark" closeButton closeVariant="white">
                <Modal.Title className="fw-black text-uppercase"><i class="bi bi-calculator me-2"></i>Cobro y Registro de Pago</Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-4">
                <div className="row g-3">
                    <div className="col-12 col-md-6 border-end border-2 border-dark pe-md-4">
                        <h6 className="fw-bold text-uppercase border-bottom border-2 border-dark pb-1 mb-3">Forma de Pago Dividido</h6>
                        <div className="mb-3">
                            <label className="form-label fw-bold small">Método de Pago:</label>
                            <Form.Select className="border-2 border-dark fw-bold" value={metodo} onChange={(e) => setMetodo(e.target.value)}>
                                <option value="Efectivo">EFECTIVO</option>
                                <option value="Débito / Redcompra">DÉBITO / REDCOMPRA</option>
                                <option value="Tarjeta de Crédito">TARJETA DE CRÉDITO</option>
                                <option value="Transferencia">TRANSFERENCIA BANCARIA</option>
                            </Form.Select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold small">Monto Recibido:</label>
                            <InputGroup>
                                <InputGroup.Text className="border-2 border-dark fw-bold">$</InputGroup.Text>
                                <Form.Control type="number" className="border-2 border-dark fw-bold fs-5" placeholder={falta} value={montoInput} onChange={(e) => setMontoInput(e.target.value)} />
                                <Button variant="dark" className="fw-bold border-2 border-dark" onClick={handleAgregarPago}>Añadir</Button>
                            </InputGroup>
                        </div>

                        <ul className="list-group border-2 border-dark mt-2" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                            {pagos.map((p, idx) => (
                                <li key={idx} className="list-group-item d-flex justify-content-between align-items-center p-2 small fw-bold">
                                    <span>{p.metodo}: ${p.monto.toLocaleString('es-CL')}</span>
                                    <Button variant="link" className="text-danger p-0" onClick={() => handleEliminarPago(idx)}><i className="bi bi-x-circle-fill"></i></Button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="col-12 col-md-6 ps-md-4 d-flex flex-column justify-content-between">
                        <div>
                            <h6 className="fw-bold text-uppercase border-bottom border-2 border-dark pb-1 mb-3">Resumen de Venta</h6>
                            <div className="d-flex justify-content-between fs-5 fw-bold mb-2">
                                <span>Total a Cobrar:</span>
                                <span className="text-primary">${totalVenta.toLocaleString('es-CL')}</span>
                            </div>
                            <div className="d-flex justify-content-between fs-6 fw-bold mb-2">
                                <span>Total Pagado:</span>
                                <span className="text-success">${totalCubierto.toLocaleString('es-CL')}</span>
                            </div>
                            <div className="d-flex justify-content-between fs-6 fw-bold mb-3">
                                <span>Pendiente:</span>
                                <span className="text-danger">${falta.toLocaleString('es-CL')}</span>
                            </div>

                            <div className="p-3 bg-warning text-dark border-2 border-dark mb-3">
                                <span className="fw-black text-uppercase d-block small">VUELTO A ENTREGAR (SOLO EFECTIVO):</span>
                                <span className="display-6 fw-black">${vuelto.toLocaleString('es-CL')}</span>
                            </div>
                        </div>

                        <Button variant="success" size="lg" className="w-100 fw-black text-uppercase border-3 border-dark" disabled={totalCubierto < totalVenta} onClick={handleConfirmarVenta}>
                            <i className="bi bi-printer-fill me-2"></i>Emitir Boleta y Finalizar
                        </Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
}