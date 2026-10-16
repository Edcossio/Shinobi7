import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import {
    productosIniciales,
    usuariosIniciales,
    regionesYComunas,
    CUPONES_VALIDOS,
    getProductosBD,
    saveProductosBD,
    getUsuariosBD,
    saveUsuariosBD,
    validarCorreo,
    validarPassword,
    validarRun,
    validarClaveSupervisorBD,
    getTurnoActivoBD,
    saveTurnoActivoBD,
    getBoletasBD,
    saveBoletasBD,
    registrarLogAuditoriaBD
} from '@/services/dataService';

describe('dataService - Datos iniciales', () => {
    it('comprueba los datos iniciales y los cupones', () => {
        expect(productosIniciales.length).toBeGreaterThan(0);
        expect(usuariosIniciales.length).toBeGreaterThan(0);
        expect(regionesYComunas.length).toBeGreaterThan(0);
        expect(CUPONES_VALIDOS.DUOC10).toBe(0.10);
        expect(CUPONES_VALIDOS.SHINOBI20).toBe(0.20);
        expect(CUPONES_VALIDOS.VAULT15).toBe(0.15);
    });

    it('incluye productos próximos y disponibles', () => {
        expect(productosIniciales.some(p => p.esProximo === true)).toBe(true);
        expect(productosIniciales.some(p => p.stock > 0)).toBe(true);
    });

    it('incluye regiones con comunas', () => {
        expect(regionesYComunas.every(r => r.comunas.length > 0)).toBe(true);
        expect(regionesYComunas.some(r => r.codigo === 'RM')).toBe(true);
    });
});

describe('dataService - Productos', () => {
    beforeEach(() => localStorage.clear());

    it('inicializa productos si no existen', () => {
        expect(getProductosBD()).toEqual(productosIniciales);
        expect(JSON.parse(localStorage.getItem('collector_productos'))).toEqual(productosIniciales);
    });

    it('recupera productos guardados', () => {
        const productos = [{ id: 'TEST-001', nombre: 'Producto', precio: 1000, stock: 4 }];
        localStorage.setItem('collector_productos', JSON.stringify(productos));
        expect(getProductosBD()).toEqual(productos);
    });

    it('guarda productos', () => {
        const productos = [{ id: 'TEST-002', nombre: 'Figura', stock: 3 }];
        saveProductosBD(productos);
        expect(JSON.parse(localStorage.getItem('collector_productos'))).toEqual(productos);
    });

    it('lanza error si el JSON de productos es inválido', () => {
        localStorage.setItem('collector_productos', '{inválido');
        expect(() => getProductosBD()).toThrow();
    });
});

describe('dataService - Usuarios', () => {
    beforeEach(() => localStorage.clear());

    it('inicializa usuarios si no existen', () => {
        expect(getUsuariosBD()).toEqual(usuariosIniciales);
        expect(JSON.parse(localStorage.getItem('collector_usuarios'))).toEqual(usuariosIniciales);
    });

    it('recupera usuarios guardados', () => {
        const usuarios = [{ correo: 'prueba@gmail.com', rol: 'Cliente' }];
        localStorage.setItem('collector_usuarios', JSON.stringify(usuarios));
        expect(getUsuariosBD()).toEqual(usuarios);
    });

    it('guarda usuarios', () => {
        const usuarios = [{ correo: 'nuevo@duoc.cl', rol: 'Cliente' }];
        saveUsuariosBD(usuarios);
        expect(JSON.parse(localStorage.getItem('collector_usuarios'))).toEqual(usuarios);
    });

    it('lanza error si el JSON de usuarios es inválido', () => {
        localStorage.setItem('collector_usuarios', '{inválido');
        expect(() => getUsuariosBD()).toThrow();
    });
});

