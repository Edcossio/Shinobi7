import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts y Seguridad
import StoreLayout from './components/templates/StoreLayout';
import AdminLayout from './components/templates/AdminLayout';
import ProtectedRoute from './components/organisms/ProtectedRoute';

// Vistas Públicas
import Home from './pages/public/Home';
import Productos from './pages/public/Productos';
import DetalleProducto from './pages/public/DetalleProducto';
import Carrito from './pages/public/Carrito';
import Login from './pages/public/Login';
import Registro from './pages/public/Registro';
import Nosotros from './pages/public/Nosotros';
import Contacto from './pages/public/Contacto';

// Vistas de Administración y POS
import Dashboard from './pages/admin/Dashboard';
import GestionProductos from './pages/admin/GestionProductos';
import GestionUsuarios from './pages/admin/GestionUsuarios';
import POS from './pages/admin/POS';

function App() {
  return (
    <Router>
      <Routes>
        {/* RUTAS PÚBLICAS (STORE) */}
        <Route path="/" element={<StoreLayout />}>
          <Route index element={<Home />} />
          <Route path="productos" element={<Productos />} />
          <Route path="detalle/:id" element={<DetalleProducto />} />
          <Route path="nosotros" element={<Nosotros />} />
          <Route path="contacto" element={<Contacto />} />
          <Route path="carrito" element={<Carrito />} />
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Registro />} />
        </Route>

        {/* RUTAS PROTEGIDAS - PANEL ADMINISTRACIÓN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['Administrador', 'Vendedor']}>
              <AdminLayout tituloBreadcrumb="Administración" />
            </ProtectedRoute>
          }
        >
          <Route path="home" element={<Dashboard />} />
          <Route path="productos" element={<GestionProductos />} />
          <Route
            path="usuarios"
            element={
              <ProtectedRoute allowedRoles={['Administrador']}>
                <GestionUsuarios />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* RUTA PROTEGIDA - PUNTO DE VENTA (POS) */}
        <Route
          path="/pos"
          element={
            <ProtectedRoute allowedRoles={['Administrador', 'Vendedor']}>
              <POS />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;