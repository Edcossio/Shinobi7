import React from 'react';

export default function PublicFooter() {
    return (
        <footer className="bg-white border-top border-3 border-dark py-4 mt-5">
            <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <p className="fw-bold mb-0 text-uppercase">
                    &copy; 2026 Shinobi7. Todos los derechos reservados.
                </p>

                <div className="d-flex gap-3">
                    <a href="https://wa.me/56912345678" target="_blank" rel="noreferrer" className="social-icon-btn whatsapp" title="WhatsApp">
                        <i className="bi bi-whatsapp"></i>
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon-btn instagram" title="Instagram">
                        <i className="bi bi-instagram"></i>
                    </a>
                    <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon-btn facebook" title="Facebook">
                        <i className="bi bi-facebook"></i>
                    </a>
                </div>
            </div>
        </footer>
    );
}