describe('dataService - Validar correo', () => {
    it.each([
        'alumno@duoc.cl',
        'usuario@gmail.com',
        'admin@shinobi7.cl',
        'ventas@7shinobi.cl',
        'USUARIO@GMAIL.COM'
    ])('acepta el correo permitido %s', correo => {
        expect(validarCorreo(correo).valido).toBe(true);
    });

    it.each(['', null, 'usuario@yahoo.com', 'usuario@hotmail.com'])(
        'rechaza el correo no permitido %s',
        correo => {
            expect(validarCorreo(correo).valido).toBe(false);
        }
    );

    it('rechaza correos de más de 100 caracteres', () => {
        const correo = `${'a'.repeat(91)}@gmail.com`;
        expect(correo.length).toBeGreaterThan(100);
        expect(validarCorreo(correo).valido).toBe(false);
    });
});

describe('dataService - Validar contraseña', () => {
    it('acepta contraseñas de 8 y 32 caracteres', () => {
        expect(validarPassword('12345678').valido).toBe(true);
        expect(validarPassword('a'.repeat(32)).valido).toBe(true);
    });

    it('rechaza contraseñas cortas o largas', () => {
        expect(validarPassword('1234567').valido).toBe(false);
        expect(validarPassword('a'.repeat(33)).valido).toBe(false);
    });

    it('rechaza valores vacíos o ausentes', () => {
        expect(validarPassword('').valido).toBe(false);
        expect(validarPassword(null).valido).toBe(false);
    });
});

describe('dataService - Validar RUN', () => {
    it('acepta RUN con formato permitido', () => {
        expect(validarRun('1234567').valido).toBe(true);
        expect(validarRun('19011022K').valido).toBe(true);
        expect(validarRun('19011022k').valido).toBe(true);
    });

    it('rechaza RUN con puntos o guion', () => {
        expect(validarRun('19.011.022-K').valido).toBe(false);
        expect(validarRun('19011022-K').valido).toBe(false);
    });

    it('rechaza RUN vacío o de longitud incorrecta', () => {
        expect(validarRun('').valido).toBe(false);
        expect(validarRun(null).valido).toBe(false);
        expect(validarRun('123456').valido).toBe(false);
        expect(validarRun('1234567890').valido).toBe(false);
    });

    it('rechaza letras no permitidas al final', () => {
        expect(validarRun('19011022A').valido).toBe(false);
    });
});

describe('dataService - Clave de supervisor', () => {
    beforeEach(() => localStorage.clear());

    it('rechaza claves vacías o espacios', () => {
        expect(validarClaveSupervisorBD('').valido).toBe(false);
        expect(validarClaveSupervisorBD('   ').valido).toBe(false);
        expect(validarClaveSupervisorBD(null).valido).toBe(false);
    });

    it('acepta la clave del administrador inicial', () => {
        const resultado = validarClaveSupervisorBD('admin1234');
        expect(resultado.valido).toBe(true);
        expect(resultado.admin.rol).toBe('Administrador');
    });

    it('acepta contraseñas guardadas sin codificar', () => {
        localStorage.setItem('collector_usuarios', JSON.stringify([{
            correo: 'admin@shinobi7.cl',
            rol: 'Administrador',
            password: 'clave1234'
        }]));
        expect(validarClaveSupervisorBD('clave1234').valido).toBe(true);
    });

    it('rechaza una clave incorrecta', () => {
        const resultado = validarClaveSupervisorBD('incorrecta');
        expect(resultado.valido).toBe(false);
        expect(resultado.msj).toContain('incorrecta');
    });

    it('no acepta la clave de un vendedor como clave de supervisor', () => {
        localStorage.setItem('collector_usuarios', JSON.stringify([{
            correo: 'vendedor@gmail.com',
            rol: 'Vendedor',
            password: btoa('clave1234')
        }]));
        expect(validarClaveSupervisorBD('clave1234').valido).toBe(false);
    });

    it('acepta el rol administrador sin distinguir mayúsculas', () => {
        localStorage.setItem('collector_usuarios', JSON.stringify([{
            correo: 'admin@shinobi7.cl',
            rol: 'administrador',
            password: btoa('clave1234')
        }]));
        expect(validarClaveSupervisorBD('clave1234').valido).toBe(true);
    });
});

