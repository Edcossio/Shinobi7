import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminTopbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = (e) => {
        e.preventDefault();
        logout();
        navigate("/login");
    };

    return (
        <header className="bg-success border-bottom border-dark border-3 py-2 px-3">
            <div className="container-fluid d-flex justify-content-between align-items-center flex-wrap gap-2">

                {/* Lado Izquierdo: Logo con Contención Estricta */}
                <div className="d-flex align-items-center">
                    <Link to="/" className="d-flex align-items-center text-decoration-none">
                        <img
                            src="/images/logo.jpg"
                            alt="Shinobi7 Logo"
                            style={{
                                height: '72px',
                                maxHeight: '72px',
                                width: 'auto',
                                display: 'block',
                                objectFit: 'contain'
                            }}
                        />
                    </Link>
                </div>

                {/* Lado Derecho: Usuario y Botón de Salida */}
                <div className="d-flex align-items-center gap-2 ms-auto">
                    {user && (
                        <div className="text-white text-end d-none d-md-block me-1">
                            <span className="fw-bold d-block text-uppercase" style={{ fontSize: '0.82rem', lineHeight: '1.1' }}>
                                {user.nombre}
                            </span>
                            <small className="text-white-50 fw-bold" style={{ fontSize: '0.72rem' }}>
                                ROL: {user.rol}
                            </small>
                        </div>
                    )}

                    <button
                        onClick={handleLogout}
                        className="btn btn-sm btn-danger fw-bold text-uppercase border-2 border-dark shadow-sm px-3 py-1 d-flex align-items-center gap-1"
                        style={{ fontSize: '0.8rem' }}
                    >
                        <i className="bi bi-box-arrow-right"></i>
                        <span>SALIR</span>
                    </button>
                </div>

            </div>
        </header>
    );
}