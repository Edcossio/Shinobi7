import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
    const { productos } = useProducts();
    const { usersList } = useAuth();

    const criticos = productos.filter(p => p.stock <= (p.stockCritico || 3));

    return (
        <div>
            <section className="zte-panel mb-4">
                <h3>Principal Dashboard</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--zte-text-muted)', lineHeight: '1.5' }}>
                    Bienvenido al portal de administración de Shinobi7. Desde este panel puedes gestionar el inventario de figuras de colección, verificar stock crítico y asignar roles de acceso.
                </p>
            </section>

            <div className="row g-3">
                <div className="col-12 col-md-4">
                    <div className="zte-panel text-center">
                        <h4 className="fw-bold text-success display-6">{productos.length}</h4>
                        <span className="fw-bold small text-muted">Productos en Inventario</span>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="zte-panel text-center">
                        <h4 className="fw-bold text-danger display-6">{criticos.length}</h4>
                        <span className="fw-bold small text-muted">Productos Stock Crítico</span>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="zte-panel text-center">
                        <h4 className="fw-bold text-primary display-6">{usersList.length}</h4>
                        <span className="fw-bold small text-muted">Usuarios Registrados</span>
                    </div>
                </div>
            </div>
        </div>
    );
}