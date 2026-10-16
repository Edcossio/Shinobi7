import React, { useState } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';

export default function ModalAperturaTurno({ show, onHide, onConfirmar }) {
    const [montoInicial, setMontoInicial] = useState(50000);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (montoInicial < 0 || isNaN(montoInicial)) {
            alert("Ingresa un monto válido igual o mayor a $0.");
            return;
        }
        // Pasamos el valor al padre y cerramos
        onConfirmar(Number(montoInicial));
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered className="border-3 border-dark">
            <Modal.Header className="bg-success text-white border-bottom border-3 border-dark">
                <Modal.Title className="fw-black text-uppercase">
                    <i className="bi bi-door-open-fill me-2"></i>Apertura de Turno / Caja
                </Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body className="p-4">
                    <Form.Label className="fw-bold">
                        Monto Inicial en Efectivo (Fondo de Caja):
                    </Form.Label>
                    <InputGroup className="mb-3">
                        <InputGroup.Text className="border-2 border-dark fw-bold">$</InputGroup.Text>
                        <Form.Control
                            type="number"
                            className="border-2 border-dark fw-bold fs-4"
                            value={montoInicial}
                            onChange={(e) => setMontoInicial(e.target.value)}
                            min="0"
                            required
                        />
                    </InputGroup>
                    <p className="small text-muted mb-0">
                        Declara el saldo inicial en billetes/monedas entregado por el supervisor para dar vueltos.
                    </p>
                </Modal.Body>

                <Modal.Footer className="bg-light border-top border-3 border-dark">
                    <Button
                        type="submit"
                        variant="success"
                        className="fw-bold border-2 border-dark text-uppercase w-100"
                    >
                        Iniciar Jornada de Venta
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}