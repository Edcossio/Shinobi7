import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function PublicNavbar() {
    const { user, logout, isAdmin, isVendedor } = useAuth();
    const { totalItems } = useCart();
    const navigate = useNavigate();

    const handleLogout = (e) => {
        e.preventDefault();
        logout();
        alert("Has cerrado sesión exitosamente.");
        navigate("/login");
    };

    // Estilos infalibles en línea para la barra inferior móvil (Evita el azul por defecto y problemas de caché)
    const baseLinkStyle = "text-decoration-none text-center d-flex flex-column justify-content-center align-items-center text-dark";
    const activeLinkStyle = "bg-warning border border-dark border-2 rounded shadow-sm text-dark";

    return (
        <>
            {/* 1. Navbar Superior (Escritorio y Cabecera Móvil) */}
            <nav className="navbar border-bottom border-dark border-3 bg-white sticky-top py-2">
                <div className="container d-flex justify-content-between align-items-center">

                    {/* Logo Principal con 84px de alto */}
                    <Link to="/" className="navbar-brand-logo">
                        <img
                            src="/images/logo.jpg"
                            alt="Shinobi7 Logo"
                            className="img-logo-nav"
                            style={{ height: '84px', width: 'auto', objectFit: 'contain' }}
                        />
                    </Link>

                    {/* Enlaces de Navegación para Escritorio (>= 992px) - ESTILO NEO-BRUTALISTA */}
                    <div className="d-none d-lg-flex align-items-center gap-4">
                        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            HOME
                        </NavLink>

                        <NavLink to="/productos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            PRODUCTOS
                        </NavLink>

                        <NavLink to="/nosotros" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            QUIÉNES SOMOS
                        </NavLink>

                        {/* Botón de Rol Neo-Brutalista */}
                        {isAdmin && (
                            <Link to="/admin/home" className="nav-btn-brutal admin">
                                PANEL ADMIN
                            </Link>
                        )}

                        {isVendedor && (
                            <Link to="/admin/productos" className="nav-btn-brutal">
                                GESTIÓN PRODUCTOS
                            </Link>
                        )}

                        {/* Estado de Sesión (Texto rojo limpio) */}
                        {user ? (
                            <a href="#" onClick={handleLogout} className="text-danger fw-bold text-uppercase text-decoration-none" style={{ fontSize: '0.95rem' }}>
                                CERRAR SESIÓN ({user.nombre?.split(' ')[0]})
                            </a>
                        ) : (
                            <NavLink to="/login" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                INICIAR SESIÓN
                            </NavLink>
                        )}

                        {/* Carrito de Compras en Texto Plano */}
                        <NavLink to="/carrito" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            CARRITO ({totalItems})
                        </NavLink>
                    </div>

                    {/* Acción Rápida en Móvil (< 992px) */}
                    <div className="d-lg-none d-flex align-items-center gap-2">
                        {user ? (
                            <button onClick={handleLogout} className="btn btn-sm btn-outline-danger fw-bold border-2 text-uppercase bg-white">
                                SALIR
                            </button>
                        ) : (
                            <Link to="/login" className="btn btn-sm btn-dark fw-bold border-2 border-dark text-uppercase">
                                LOGIN
                            </Link>
                        )}
                    </div>

                </div>
            </nav>

            {/* 2. Barra de Navegación Inferior Fija para Móviles (< 992px) - FORZADA ABAJO Y SIN AZUL */}
            <nav className="d-block d-lg-none fixed-bottom bg-white border-top border-dark border-3 shadow-lg" style={{ zIndex: 1050, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
                <div className="d-flex justify-content-around align-items-center py-2 px-1">

                    <NavLink to="/" end className={({ isActive }) => `${baseLinkStyle} ${isActive ? activeLinkStyle : ''}`} style={{ flex: 1, padding: '4px 0', margin: '0 4px' }}>
                        <i className="bi bi-house-door-fill d-block mb-1" style={{ fontSize: '1.4rem', lineHeight: '1' }}></i>
                        <span className="fw-black text-uppercase" style={{ fontSize: '0.65rem' }}>HOME</span>
                    </NavLink>

                    <NavLink to="/productos" className={({ isActive }) => `${baseLinkStyle} ${isActive ? activeLinkStyle : ''}`} style={{ flex: 1, padding: '4px 0', margin: '0 4px' }}>
                        <i className="bi bi-grid-fill d-block mb-1" style={{ fontSize: '1.4rem', lineHeight: '1' }}></i>
                        <span className="fw-black text-uppercase" style={{ fontSize: '0.65rem' }}>PRODUCTOS</span>
                    </NavLink>

                    <NavLink to="/nosotros" className={({ isActive }) => `${baseLinkStyle} ${isActive ? activeLinkStyle : ''}`} style={{ flex: 1, padding: '4px 0', margin: '0 4px' }}>
                        <i className="bi bi-info-circle-fill d-block mb-1" style={{ fontSize: '1.4rem', lineHeight: '1' }}></i>
                        <span className="fw-black text-uppercase" style={{ fontSize: '0.65rem' }}>NOSOTROS</span>
                    </NavLink>

                    <NavLink to="/carrito" className={({ isActive }) => `${baseLinkStyle} position-relative ${isActive ? activeLinkStyle : ''}`} style={{ flex: 1, padding: '4px 0', margin: '0 4px' }}>
                        <i className="bi bi-cart-fill d-block mb-1" style={{ fontSize: '1.4rem', lineHeight: '1' }}></i>
                        <span className="fw-black text-uppercase" style={{ fontSize: '0.65rem' }}>CARRITO</span>
                        {totalItems > 0 && (
                            <span className="position-absolute top-0 start-50 translate-middle-x badge bg-danger text-white border border-dark border-2 rounded-pill shadow-sm" style={{ fontSize: '0.65rem', marginTop: '-4px' }}>
                                {totalItems}
                            </span>
                        )}
                    </NavLink>

                </div>
            </nav>
        </>
    );
}