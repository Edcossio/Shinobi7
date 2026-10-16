import React, { useState } from 'react';

export default function ContactForm() {
    const [contacto, setContacto] = useState({
        nombre: '',
        correo: '',
        asunto: '',
        mensaje: ''
    });

    const handleSubmitContacto = (e) => {
        e.preventDefault();
        alert(`¡Gracias ${contacto.nombre}! Tu consulta sobre "${contacto.asunto || 'General'}" ha sido enviada con éxito.`);
        setContacto({ nombre: '', correo: '', asunto: '', mensaje: '' });
    };

    return (
        <div className="card p-4 border-3 shadow-sm bg-white h-100">
            <h4 className="fw-black text-uppercase border-bottom border-dark border-2 pb-2 mb-4">
                CONTACTA CON NOSOTROS
            </h4>

            <form onSubmit={handleSubmitContacto}>
                <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                        <label className="form-label fw-bold text-uppercase small mb-1">
                            NOMBRE COMPLETO:
                        </label>
                        <input
                            type="text"
                            className="form-control border-2 border-dark fw-bold"
                            placeholder="Ej: Juan Pérez"
                            value={contacto.nombre}
                            onChange={(e) => setContacto({ ...contacto, nombre: e.target.value })}
                            required
                        />
                    </div>

                    <div className="col-12 col-md-6">
                        <label className="form-label fw-bold text-uppercase small mb-1">
                            CORREO ELECTRÓNICO:
                        </label>
                        <input
                            type="email"
                            className="form-control border-2 border-dark fw-bold"
                            placeholder="correo@ejemplo.com"
                            value={contacto.correo}
                            onChange={(e) => setContacto({ ...contacto, correo: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label fw-bold text-uppercase small mb-1">
                        ASUNTO:
                    </label>
                    <select
                        className="form-select border-2 border-dark fw-bold"
                        value={contacto.asunto}
                        onChange={(e) => setContacto({ ...contacto, asunto: e.target.value })}
                        required
                    >
                        <option value="">SELECCIONA UN MOTIVO</option>
                        <option value="Consulta sobre Reserva / Pre-Order">Consulta sobre Reserva / Pre-Order</option>
                        <option value="Estado de Envío / Seguimiento">Estado de Envío / Seguimiento</option>
                        <option value="Garantía y Devoluciones">Garantía y Devoluciones</option>
                        <option value="Contacto Comercial o Distribución">Contacto Comercial o Distribución</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="form-label fw-bold text-uppercase small mb-1">
                        MENSAJE:
                    </label>
                    <textarea
                        className="form-control border-2 border-dark"
                        rows="4"
                        placeholder="Escribe aquí tu consulta..."
                        value={contacto.mensaje}
                        onChange={(e) => setContacto({ ...contacto, mensaje: e.target.value })}
                        required
                    ></textarea>
                </div>

                <button type="submit" className="btn btn-primary w-100 btn-lg fw-bold border-2 border-dark text-uppercase">
                    ENVIAR MENSAJE
                </button>
            </form>
        </div>
    );
}