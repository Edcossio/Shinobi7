import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { regionesYComunas } from '../../services/dataService';

export default function Registro() {
    const { registrarUsuario } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        run: '', nombre: '', correo: '', password: '', confirmPassword: '',
        telefono: '', region: '', comuna: '', direccion: '', terminos: false
    });

    const [comunasDisponibles, setComunasDisponibles] = useState([]);

    const handleRegionChange = (e) => {
        const regCod = e.target.value;
        setFormData({ ...formData, region: regCod, comuna: '' });
        const regObj = regionesYComunas.find(r => r.codigo === regCod);
        setComunasDisponibles(regObj ? regObj.comunas : []);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return alert("Las contraseñas no coinciden.");
        }
        if (!formData.terminos) {
            return alert("Debes aceptar los Términos y Condiciones.");
        }

        const res = registrarUsuario(formData);
        if (res.success) {
            alert(res.message);
            navigate("/login");
        } else {
            alert(`ERROR: ${res.message}`);
        }
    };

    return (
        <div className="container my-5" style={{ maxWidth: '650px' }}>
            <div className="card p-4 shadow-sm border-2">
                <h2 className="title-accent text-center mb-4">Registro de Usuario</h2>
                <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                        <div className="col-12 col-md-6">
                            <label className="form-label fw-bold">RUN (Sin puntos ni guion):</label>
                            <input type="text" className="form-control border-2 border-dark" placeholder="Ej: 19011022K" value={formData.run} onChange={(e) => setFormData({ ...formData, run: e.target.value })} required />
                        </div>
                        <div className="col-12 col-md-6">
                            <label className="form-label fw-bold">NOMBRE COMPLETO:</label>
                            <input type="text" className="form-control border-2 border-dark" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
                        </div>
                        <div className="col-12">
                            <label className="form-label fw-bold">CORREO ELECTRÓNICO:</label>
                            <input type="email" className="form-control border-2 border-dark" value={formData.correo} onChange={(e) => setFormData({ ...formData, correo: e.target.value })} required />
                        </div>
                        <div className="col-12 col-md-6">
                            <label className="form-label fw-bold">CONTRASEÑA:</label>
                            <input type="password" className="form-control border-2 border-dark" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                        </div>
                        <div className="col-12 col-md-6">
                            <label className="form-label fw-bold">CONFIRMAR CONTRASEÑA:</label>
                            <input type="password" className="form-control border-2 border-dark" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required />
                        </div>
                        <div className="col-12 col-md-6">
                            <label className="form-label fw-bold">REGIÓN:</label>
                            <select className="form-select border-2 border-dark" value={formData.region} onChange={handleRegionChange} required>
                                <option value="">Seleccione Región</option>
                                {regionesYComunas.map(r => <option key={r.codigo} value={r.codigo}>{r.region}</option>)}
                            </select>
                        </div>
                        <div className="col-12 col-md-6">
                            <label className="form-label fw-bold">COMUNA:</label>
                            <select className="form-select border-2 border-dark" value={formData.comuna} onChange={(e) => setFormData({ ...formData, comuna: e.target.value })} required>
                                <option value="">Seleccione Comuna</option>
                                {comunasDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="col-12">
                            <label className="form-label fw-bold">DIRECCIÓN DE DESPACHO:</label>
                            <input type="text" className="form-control border-2 border-dark" value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} required />
                        </div>
                        <div className="col-12">
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input border-2 border-dark" id="checkTerminos" checked={formData.terminos} onChange={(e) => setFormData({ ...formData, terminos: e.target.checked })} />
                                <label className="form-check-label fw-bold small" htmlFor="checkTerminos">
                                    Acepto los Términos y Condiciones *
                                </label>
                            </div>
                        </div>
                        <div className="col-12 mt-4">
                            <button type="submit" className="btn btn-primary w-100 btn-lg fw-bold">Registrarse</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