describe('dataService - Turno de caja', () => {
    beforeEach(() => localStorage.clear());

    it('devuelve null si no hay turno activo', () => {
        expect(getTurnoActivoBD()).toBeNull();
    });

    it('guarda y recupera un turno', () => {
        const turno = { id: 'TURNO-001', montoInicial: 50000 };
        saveTurnoActivoBD(turno);
        expect(getTurnoActivoBD()).toEqual(turno);
    });

    it('elimina el turno al guardar null', () => {
        saveTurnoActivoBD({ id: 'TURNO-002' });
        saveTurnoActivoBD(null);
        expect(getTurnoActivoBD()).toBeNull();
        expect(localStorage.getItem('collector_pos_turno_activo')).toBeNull();
    });

    it('elimina el turno al guardar undefined', () => {
        saveTurnoActivoBD({ id: 'TURNO-003' });
        saveTurnoActivoBD(undefined);
        expect(getTurnoActivoBD()).toBeNull();
    });

    it('lanza error si el turno guardado es inválido', () => {
        localStorage.setItem('collector_pos_turno_activo', '{inválido');
        expect(() => getTurnoActivoBD()).toThrow();
    });
});

describe('dataService - Boletas', () => {
    beforeEach(() => localStorage.clear());

    it('devuelve una lista vacía si no hay boletas', () => {
        expect(getBoletasBD()).toEqual([]);
    });

    it('guarda y recupera boletas', () => {
        const boletas = [{ id: 'BOL-001', total: 15000 }, { id: 'BOL-002', total: 25000 }];
        saveBoletasBD(boletas);
        expect(getBoletasBD()).toEqual(boletas);
    });

    it('lanza error si las boletas contienen JSON inválido', () => {
        localStorage.setItem('collector_boletas', '{inválido');
        expect(() => getBoletasBD()).toThrow();
    });
});

describe('dataService - Auditoría', () => {
    beforeEach(() => localStorage.clear());

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('registra una acción con sus datos', () => {
        registrarLogAuditoriaBD('CREAR_PRODUCTO', 'Se creó una figura', 'admin@shinobi7.cl');

        const logs = JSON.parse(localStorage.getItem('collector_audit_logs'));
        expect(logs).toHaveLength(1);
        expect(logs[0].accion).toBe('CREAR_PRODUCTO');
        expect(logs[0].detalle).toBe('Se creó una figura');
        expect(logs[0].usuarioCorreo).toBe('admin@shinobi7.cl');
        expect(logs[0].id).toMatch(/^LOG-/);
        expect(logs[0].fechaHora).toBeTruthy();
    });

    it('usa ANONIMO si no se proporciona correo', () => {
        registrarLogAuditoriaBD('LOGIN', 'Inicio de sesión');
        const logs = JSON.parse(localStorage.getItem('collector_audit_logs'));
        expect(logs[0].usuarioCorreo).toBe('ANONIMO');
    });

    it('conserva los registros anteriores', () => {
        registrarLogAuditoriaBD('LOGIN', 'Inicio', 'usuario@gmail.com');
        registrarLogAuditoriaBD('LOGOUT', 'Cierre', 'usuario@gmail.com');

        const logs = JSON.parse(localStorage.getItem('collector_audit_logs'));
        expect(logs).toHaveLength(2);
        expect(logs[0].accion).toBe('LOGIN');
        expect(logs[1].accion).toBe('LOGOUT');
    });

    it('genera fecha e identificador de auditoría', () => {
        const fecha = new Date('2026-10-16T12:00:00.000Z');
        vi.useFakeTimers();
        vi.setSystemTime(fecha);

        registrarLogAuditoriaBD('PRUEBA', 'Prueba de auditoría', 'test@gmail.com');

        const logs = JSON.parse(localStorage.getItem('collector_audit_logs'));
        expect(logs[0].fechaHora).toBe(fecha.toISOString());
        expect(logs[0].id).toMatch(/^LOG-/);
    });
});
