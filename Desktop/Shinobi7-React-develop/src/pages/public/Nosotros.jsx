import React from 'react';
import ContactForm from '../../components/organisms/ContactForm';

export default function Nosotros() {
    return (
        <div className="container my-5">
            {/* Sección 1: Historia, Misión y Equipo */}
            <div className="card p-4 border-3 shadow-sm bg-white mb-4">
                <h2 className="title-accent mb-3 text-uppercase">SOBRE COLLECTORVAULT</h2>

                <p className="fs-6 leading-relaxed mb-3">
                    CollectorVault nació en 2021 en una pequeña bodega de Santiago por iniciativa de tres amigos coleccionistas apasionados por la cultura pop y la cultura otaku. Frustrados por los extensos tiempos de importación y los embalajes defectuosos de compras en el extranjero, decidieron crear la primera tienda chilena dedicada exclusivamente a la curaduría, inspección y venta garantizada de figuras originales de edición limitada.
                </p>

                <p className="fs-6 leading-relaxed mb-4">
                    Hoy en día, nos hemos consolidado como distribuidores oficiales en Chile de marcas globales como <strong>Good Smile Company, Max Factory, Aniplex y Kadokawa</strong>, ofreciendo a la comunidad piezas exclusivas en PVC, resina y Nendoroids con empaquetado blindado.
                </p>

                <hr className="border-dark opacity-25 my-4" />

                <div className="row g-4">
                    <div className="col-12 col-md-6">
                        <h5 className="fw-bold text-uppercase mb-2">
                            ◆ NUESTRA MISIÓN
                        </h5>
                        <p className="text-muted small mb-0">
                            Ofrecer acceso transparente, autenticidad comprobada y la mejor experiencia de compra a cada coleccionista de la región.
                        </p>
                    </div>

                    <div className="col-12 col-md-6">
                        <h5 className="fw-bold text-uppercase mb-2">
                            ❖ EQUIPO DE DESARROLLO
                        </h5>
                        <p className="text-muted small mb-0">
                            Proyecto desarrollado por el Equipo 7 para la asignatura Desarrollo Fullstack II (Duoc UC).
                        </p>
                    </div>
                </div>
            </div>

            {/* Sección 2: Sucursales y Organismo Formulario */}
            <div className="row g-4">
                <div className="col-12 col-lg-5">
                    <div className="card p-4 border-3 shadow-sm bg-white h-100">
                        <h4 className="fw-black text-uppercase border-bottom border-dark border-2 pb-2 mb-4">
                            📍 NUESTRAS SUCURSALES
                        </h4>

                        <div className="mb-4">
                            <h6 className="fw-bold text-primary mb-1">
                                ◆ SUCURSAL PROVIDENCIA (CENTRAL)
                            </h6>
                            <p className="fw-bold mb-1 small">
                                Condell 1345, Providencia, Región Metropolitana
                            </p>
                            <p className="text-muted small mb-0">
                                Horario: Lunes a Sábado - 10:30 a 19:30 hrs
                            </p>
                        </div>

                        <div className="mb-4">
                            <h6 className="fw-bold text-primary mb-1">
                                ◆ SUCURSAL VIÑA DEL MAR
                            </h6>
                            <p className="fw-bold mb-1 small">
                                Av. Libertad 820, Local 14, Viña del Mar
                            </p>
                            <p className="text-muted small mb-0">
                                Horario: Lunes a Viernes - 11:00 a 20:00 hrs
                            </p>
                        </div>

                        <div>
                            <h6 className="fw-bold text-primary mb-1">
                                ◆ SUCURSAL CONCEPCIÓN
                            </h6>
                            <p className="fw-bold mb-1 small">
                                Barros Arana 631, Concepción, Región del Biobío
                            </p>
                            <p className="text-muted small mb-0">
                                Horario: Lunes a Sábado - 10:00 a 19:00 hrs
                            </p>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-7">
                    {/* Organismo Reutilizable de Formulario */}
                    <ContactForm />
                </div>
            </div>
        </div>
    );
}