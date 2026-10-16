import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';
import { getTurnoActivoBD, saveTurnoActivoBD, getBoletasBD, saveBoletasBD, registrarLogAuditoriaBD } from '../../services/dataService';

// Modales React
import ModalAperturaTurno from '../../components/organisms/ModalAperturaTurno';
import ModalCobroPOS from '../../components/organisms/ModalCobroPOS';
import ModalBoletaTermica from '../../components/organisms/ModalBoletaTermica';
import ModalCierreTurno from '../../components/organisms/ModalCierreTurno';
import ModalAuthSupervisor from '../../components/organisms/ModalAuthSupervisor';
import ModalHistorialTurno from '../../components/organisms/ModalHistorialTurno';

export default function POS() {
    const { user } = useAuth();
    const { productos, refrescarProductos } = useProducts();

    const [turno, setTurno] = useState(null);
    const [carritoPOS, setCarritoPOS] = useState([]);
    const [descuentoPorc, setDescuentoPorc] = useState(0);
    const [busqueda, setBusqueda] = useState("");
    const [categoria, setCategoria] = useState("");

    // Modales Controlados por Estado React
    const [showApertura, setShowApertura] = useState(false);
    const [showCobro, setShowCobro] = useState(false);
    const [showBoleta, setShowBoleta] = useState(false);
    const [showCierre, setShowCierre] = useState(false);
    const [showSupervisor, setShowSupervisor] = useState(false);
    const [showHistorial, setShowHistorial] = useState(false);

    const [boletaImprimir, setBoletaImprimir] = useState(null);
    const [boletaAnularFolio, setBoletaAnularFolio] = useState(null);

    useEffect(() => {
        setTurno(getTurnoActivoBD());
    }, []);

    // --- ACCIONES DE CAJA ---
    const handleConfirmarApertura = (montoInicial) => {
        const nuevoTurno = {
            id: "TRN-" + Date.now().toString().slice(-6),
            cajeroCorreo: user.correo,
            cajeroNombre: user.nombre,
            montoInicial,
            fechaApertura: new Date().toISOString(),
            estado: "ABIERTO"
        };
        saveTurnoActivoBD(nuevoTurno);
        setTurno(nuevoTurno);
        registrarLogAuditoriaBD("APERTURA_TURNO", `Apertura #${nuevoTurno.id} $${montoInicial}`, user.correo);
        alert(`¡Turno #${nuevoTurno.id} abierto!`);
    };

    const handleConfirmarCierre = (montoDeclarado) => {
        saveTurnoActivoBD(null);
        setTurno(null);
        registrarLogAuditoriaBD("ARQUEO_CERRADO", `Declarado $${montoDeclarado}`, user.correo);
        alert("Turno de caja cerrado correctamente.");
    };

    // --- CARRITO POS ---
    const handleAgregarItem = (prod) => {
        if (!turno) return alert("Debes abrir turno primero.");
        const item = carritoPOS.find(i => i.id === prod.id);
        const cantActual = item ? item.cantidad : 0;
        if (cantActual + 1 > prod.stock) return alert("Stock insuficiente.");

        if (item) {
            setCarritoPOS(carritoPOS.map(i => i.id === prod.id ? { ...i, cantidad: i.cantidad + 1 } : i));
        } else {
            setCarritoPOS([...carritoPOS, { ...prod, cantidad: 1, stockMax: prod.stock }]);
        }
    };

    const subtotalPOS = carritoPOS.reduce((acc, i) => acc + (i.precio * i.cantidad), 0);
    const montoDescPOS = Math.round(subtotalPOS * descuentoPorc);
    const totalPOS = subtotalPOS - montoDescPOS;

    const handleFinalizarVenta = ({ pagos, vuelto }) => {
        const folio = "BOL-" + Date.now().toString().slice(-7);
        const nuevaBoleta = {
            folio,
            turnoId: turno.id,
            cajeroCorreo: user.correo,
            cajeroNombre: user.nombre,
            fechaHora: new Date().toISOString(),
            items: [...carritoPOS],
            subtotal: subtotalPOS,
            descuento: montoDescPOS,
            total: totalPOS,
            vuelto,
            pagos,
            anulada: false
        };

        const boletas = getBoletasBD();
        boletas.push(nuevaBoleta);
        saveBoletasBD(boletas);

        setCarritoPOS([]);
        refrescarProductos();
        setBoletaImprimir(nuevaBoleta);
        setShowBoleta(true);
    };

    const handleAnularAutorizado = (adminUser) => {
        let boletas = getBoletasBD();
        const idx = boletas.findIndex(b => b.folio === boletaAnularFolio);
        if (idx !== -1) {
            boletas[idx].anulada = true;
            saveBoletasBD(boletas);
            refrescarProductos();
            alert(`¡Boleta ${boletaAnularFolio} anulada exitosamente!`);
        }
    };

    // Filtrar catálogo
    let disponibles = productos.filter(p => !p.esProximo);
    if (busqueda) disponibles = disponibles.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.id.toLowerCase().includes(busqueda.toLowerCase()));
    if (categoria) disponibles = disponibles.filter(p => p.categoria === categoria);

    return (
        <div className="bg-light min-vh-100">
            {/* Header POS */}
            <header className="zte-topbar">
                <span className="badge bg-warning text-dark border fw-bold me-2">POS CAJA</span>
                <span className={`badge ${turno ? 'bg-success' : 'bg-danger'} text-white fw-bold`}>
                    {turno ? `TURNO ABIERTO (#${turno.id})` : 'TURNO CERRADO'}
                </span>
                <span className="small text-white ms-auto">Cajero: {user?.nombre}</span>
            </header>

            {/* Estructura Responsiva para Tablet y PC */}
            <div className="container-fluid py-2">
                <div className="card p-2 border-2 border-dark mb-3 bg-white shadow-sm">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div className="d-flex gap-2 flex-wrap">
                            <button
                                className="btn btn-sm btn-success fw-bold border-2 border-dark"
                                onClick={() => setShowApertura(true)}
                                disabled={!!turno}
                                style={{ minHeight: '40px' }}
                            >
                                <i className="bi bi-door-open me-1"></i> Abrir Turno
                            </button>
                            <button
                                className="btn btn-sm btn-danger fw-bold border-2 border-dark"
                                onClick={() => setShowCierre(true)}
                                disabled={!turno}
                                style={{ minHeight: '40px' }}
                            >
                                <i className="bi bi-lock me-1"></i> Arqueo / Cierre
                            </button>
                            <button
                                className="btn btn-sm btn-outline-dark fw-bold border-2"
                                onClick={() => setShowHistorial(true)}
                                disabled={!turno}
                                style={{ minHeight: '40px' }}
                            >
                                <i className="bi bi-receipt me-1"></i> Ventas
                            </button>
                        </div>
                        <Link to="/admin/productos" className="btn btn-sm btn-dark fw-bold border-2 ms-auto">
                            Volver a Inventario
                        </Link>
                    </div>
                </div>

                <div className="row g-3">
                    {/* Catálogo de Figuras */}
                    <div className="col-12 col-md-7 col-lg-8">
                        <div className="card p-3 border-3 border-dark bg-white shadow-sm h-100">
                            <div className="row g-2 mb-3">
                                <div className="col-12 col-sm-7">
                                    <input
                                        type="text"
                                        className="form-control border-2 border-dark fw-bold"
                                        placeholder="Buscar o escanear código..."
                                        value={busqueda}
                                        onChange={e => setBusqueda(e.target.value)}
                                    />
                                </div>
                                <div className="col-12 col-sm-5">
                                    <select className="form-select border-2 border-dark fw-bold" value={categoria} onChange={e => setCategoria(e.target.value)}>
                                        <option value="">TODAS LAS CATEGORÍAS</option>
                                        <option value="Pokemon">POKÉMON</option>
                                        <option value="Anime">ANIME</option>
                                        <option value="Vocaloid">VOCALOID</option>
                                    </select>
                                </div>
                            </div>

                            <div className="row g-2" style={{ maxHeight: '62vh', overflowY: 'auto' }}>
                                {disponibles.map(prod => {
                                    const imagenUrl = Array.isArray(prod.imagenes) && prod.imagenes.length > 0
                                        ? prod.imagenes[0]
                                        : (prod.imagen || '/images/placeholder.jpg');

                                    return (
                                        <div key={prod.id} className="col-6 col-sm-4 col-md-4 col-lg-3">
                                            <div className="card p-2 h-100 border-2 border-dark shadow-sm text-center bg-white d-flex flex-column justify-content-between">
                                                <div className="bg-light p-1 mb-1 border rounded d-flex align-items-center justify-content-center" style={{ height: '90px' }}>
                                                    <img src={imagenUrl} alt={prod.nombre} style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain' }} />
                                                </div>
                                                <h6 className="fw-bold small text-truncate mb-1" title={prod.nombre}>{prod.nombre}</h6>
                                                <span className="fw-bold text-primary mb-2">${prod.precio.toLocaleString('es-CL')}</span>
                                                <button
                                                    className="btn btn-sm btn-primary border-2 border-dark fw-bold text-uppercase w-100 py-2"
                                                    onClick={() => handleAgregarItem(prod)}
                                                    disabled={prod.stock <= 0}
                                                >
                                                    + Agregar
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Módulo Carrito POS */}
                    <div className="col-12 col-md-5 col-lg-4">
                        <div className="card p-3 border-3 border-dark bg-white shadow-sm d-flex flex-column justify-content-between h-100">
                            <div>
                                <h5 className="fw-black text-uppercase border-bottom border-dark border-2 pb-2 mb-2">
                                    <i className="bi bi-cart-check me-2"></i>CARRITO POS
                                </h5>

                                <div className="border-bottom border-dark mb-2 pb-2" style={{ maxHeight: '35vh', overflowY: 'auto' }}>
                                    {carritoPOS.length === 0 ? (
                                        <p className="text-muted text-center py-4 small fw-bold">Sin productos seleccionados</p>
                                    ) : (
                                        carritoPOS.map(i => (
                                            <div key={i.id} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light border border-dark rounded">
                                                <div style={{ maxWidth: '65%' }}>
                                                    <span className="fw-bold small d-block text-truncate">{i.nombre}</span>
                                                    <span className="small text-muted">${i.precio.toLocaleString('es-CL')} x {i.cantidad}</span>
                                                </div>
                                                <span className="fw-bold text-primary">${(i.precio * i.cantidad).toLocaleString('es-CL')}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="bg-warning p-3 border-2 border-dark mb-3">
                                    <div className="d-flex justify-content-between align-items-center fw-black fs-4 text-dark">
                                        <span>TOTAL:</span>
                                        <span>${totalPOS.toLocaleString('es-CL')}</span>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-success btn-lg w-100 fw-black border-3 border-dark text-uppercase py-3"
                                    disabled={carritoPOS.length === 0 || !turno}
                                    onClick={() => setShowCobro(true)}
                                >
                                    <i className="bi bi-cash-stack me-2"></i> COBRAR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modales React */}
            <ModalAperturaTurno show={showApertura} onHide={() => setShowApertura(false)} onConfirmar={handleConfirmarApertura} />
            <ModalCobroPOS show={showCobro} onHide={() => setShowCobro(false)} totalVenta={totalPOS} onFinalizarVenta={handleFinalizarVenta} />
            <ModalBoletaTermica show={showBoleta} onHide={() => setShowBoleta(false)} boleta={boletaImprimir} />
            <ModalCierreTurno show={showCierre} onHide={() => setShowCierre(false)} onConfirmarCierre={handleConfirmarCierre} />
            <ModalAuthSupervisor show={showSupervisor} onHide={() => setShowSupervisor(false)} motivo="Se requiere autorización para anular la boleta." onAutorizado={handleAnularAutorizado} />
            <ModalHistorialTurno
                show={showHistorial}
                onHide={() => setShowHistorial(false)}
                boletasTurno={getBoletasBD().filter(b => b.turnoId === turno?.id)}
                onReimprimir={(b) => { setBoletaImprimir(b); setShowBoleta(true); }}
                onSolicitarAnulacion={(folio) => { setBoletaAnularFolio(folio); setShowSupervisor(true); }}
            />
        </div>
    );
}