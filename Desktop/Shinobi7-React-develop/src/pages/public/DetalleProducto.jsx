import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';

export default function DetalleProducto() {
    const { id } = useParams();
    const { productos } = useProducts();
    const { agregarAlCarrito } = useCart();

    const prod = productos.find(p => p.id === id) || productos[0];
    const [cantidad, setCantidad] = useState(1);

    const imagenes = Array.isArray(prod?.imagenes) && prod.imagenes.length > 0
        ? prod.imagenes
        : [prod?.imagen || '/images/placeholder.jpg'];

    const [imgPrincipal, setImgPrincipal] = useState(imagenes[0]);

    if (!prod) {
        return <div className="container mt-5 text-center">Producto no encontrado.</div>;
    }

    const esCritico = prod.stock <= (prod.stockCritico || 3);
    const recomendados = productos.filter(p => p.id !== prod.id && !p.esProximo).slice(0, 4);

    const handleAgregar = () => {
        const res = agregarAlCarrito(prod.id, Number(cantidad));
        alert(res.message);
    };

    return (
        <div className="container my-5">
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb fw-bold text-uppercase">
                    <li className="breadcrumb-item"><Link to="/" className="text-dark text-decoration-none">Home</Link></li>
                    <li className="breadcrumb-item"><Link to="/productos" className="text-dark text-decoration-none">Catálogo</Link></li>
                    <li className="breadcrumb-item active text-primary" aria-current="page">{prod.nombre}</li>
                </ol>
            </nav>

            <div className="card p-4 border-3 shadow-sm mb-5">
                <div className="row g-4 align-items-center">
                    {/* Galería */}
                    <div className="col-12 col-md-6 text-center">
                        <div className="bg-white border border-dark border-3 p-3 mb-3 d-flex align-items-center justify-content-center" style={{ minHeight: '350px' }}>
                            <img src={imgPrincipal} className="img-fluid" alt={prod.nombre} style={{ maxHeight: '380px', objectFit: 'contain' }} />
                        </div>
                        <div className="d-flex justify-content-center flex-wrap gap-2">
                            {imagenes.map((imgSrc, idx) => (
                                <img
                                    key={idx}
                                    src={imgSrc}
                                    className={`img-miniatura ${imgPrincipal === imgSrc ? 'active' : ''}`}
                                    alt={`Vista ${idx + 1}`}
                                    onClick={() => setImgPrincipal(imgSrc)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Información */}
                    <div className="col-12 col-md-6">
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <span className={`badge ${esCritico ? 'bg-danger text-white' : 'bg-warning text-dark'} border border-dark border-2 fw-black text-uppercase px-2 py-1`}>
                                {esCritico ? 'ÚLTIMOS DISPONIBLES' : '● DISPONIBLE'}
                            </span>
                            <span className="badge bg-dark text-white border border-dark border-2 fw-black text-uppercase px-2 py-1">
                                {prod.categoria || 'Coleccionables'}
                            </span>
                        </div>

                        <h2 className="fw-black text-uppercase display-6 mb-1">{prod.nombre}</h2>
                        <p className="text-muted fw-bold mb-3">
                            FABRICANTE: <span className="text-dark text-uppercase">{prod.marca || prod.fabricante || 'Oficial'}</span> | CÓD: <span className="text-dark">{prod.id}</span>
                        </p>

                        <div className="p-3 bg-light border border-dark border-3 mb-4">
                            <span className="fs-6 text-muted d-block fw-bold text-uppercase">Precio Contado / Débito:</span>
                            <span className="display-5 fw-bold text-primary">${prod.precio.toLocaleString('es-CL')}</span>
                        </div>

                        <p className="text-dark mb-4 leading-relaxed">{prod.descripcion}</p>

                        <div className="row g-2 align-items-center mb-4">
                            <div className="col-auto">
                                <label className="col-form-label fw-bold text-uppercase">CANTIDAD:</label>
                            </div>
                            <div className="col-auto">
                                <input
                                    type="number"
                                    className="form-control border-3 border-dark text-center fw-bold"
                                    value={cantidad}
                                    onChange={(e) => setCantidad(e.target.value)}
                                    min="1"
                                    max={prod.stock}
                                    style={{ width: '90px' }}
                                />
                            </div>
                        </div>

                        <button onClick={handleAgregar} className="btn btn-primary btn-lg w-100 fw-bold border-3 border-dark text-uppercase" disabled={prod.stock <= 0}>
                            {prod.stock <= 0 ? 'PRODUCTO AGOTADO' : 'AÑADIR AL CARRITO'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Relacionados */}
            <section className="mt-5">
                <h3 className="title-accent mb-4">PRODUCTOS RELACIONADOS</h3>
                <div className="row g-4">
                    {recomendados.map(rec => (
                        <div key={rec.id} className="col-12 col-sm-6 col-md-3">
                            <div className="card h-100 border-3 shadow-sm">
                                <Link to={`/detalle/${rec.id}`}>
                                    <img src={rec.imagenes ? rec.imagenes[0] : rec.imagen} className="card-img-top p-2" alt={rec.nombre} style={{ height: '180px', objectFit: 'contain', background: '#fff' }} />
                                </Link>
                                <div className="card-body d-flex flex-column justify-content-between p-3">
                                    <Link to={`/detalle/${rec.id}`} className="text-decoration-none text-dark">
                                        <h6 className="fw-bold text-truncate text-uppercase mb-1">{rec.nombre}</h6>
                                    </Link>
                                    <p className="fw-bold text-primary mb-2">${rec.precio.toLocaleString('es-CL')}</p>
                                    <Link to={`/detalle/${rec.id}`} className="btn btn-outline-dark btn-sm w-100 fw-bold text-uppercase border-2">
                                        VER FICHA
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}