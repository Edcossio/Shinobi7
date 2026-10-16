import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user } = useAuth();

    if (!user) {
        alert("Acceso denegado: Debes iniciar sesión.");
        return <Navigate to="/login" replace />;
    }

    const rol = (user.rol || "").toLowerCase().trim();

    if (allowedRoles && allowedRoles.length > 0) {
        const tienePermiso = allowedRoles.some(r => r.toLowerCase() === rol);
        if (!tienePermiso) {
            alert("Acceso restringido: No tienes los permisos necesarios.");
            return <Navigate to="/" replace />;
        }
    }

    return children;
}