import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Carrito() {
    const { cart, subtotal, montoDescuento, montoIva, total, cupon, cambiarCantidad, eliminarDelCarrito, aplicarCupon, procesarPago } = useCart();
    const { user } = useAuth();
    const [inputCupon, setInputCupon] = useState("");
    const navigate = useNavigate();

    const handleAplicarCupon = () => {
        const res = aplicarCupon(inputCupon);
        alert(res.message);
    };

    const handlePagar = () => {
        if (!user) {
            alert("Debes iniciar sesión con tu cuenta para poder procesar la compra.");
            navigate("/login");
            return;
        }
        const res = procesarPago(user);
        alert(res.message);
        if (res.success) navigate("/");
    };

    return (
        <div className="container my-5">
            <h2 className="title-accent mb-4">Mi Carrito de Compras</h2>

            {cart.length === 0 ? (
                <div className="card p-4 text-center border-2 border-dark shadow-sm">
                    <h4>Tu carrito está vacío</h4>
                    <p className="text-muted mb-3">Explora nuestro catálogo para añadir tus figuras favoritas.</p>
                    <div>
                        <Link to="/productos" className="btn btn-primary fw-bold text-uppercase border-2 border-dark">
                            Ver Productos
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    <div className="col-12 col-lg-8">
                        {cart.map(item => (
                            <div key={item.id} className="card mb-3 p-3 border-2 border-dark shadow-sm">
                                <div className="row align-items-center g-3">
                                    <div className="col-3 col-md-2 text-center">
                                        <img src={item.imagen} className="img-fluid rounded border border-dark" alt={item.nombre} style={{ maxHeight: '90px', objectFit: 'contain' }} />
                                    </div>
                                    <div className="col-9 col-md-4">
                                        <h6 className="fw-bold mb-1">{item.nombre}</h6>
                                        <span className="text-muted small">Cód: {item.id}</span><br />
                                        <span className="fw-bold text-primary">${item.precio.toLocaleString('es-CL')}</span>
                                    </div>
                                    <div className="col-6 col-md-3">
                                        <label className="form-label small fw-bold mb-1">Cantidad:</label>
                                        <input
                                            type="number"
                                            className="form-control border-2 border-dark text-center fw-bold"
                                            value={item.cantidad}
                                            min="1"
                                            onChange={(e) => cambiarCantidad(item.id, e.target.value)}
                                        />
                                    </div>
                                    <div className="col-6 col-md-3 text-end">
                                        <div className="fw-bold fs-5 mb-2">${(item.precio * item.cantidad).toLocaleString('es-CL')}</div>
                                        <button className="btn btn-sm btn-danger fw-bold border-2 border-dark" onClick={() => eliminarDelCarrito(item.id)}>
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="col-12 col-lg-4">
                        <div className="card p-4 shadow-sm border-2">
                            <h3 className="fw-bold mb-4">Resumen de Pago</h3>

                            <div className="mb-3">
                                <label className="form-label fw-bold text-uppercase small">CUPÓN DE DESCUENTO:</label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control border-2 border-dark fw-bold"
                                        placeholder="Ingresa código"
                                        value={inputCupon}
                                        onChange={(e) => setInputCupon(e.target.value)}
                                    />
                                    <button type="button" className="btn btn-dark fw-bold border-2 border-dark" onClick={handleAplicarCupon}>
                                        Aplicar
                                    </button>
                                </div>
                            </div>

                            <div className="border-top border-2 border-dark pt-3 mb-3">
                                <h5 className="fw-bold mb-2">Despacho</h5>
                                {user ? (
                                    <div className="alert alert-success border-2 border-dark mb-0 p-2 small">
                                        <strong>Enviar a:</strong> {user.nombre}<br />
                                        <span>{user.direccion ? `${user.direccion}, ${user.comuna || ''}` : 'Dirección no especificada'}</span>
                                    </div>
                                ) : (
                                    <div className="alert alert-warning border-2 border-dark mb-0 p-2 small fw-bold">
                                        Debes iniciar sesión para utilizar el despacho.
                                    </div>
                                )}
                            </div>

                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="fw-bold text-muted small">SUBTOTAL:</span>
                                <span className="fw-bold">${subtotal.toLocaleString('es-CL')}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="fw-bold text-muted small">DESCUENTO:</span>
                                <span className="fw-bold text-success">
                                    {montoDescuento > 0 ? `-$${montoDescuento.toLocaleString('es-CL')} (${cupon})` : '$0'}
                                </span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="fw-bold text-muted small">IVA INCLUIDO (19%):</span>
                                <span className="fw-bold text-secondary">${montoIva.toLocaleString('es-CL')}</span>
                            </div>

                            <hr className="border-dark" />

                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <span className="fw-bold fs-5">TOTAL:</span>
                                <span className="fw-bold fs-3 text-primary">${total.toLocaleString('es-CL')}</span>
                            </div>

                            <button onClick={handlePagar} className="btn btn-success w-100 btn-lg fw-bold">
                                PAGAR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}