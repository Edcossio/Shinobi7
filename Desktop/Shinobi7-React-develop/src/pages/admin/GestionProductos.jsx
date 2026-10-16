import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';

export default function GestionProductos() {
    const { productos, agregarProducto, actualizarProducto, eliminarProducto } = useProducts();
    const [busqueda, setBusqueda] = useState('');
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        codigo: '', nombre: '', precio: '', stock: '', critico: '3'
    });

    const handleEdit = (p) => {
        setEditId(p.id);
        setForm({
            codigo: p.id,
            nombre: p.nombre,
            precio: p.precio,
            stock: p.stock,
            critico: p.stockCritico || 3
        });
    };

    const handleReset = () => {
        setEditId(null);
        setForm({ codigo: '', nombre: '', precio: '', stock: '', critico: '3' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editId) {
            const res = actualizarProducto(editId, {
                nombre: form.nombre,
                precio: form.precio,
                stock: form.stock,
                stockCritico: form.critico
            });
            alert(res.message);
        } else {
            const res = agregarProducto({
                id: form.codigo,
                nombre: form.nombre,
                precio: form.precio,
                stock: form.stock,
                stockCritico: form.critico
            });
            alert(res.message);
        }
        handleReset();
    };

    const filtrados = productos.filter(p =>
        p.id.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div>
            {/* Acceso Rápido POS */}
            <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-white border border-dark">
                <div>
                    <h5 className="fw-bold mb-0 text-dark"><i className="bi bi-shop me-2 text-success"></i>Módulo POS</h5>
                    <small className="text-muted">Realiza ventas directas en caja y descuenta stock en tiempo real.</small>
                </div>
                <Link to="/pos" className="btn btn-success fw-bold border-2 border-dark shadow-sm">
                    <i className="bi bi-calculator me-1"></i> Abrir Caja / POS
                </Link>
            </div>

            {/* Formulario */}
            <section className="zte-panel mb-4">
                <h3>{editId ? 'Editar Producto' : 'Configuración Productos'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Código (min. 3 caracteres):</label>
                            <input type="text" className="form-control" value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} disabled={!!editId} required />
                        </div>
                        <div className="form-group">
                            <label>Producto:</label>
                            <input type="text" className="form-control" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Precio (CLP):</label>
                            <input type="number" className="form-control" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Stock:</label>
                            <input type="number" className="form-control" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Pocas Unidades:</label>
                            <input type="number" className="form-control" value={form.critico} onChange={e => setForm({ ...form, critico: e.target.value })} required />
                        </div>
                    </div>
                    <button type="submit" className="btn-admin btn-admin-primary me-2">
                        {editId ? 'Actualizar Producto' : 'Agregar Producto'}
                    </button>
                    {editId && (
                        <button type="button" className="btn btn-secondary btn-sm" onClick={handleReset}>Cancelar</button>
                    )}
                </form>
            </section>

            {/* Tabla */}
            <section className="zte-panel">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <h3 className="mb-0">Tabla de Inventario</h3>
                    <input type="text" className="form-control form-control-sm border-2 border-dark" style={{ maxWidth: '300px' }} placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                </div>
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Producto</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Estado</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map(p => (
                                <tr key={p.id}>
                                    <td><strong>{p.id}</strong></td>
                                    <td>{p.nombre}</td>
                                    <td>${p.precio.toLocaleString('es-CL')}</td>
                                    <td>{p.stock}</td>
                                    <td>
                                        {p.stock <= (p.stockCritico || 3) ? (
                                            <span className="badge bg-danger text-uppercase">CRÍTICO ({p.stock})</span>
                                        ) : (
                                            <span className="badge bg-success text-uppercase">OK ({p.stock})</span>
                                        )}
                                    </td>
                                    <td>
                                        <button className="btn btn-sm btn-warning me-1 fw-bold border border-dark" onClick={() => handleEdit(p)}>Editar</button>
                                        <button className="btn btn-sm btn-danger fw-bold border border-dark" onClick={() => { if (confirm(`¿Eliminar ${p.id}?`)) eliminarProducto(p.id); }}>Eliminar</button>
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