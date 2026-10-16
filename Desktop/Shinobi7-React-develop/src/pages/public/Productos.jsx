import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import ProductCard from '../../components/molecules/ProductCard';

export default function Productos() {
    const { productos } = useProducts();
    const [busqueda, setBusqueda] = useState("");
    const [categoria, setCategoria] = useState("");
    const [orden, setOrden] = useState("defecto");

    // Filtrar excluyendo próximos lanzamientos
    let lista = productos.filter(p => !p.esProximo);

    if (busqueda.trim()) {
        const query = busqueda.toLowerCase().trim();
        lista = lista.filter(p =>
            p.nombre.toLowerCase().includes(query) ||
            (p.marca && p.marca.toLowerCase().includes(query))
        );
    }

    if (categoria) {
        lista = lista.filter(p => p.categoria === categoria);
    }

    if (orden === "menor-mayor") {
        lista.sort((a, b) => a.precio - b.precio);
    } else if (orden === "mayor-menor") {
        lista.sort((a, b) => b.precio - a.precio);
    }

    const hayFiltroActivo = busqueda !== "" || categoria !== "" || orden !== "defecto";

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <h2 className="title-accent mb-0">Catálogo de Figuras</h2>
                {hayFiltroActivo && (
                    <span className="badge bg-dark text-white border border-dark border-2 fw-black text-uppercase px-3 py-2">
                        {lista.length} FIGURAS ENCONTRADAS
                    </span>
                )}
            </div>

            {/* Filtros */}
            <section className="card p-3 mb-5 border-3 shadow-sm bg-white">
                <div className="row g-3 align-items-center">
                    <div className="col-12 col-md-5">
                        <label className="form-label fw-bold text-uppercase small mb-1">Buscar Figura:</label>
                        <input
                            type="text"
                            className="form-control border-3 border-dark fw-bold"
                            placeholder="Ej: Rem, Gojo, Good Smile..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-3">
                        <label className="form-label fw-bold text-uppercase small mb-1">Categoría:</label>
                        <select
                            className="form-select border-3 border-dark fw-bold"
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                        >
                            <option value="">TODAS LAS CATEGORÍAS</option>
                            <option value="Pokemon">POKÉMON</option>
                            <option value="Anime">ANIME</option>
                            <option value="Vocaloid">VOCALOID</option>
                        </select>
                    </div>

                    <div className="col-12 col-sm-6 col-md-4">
                        <label className="form-label fw-bold text-uppercase small mb-1">Ordenar por:</label>
                        <select
                            className="form-select border-3 border-dark fw-bold"
                            value={orden}
                            onChange={(e) => setOrden(e.target.value)}
                        >
                            <option value="defecto">ORDEN POR DEFECTO</option>
                            <option value="menor-mayor">PRECIO: MENOR A MAYOR</option>
                            <option value="mayor-menor">PRECIO: MAYOR A MENOR</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Grilla de Productos */}
            <section className="row g-4 mb-5">
                {lista.length === 0 ? (
                    <div className="col-12">
                        <div className="alert alert-warning text-center border-3 border-dark fw-bold p-4">
                            NO SE ENCONTRARON PRODUCTOS QUE COINCIDAN CON TU BÚSQUEDA.
                        </div>
                    </div>
                ) : (
                    lista.map(prod => (
                        <ProductCard key={prod.id} producto={prod} />
                    ))
                )}
            </section>
        </div>
    );
}