import React, { useState } from 'react';
import { Modal, Button, Form, InputGroup, Alert } from 'react-bootstrap';

export default function ModalCierreTurno({ show, onHide, onConfirmarCierre }) {
    const [montoDeclarado, setMontoDeclarado] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const num = parseInt(montoDeclarado);
        if (isNaN(num) || num < 0) {
            return alert("Ingresa un monto de dinero válido.");
        }
        onConfirmarCierre(num);
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static" className="border-3 border-dark">
            <Modal.Header className="bg-danger text-white border-bottom border-3 border-dark">
                <Modal.Title className="fw-black text-uppercase"><i className="bi bi-shield-lock-fill me-2"></i>Arqueo de Caja a Ciegas</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body className="p-4">
                    <Alert variant="warning" className="border-2 border-dark fw-bold small mb-3">
                        Por protocolo de seguridad, no se muestra el saldo esperado. Cuenta el dinero físico e ingresa el monto total exacto.
                    </Alert>
                    <Form.Label className="fw-bold">Efectivo Físico en Caja Recontado:</Form.Label>
                    <InputGroup className="mb-3">
                        <InputGroup.Text className="border-2 border-dark fw-bold">$</InputGroup.Text>
                        <Form.Control type="number" className="border-2 border-dark fw-bold fs-4" placeholder="0" value={montoDeclarado} onChange={(e) => setMontoDeclarado(e.target.value)} min="0" required />
                    </InputGroup>
                </Modal.Body>
                <Modal.Footer className="bg-light border-top border-3 border-dark">
                    <Button variant="secondary" className="fw-bold border-2 border-dark" onClick={onHide}>Cancelar</Button>
                    <Button type="submit" variant="danger" className="fw-bold border-2 border-dark text-uppercase">Entregar Caja y Cerrar Turno</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}