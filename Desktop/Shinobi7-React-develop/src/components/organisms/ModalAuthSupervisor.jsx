import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { validarClaveSupervisorBD } from '../../services/dataService';

export default function ModalAuthSupervisor({ show, onHide, motivo, onAutorizado }) {
    const [pass, setPass] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const check = validarClaveSupervisorBD(pass);
        if (!check.valido) {
            return alert(check.msj);
        }
        onAutorizado(check.admin);
        setPass('');
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered style={{ maxWidth: '400px' }}>
            <Modal.Header className="bg-warning text-dark border-bottom border-3 border-dark" closeButton>
                <Modal.Title className="fw-black text-uppercase"><i className="bi bi-key-fill me-2"></i>Permiso Supervisor</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body className="p-4">
                    <p className="small fw-bold mb-3">{motivo || 'Esta acción requiere clave de Supervisor.'}</p>
                    <Form.Label className="fw-bold small">Contraseña Supervisor:</Form.Label>
                    <Form.Control type="password" className="border-2 border-dark fw-bold" value={pass} onChange={(e) => setPass(e.target.value)} required />
                </Modal.Body>
                <Modal.Footer className="bg-light border-top border-3 border-dark">
                    <Button type="submit" variant="dark" className="w-100 fw-bold border-2 border-dark">Autorizar Acción</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}