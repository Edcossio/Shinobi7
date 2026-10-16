import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUsuariosBD, saveUsuariosBD, validarCorreo, validarPassword, validarRun } from '../services/dataService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [usersList, setUsersList] = useState([]);

    useEffect(() => {
        const sesionRaw = sessionStorage.getItem("sesionActiva");
        if (sesionRaw) {
            try {
                setUser(JSON.parse(sesionRaw));
            } catch {
                sessionStorage.removeItem("sesionActiva");
            }
        }
        setUsersList(getUsuariosBD());
    }, []);

    const login = (correo, password) => {
        const vCorreo = validarCorreo(correo);
        if (!vCorreo.valido) return { success: false, message: vCorreo.msj };

        const vPass = validarPassword(password);
        if (!vPass.valido) return { success: false, message: vPass.msj };

        const passCodificada = btoa(password);
        const usuarios = getUsuariosBD();

        const usuarioValido = usuarios.find(u =>
            u.correo.toLowerCase() === correo.toLowerCase() &&
            (u.password === password || u.password === passCodificada)
        );

        if (usuarioValido) {
            sessionStorage.setItem("sesionActiva", JSON.stringify(usuarioValido));
            setUser(usuarioValido);
            return { success: true, user: usuarioValido };
        }

        return { success: false, message: "Correo o contraseña incorrectos." };
    };

    const logout = () => {
        sessionStorage.removeItem("sesionActiva");
        setUser(null);
    };

    const registrarUsuario = (nuevoUser) => {
        const vRun = validarRun(nuevoUser.run);
        if (!vRun.valido) return { success: false, message: vRun.msj };

        const vCorreo = validarCorreo(nuevoUser.correo);
        if (!vCorreo.valido) return { success: false, message: vCorreo.msj };

        const vPass = validarPassword(nuevoUser.password);
        if (!vPass.valido) return { success: false, message: vPass.msj };

        let usuarios = getUsuariosBD();
        if (usuarios.some(u => u.correo.toLowerCase() === nuevoUser.correo.toLowerCase())) {
            return { success: false, message: "El correo ingresado ya se encuentra registrado." };
        }

        const usuarioConRol = {
            ...nuevoUser,
            rol: nuevoUser.rol || "Cliente",
            password: btoa(nuevoUser.password)
        };

        usuarios.push(usuarioConRol);
        saveUsuariosBD(usuarios);
        setUsersList(usuarios);

        return { success: true, message: "Registro completado con éxito." };
    };

    const actualizarUsuario = (correoTarget, datosActualizados) => {
        let usuarios = getUsuariosBD();
        const idx = usuarios.findIndex(u => u.correo.toLowerCase() === correoTarget.toLowerCase());
        if (idx === -1) return { success: false, message: "Usuario no encontrado." };

        usuarios[idx] = { ...usuarios[idx], ...datosActualizados };
        if (datosActualizados.password && datosActualizados.password.trim().length > 0) {
            usuarios[idx].password = btoa(datosActualizados.password);
        }

        saveUsuariosBD(usuarios);
        setUsersList(usuarios);

        if (user && user.correo.toLowerCase() === correoTarget.toLowerCase()) {
            sessionStorage.setItem("sesionActiva", JSON.stringify(usuarios[idx]));
            setUser(usuarios[idx]);
        }

        return { success: true, message: "Usuario actualizado exitosamente." };
    };

    const eliminarUsuario = (correoTarget) => {
        if (user && user.correo.toLowerCase() === correoTarget.toLowerCase()) {
            return { success: false, message: "No puedes eliminar tu propia cuenta mientras está activa." };
        }

        let usuarios = getUsuariosBD();
        usuarios = usuarios.filter(u => u.correo.toLowerCase() !== correoTarget.toLowerCase());
        saveUsuariosBD(usuarios);
        setUsersList(usuarios);

        return { success: true, message: "Usuario eliminado con éxito." };
    };

    return (
        <AuthContext.Provider value={{
            user,
            usersList,
            login,
            logout,
            registrarUsuario,
            actualizarUsuario,
            eliminarUsuario,
            isAdmin: user?.rol?.toLowerCase() === "administrador",
            isVendedor: user?.rol?.toLowerCase() === "vendedor"
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);