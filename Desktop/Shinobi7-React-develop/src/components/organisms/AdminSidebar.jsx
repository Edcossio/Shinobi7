import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar() {
    const { isAdmin } = useAuth();

    return (
        <aside className="admin-sidebar">
            <ul className="admin-nav">
                <li className="nav-cat-title nav-group-active">- Administración</li>

                {isAdmin && (
                    <li>
                        <NavLink to="/admin/home" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                            Dashboard
                        </NavLink>
                    </li>
                )}

                <li>
                    <NavLink to="/admin/productos" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                        Gestión Productos
                    </NavLink>
                </li>

                <li>
                    <Link to="/pos" className="admin-nav-link fw-bold text-success" style={{ backgroundColor: '#eafaf1' }}>
                        <i className="bi bi-calculator me-1"></i> Punto de Venta (POS)
                    </Link>
                </li>

                {isAdmin && (
                    <li>
                        <NavLink to="/admin/usuarios" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                            Gestión Usuarios
                        </NavLink>
                    </li>
                )}

                <hr className="text-white-50 my-2" />
                <li>
                    <Link to="/" className="admin-nav-link">
                        Volver al Home
                    </Link>
                </li>
            </ul>
        </aside>
    );
}