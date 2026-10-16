import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function GestionUsuarios() {
    const { usersList, registrarUsuario, actualizarUsuario, eliminarUsuario } = useAuth();
    const [busqueda, setBusqueda] = useState('');
    const [editCorreo, setEditCorreo] = useState(null);

    const [form, setForm] = useState({
        run: '', nombre: '', correo: '', password: '', rol: 'Cliente'
    });

    const handleEdit = (u) => {
        setEditCorreo(u.correo);
        setForm({
            run: u.run || '',
            nombre: u.nombre || '',
            correo: u.correo || '',
            password: '',
            rol: u.rol || 'Cliente'
        });
    };

    const handleReset = () => {
        setEditCorreo(null);
        setForm({ run: '', nombre: '', correo: '', password: '', rol: 'Cliente' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editCorreo) {
            const res = actualizarUsuario(editCorreo, {
                run: form.run,
                nombre: form.nombre,
                rol: form.rol,
                password: form.password
            });
            alert(res.message);
        } else {
            const res = registrarUsuario(form);
            alert(res.message);
        }
        handleReset();
    };

    const filtrados = usersList.filter(u =>
        (u.nombre && u.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
        (u.correo && u.correo.toLowerCase().includes(busqueda.toLowerCase()))
    );

    return (
        <div>
            <section className="zte-panel mb-4">
                <h3>{editCorreo ? 'Editar Usuario' : 'Añadir Usuario'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>RUN:</label>
                            <input type="text" className="form-control" value={form.run} onChange={e => setForm({ ...form, run: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Nombre Completo:</label>
                            <input type="text" className="form-control" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Correo Electrónico:</label>
                            <input type="email" className="form-control" value={form.correo} onChange={e => setForm({ ...form, correo: e.target.value })} disabled={!!editCorreo} required />
                        </div>
                        <div className="form-group">
                            <label>Contraseña:</label>
                            <input type="password" className="form-control" placeholder={editCorreo ? 'Opcional si no cambia' : 'Mínimo 8 carac.'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editCorreo} />
                        </div>
                        <div className="form-group">
                            <label>Rol Asignado:</label>
                            <select className="form-select border-2 border-dark" value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
                                <option value="Cliente">Cliente</option>
                                <option value="Vendedor">Vendedor</option>
                                <option value="Administrador">Administrador</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="btn-admin btn-admin-primary me-2">{editCorreo ? 'Actualizar' : 'Guardar'}</button>
                    {editCorreo && <button type="button" className="btn btn-secondary btn-sm" onClick={handleReset}>Cancelar</button>}
                </form>
            </section>

            <section className="zte-panel">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3>Lista de Usuarios</h3>
                    <input type="text" className="form-control form-control-sm border-2 border-dark" style={{ maxWidth: '300px' }} placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                </div>
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>RUN</th>
                                <th>Nombre</th>
                                <th>Correo</th>
                                <th>Rol</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map(u => (
                                <tr key={u.correo}>
                                    <td><strong>{u.run}</strong></td>
                                    <td>{u.nombre}</td>
                                    <td>{u.correo}</td>
                                    <td><span className={`badge ${u.rol === 'Administrador' ? 'bg-danger' : 'bg-secondary'}`}>{u.rol}</span></td>
                                    <td>
                                        <button className="btn btn-sm btn-warning me-1 border border-dark" onClick={() => handleEdit(u)}>Editar</button>
                                        <button className="btn btn-sm btn-danger border border-dark" onClick={() => { const res = eliminarUsuario(u.correo); alert(res.message); }}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}