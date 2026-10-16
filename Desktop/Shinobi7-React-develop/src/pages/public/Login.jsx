import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const res = login(correo, password);
        if (res.success) {
            alert(`¡Bienvenido/a de vuelta, ${res.user.nombre}!`);
            const rol = (res.user.rol || "").toLowerCase();
            if (rol === "administrador" || rol === "vendedor") {
                navigate("/admin/productos");
            } else {
                navigate("/");
            }
        } else {
            alert(`ERROR: ${res.message}`);
        }
    };

    return (
        <div className="container my-5" style={{ maxWidth: '480px' }}>
            <div className="card p-4 shadow-sm border-2">
                <h2 className="title-accent text-center mb-4">Iniciar Sesión</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-bold">CORREO ELECTRÓNICO:</label>
                        <input
                            type="email"
                            className="form-control form-control-lg border-2 border-dark"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-bold">CONTRASEÑA:</label>
                        <input
                            type="password"
                            className="form-control form-control-lg border-2 border-dark"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 btn-lg fw-bold">
                        Ingresar
                    </button>
                </form>

                <div className="text-center mt-4 pt-3 border-top border-2 border-dark">
                    <p className="text-muted mb-2 small fw-bold">¿Aún no tienes una cuenta?</p>
                    <Link to="/registro" className="btn btn-warning w-100 fw-bold text-dark border-2 border-dark">
                        ¡Regístrate aquí!
                    </Link>
                </div>
            </div>
        </div>
    );
}
