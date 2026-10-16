import React from 'react';
import { Modal, Table, Button, Badge } from 'react-bootstrap';

export default function ModalHistorialTurno({ show, onHide, boletasTurno, onReimprimir, onSolicitarAnulacion }) {
    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="border-3 border-dark">
            <Modal.Header className="bg-dark text-white border-bottom border-3 border-dark" closeButton closeVariant="white">
                <Modal.Title className="fw-black text-uppercase"><i className="bi bi-journal-check me-2"></i>Ventas de la Jornada</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-3">
                <Table responsive bordered hover className="border-dark align-middle small">
                    <thead className="table-dark">
                        <tr>
                            <th>Folio</th>
                            <th>Hora</th>
                            <th>Pago</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {boletasTurno.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-3">No hay ventas registradas en este turno.</td></tr>
                        ) : (
                            boletasTurno.map(b => (
                                <tr key={b.folio} className={b.anulada ? 'table-danger' : ''}>
                                    <td><strong>{b.folio}</strong></td>
                                    <td>{new Date(b.fechaHora).toLocaleTimeString('es-CL')}</td>
                                    <td>{b.pagos.map(p => p.metodo).join(', ')}</td>
                                    <td>${b.total.toLocaleString('es-CL')}</td>
                                    <td>{b.anulada ? <Badge bg="danger">ANULADA</Badge> : <Badge bg="success">EMITIDA</Badge>}</td>
                                    <td>
                                        <Button variant="outline-dark" size="sm" className="me-1" onClick={() => onReimprimir(b)}><i className="bi bi-printer"></i></Button>
                                        {!b.anulada && (
                                            <Button variant="danger" size="sm" className="fw-bold" onClick={() => onSolicitarAnulacion(b.folio)}>Anular</Button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </Modal.Body>
        </Modal>
    );
}
