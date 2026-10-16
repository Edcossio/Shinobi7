import React from 'react';
import { Link } from 'react-router-dom';
import { Carousel, Badge } from 'react-bootstrap';
import { useProducts } from '../../context/ProductContext';
import ProductCard from '../../components/molecules/ProductCard';

export default function Home() {
    const { productos } = useProducts();

    const proximos = productos.filter(p => p.esProximo);
    const destacados = productos.filter(p => p.destacado && !p.esProximo);

    return (
        <div className="container mt-5">
            {/* Sección Hero */}
            <section className="hero-section text-center mb-5 p-4 bg-white border border-secondary rounded">
                <h2 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>Figuras de Colección Edición Limitada</h2>
                <p className="text-muted mb-4 fs-5">
                    Explora el universo de tus animes y videojuegos favoritos con estándares de calidad premium.
                </p>
                <Link to="/productos" className="btn btn-primary px-4 py-2">
                    Ver Catálogo Completo
                </Link>
            </section>

            {/* Carrusel de Próximos Lanzamientos */}
            {proximos.length > 0 && (
                <section className="mb-5">
                    <div className="d-flex align-items-center mb-3">
                        <h3 className="title-accent mb-0">PRÓXIMOS LANZAMIENTOS</h3>
                        <Badge bg="warning" text="dark" className="border border-2 border-dark ms-3 fw-bold fs-6">
                            PRE-ORDER
                        </Badge>
                    </div>

                    <Carousel className="carousel-brutal p-4" variant="dark"> {/* variant="dark" ayuda a que las flechas se vean en fondos claros */}
                        {proximos.map((prod) => (
                            <Carousel.Item key={prod.id}>
                                <div className="row align-items-center g-4">
                                    <div className="col-12 col-md-5 text-center">
                                        <div className="carousel-img-wrapper d-flex align-items-center justify-content-center" style={{ minHeight: '300px' }}>
                                            <img
                                                src={prod.imagenes ? prod.imagenes[0] : prod.imagen}
                                                alt={prod.nombre}
                                                className="img-fluid"
                                                style={{ maxHeight: '300px', objectFit: 'contain' }} // <-- Esto soluciona el desajuste
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-7">
                                        <span className="badge bg-danger text-white border border-dark mb-2 fw-bold">
                                            RESERVA ABIERTA
                                        </span>
                                        <h3 className="fw-black text-uppercase fs-2 mb-1">{prod.nombre}</h3>
                                        <p className="text-muted fw-bold mb-2">
                                            {prod.categoria} — {prod.fabricante || 'Coleccionable'}
                                        </p>
                                        <p className="mb-3">{prod.descripcion}</p>
                                        <div className="d-flex align-items-center gap-3">
                                            <span className="fs-3 fw-bold text-primary">
                                                ${prod.precio.toLocaleString('es-CL')}
                                            </span>
                                            <span className="badge bg-dark text-white p-2 border border-dark">
                                                Llegada: {prod.llegada || 'Próximamente'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Carousel.Item>
                        ))}
                    </Carousel>
                </section>
            )}

            {/* Destacados del Mes */}
            <section className="destacados mb-5">
                <h3 className="title-accent mb-4">Lanzamientos Destacados</h3>
                <div className="row g-4">
                    {destacados.map(prod => (
                        <ProductCard key={prod.id} producto={prod} />
                    ))}
                </div>
            </section>
        </div>
    );
}