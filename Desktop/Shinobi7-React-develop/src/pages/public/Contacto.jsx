import React, { useState } from 'react';

export default function Contacto() {
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [comentario, setComentario] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("¡ÉXITO: Mensaje enviado con éxito!");
        setNombre('');
        setCorreo('');
        setComentario('');
    };

    return (
        <div className="container my-5" style={{ maxWidth: '600px' }}>
            <div className="card p-4 shadow-sm border-2">
                <h2 className="title-accent text-center mb-4">Formulario de Contacto</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-bold">NOMBRE COMPLETO:</label>
                        <input type="text" className="form-control border-2 border-dark" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold">CORREO ELECTRÓNICO:</label>
                        <input type="email" className="form-control border-2 border-dark" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-bold">COMENTARIO:</label>
                        <textarea className="form-control border-2 border-dark" rows="5" value={comentario} onChange={(e) => setComentario(e.target.value)} required></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary w-100 btn-lg fw-bold">Enviar Mensaje</button>
                </form>
            </div>
        </div>
    );
}