import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ producto }) {
    const { agregarAlCarrito } = useCart();

    const esCritico = producto.stock <= (producto.stockCritico || 3);
    const imagenPrincipal = Array.isArray(producto.imagenes) && producto.imagenes.length > 0
        ? producto.imagenes[0]
        : (producto.imagen || '/images/placeholder.jpg');

    const handleAgregar = () => {
        const res = agregarAlCarrito(producto.id, 1);
        alert(res.message);
    };

    return (
        <div className="col-12 col-sm-6 col-md-4 d-flex align-items-stretch">
            <div className="card w-100 shadow-sm border-3">
                <span className={`badge ${esCritico ? 'bg-danger text-white' : 'bg-warning text-dark'} border border-dark border-2 fw-black text-uppercase position-absolute top-0 end-0 m-2`}>
                    {esCritico ? '● ÚLTIMOS DISPONIBLES' : '● DISPONIBLE'}
                </span>

                <Link to={`/detalle/${producto.id}`}>
                    <img
                        src={imagenPrincipal}
                        className="card-img-top p-3"
                        alt={producto.nombre}
                        style={{ height: '280px', objectFit: 'contain', background: '#fff' }}
                    />
                </Link>

                <div className="card-body d-flex flex-column justify-content-between p-3">
                    <div>
                        <span className="badge bg-dark text-white border border-dark mb-2 text-uppercase fw-bold">
                            {producto.categoria || 'Anime'}
                        </span>
                        <Link to={`/detalle/${producto.id}`} className="text-decoration-none text-dark">
                            <h5 className="card-title text-truncate fs-6 fw-bold text-uppercase mb-1">
                                {producto.nombre}
                            </h5>
                        </Link>
                        <p className="text-muted small mb-2">{producto.marca || ''}</p>
                    </div>

                    <div>
                        <p className="fs-4 fw-bold text-primary mb-3">
                            ${producto.precio.toLocaleString('es-CL')}
                        </p>
                        <button
                            onClick={handleAgregar}
                            className="btn btn-primary w-100 fw-bold text-uppercase border-2 border-dark shadow-sm"
                            disabled={producto.stock <= 0}
                        >
                            {producto.stock <= 0 ? 'Agotado' : 'Añadir al Carrito'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}