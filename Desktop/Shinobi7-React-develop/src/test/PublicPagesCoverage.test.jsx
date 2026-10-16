
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const mocks = vi.hoisted(() => ({
    productos: [],
    agregarAlCarrito: vi.fn(() => ({
        message: 'Producto agregado correctamente'
    })),
    cambiarCantidad: vi.fn(),
    eliminarDelCarrito: vi.fn(),
    aplicarCupon: vi.fn(() => ({
        success: true,
        message: 'Cupón aplicado'
    })),
    procesarPago: vi.fn(() => ({
        success: true,
        message: 'Pago procesado'
    })),
    registrarUsuario: vi.fn(() => ({
        success: true,
        message: 'Registro exitoso'
    })),
    login: vi.fn(() => ({
        success: true,
        message: 'Inicio de sesión exitoso',
        user: {
            nombre: 'Jose',
            rol: 'Cliente'
        }
    })),
    user: null,
    cart: [],
    subtotal: 0,
    montoDescuento: 0,
    montoIva: 0,
    total: 0,
    cupon: ''
}));

vi.mock('../context/ProductContext', () => ({
    useProducts: () => ({
        productos: mocks.productos
    })
}));

vi.mock('../context/CartContext', () => ({
    useCart: () => ({
        cart: mocks.cart,
        subtotal: mocks.subtotal,
        montoDescuento: mocks.montoDescuento,
        montoIva: mocks.montoIva,
        total: mocks.total,
        cupon: mocks.cupon,
        agregarAlCarrito: mocks.agregarAlCarrito,
        cambiarCantidad: mocks.cambiarCantidad,
        eliminarDelCarrito: mocks.eliminarDelCarrito,
        aplicarCupon: mocks.aplicarCupon,
        procesarPago: mocks.procesarPago
    })
}));

vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        user: mocks.user,
        registrarUsuario: mocks.registrarUsuario,
        login: mocks.login
    })
}));

vi.mock('../services/dataService', async (importOriginal) => {
    const actual = await importOriginal();

    return {
        ...actual,
        regionesYComunas: [
            {
                codigo: 'VS',
                region: 'Región de Valparaíso',
                comunas: ['Viña del Mar', 'Valparaíso']
            },
            {
                codigo: 'RM',
                region: 'Región Metropolitana',
                comunas: ['Santiago']
            }
        ]
    };
});

vi.mock('../components/molecules/ProductCard', () => ({
    default: ({ producto }) => React.createElement(
        'article',
        null,
        React.createElement('h4', null, producto.nombre),
        React.createElement('span', null, `$${producto.precio}`)
    )
}));
vi.mock('../components/organisms/ContactForm', () => ({
    default: () => React.createElement('div', null, 'Formulario de contacto de la tienda')
}));

vi.mock('../components/organisms/PublicNavbar', () => ({
    default: () => React.createElement('nav', null, 'Navegación pública')
}));

vi.mock('../components/organisms/PublicFooter', () => ({
    default: () => React.createElement('footer', null, 'Pie de página público')
}));

vi.mock('../components/organisms/AdminTopbar', () => ({
    default: ({ tituloBreadcrumb }) => React.createElement(
        'header',
        null,
        tituloBreadcrumb || 'Administración'
    )
}));

vi.mock('../components/organisms/AdminSidebar', () => ({
    default: () => React.createElement('aside', null, 'Menú administrador')
}));

import Home from '../pages/public/Home';
import Productos from '../pages/public/Productos';
import Contacto from '../pages/public/Contacto';
import Nosotros from '../pages/public/Nosotros';
import DetalleProducto from '../pages/public/DetalleProducto';
import Login from '../pages/public/Login';
import Registro from '../pages/public/Registro';
import Carrito from '../pages/public/Carrito';
import StoreLayout from '../components/templates/StoreLayout';
import AdminLayout from '../components/templates/AdminLayout';

const productoNormal = {
    id: '1',
    nombre: 'Figura Naruto',
    precio: 15000,
    categoria: 'Anime',
    marca: 'Good Smile',
    fabricante: 'Good Smile',
    descripcion: 'Figura de colección',
    imagen: '/naruto.jpg',
    imagenes: ['/naruto.jpg', '/naruto-2.jpg'],
    stock: 10,
    stockCritico: 3,
    destacado: true,
    esProximo: false,
    llegada: 'Próximamente'
};

const productoProximo = {
    ...productoNormal,
    id: '2',
    nombre: 'Figura Próxima',
    esProximo: true,
    destacado: false
};

function renderPage(ui, initialEntry = '/') {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            {ui}
        </MemoryRouter>
    );
}

function llenarRegistro({
    run = '19011022K',
    nombre = 'Jose Pizarro',
    correo = 'jose@example.com',
    password = 'clave123',
    confirmPassword = 'clave123',
    region = 'VS',
    comuna = 'Viña del Mar',
    direccion = 'Calle de prueba 123',
    terminos = true
} = {}) {
    const formulario = screen
        .getByRole('heading', { name: 'Registro de Usuario' })
        .closest('.card')
        .querySelector('form');

    const campos = formulario.querySelectorAll('input');
    const selects = formulario.querySelectorAll('select');

    fireEvent.change(campos[0], { target: { value: run } });
    fireEvent.change(campos[1], { target: { value: nombre } });
    fireEvent.change(campos[2], { target: { value: correo } });
    fireEvent.change(campos[3], { target: { value: password } });
    fireEvent.change(campos[4], { target: { value: confirmPassword } });
    fireEvent.change(selects[0], { target: { value: region } });
    fireEvent.change(selects[1], { target: { value: comuna } });
    fireEvent.change(campos[5], { target: { value: direccion } });

    const checkbox = formulario.querySelector('input[type="checkbox"]');
    if (checkbox.checked !== terminos) {
        fireEvent.click(checkbox);
    }
}
describe('Páginas públicas y layouts', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.productos = [productoNormal, productoProximo];
        mocks.cart = [];
        mocks.user = null;
        mocks.subtotal = 0;
        mocks.montoDescuento = 0;
        mocks.montoIva = 0;
        mocks.total = 0;
        mocks.cupon = '';

        mocks.agregarAlCarrito.mockReturnValue({
            message: 'Producto agregado correctamente'
        });

        mocks.aplicarCupon.mockReturnValue({
            success: true,
            message: 'Cupón aplicado'
        });

        mocks.registrarUsuario.mockReturnValue({
            success: true,
            message: 'Registro exitoso'
        });

        mocks.login.mockReturnValue({
            success: true,
            message: 'Inicio de sesión exitoso',
            user: {
                nombre: 'Jose',
                rol: 'Cliente'
            }
        });
    });

    afterEach(() => {
        cleanup();
    });

    it('Home muestra el encabezado y el enlace al catálogo', () => {
        renderPage(<Home />);

        expect(
            screen.getByText('Figuras de Colección Edición Limitada')
        ).toBeTruthy();

        expect(
            screen.getByRole('link', {
                name: /Ver Catálogo Completo/i
            }).getAttribute('href')
        ).toBe('/productos');
    });

    it('Home muestra próximos lanzamientos y productos destacados', () => {
        renderPage(<Home />);

        expect(screen.getByText('PRÓXIMOS LANZAMIENTOS')).toBeTruthy();
        expect(screen.getByText('Figura Próxima')).toBeTruthy();
        expect(screen.getByText('Lanzamientos Destacados')).toBeTruthy();
        expect(screen.getByText('Figura Naruto')).toBeTruthy();
    });

    it('Productos permite buscar por nombre', () => {
        renderPage(<Productos />);

        fireEvent.change(
            screen.getByPlaceholderText(/Ej: Rem, Gojo/i),
            { target: { value: 'Naruto' } }
        );

        expect(screen.getByText('Figura Naruto')).toBeTruthy();
        expect(screen.queryByText('Figura Próxima')).toBeNull();
    });

    it('Productos permite filtrar por categoría', () => {
        renderPage(<Productos />);

        const selects = screen.getAllByRole('combobox');

        fireEvent.change(selects[0], {
            target: { value: 'Pokemon' }
        });

        expect(
            screen.getByText(/NO SE ENCONTRARON PRODUCTOS/i)
        ).toBeTruthy();
    });

    it('Productos permite ordenar por precio', () => {
        mocks.productos = [
            {
                ...productoNormal,
                id: '1',
                nombre: 'Figura Cara',
                precio: 30000
            },
            {
                ...productoNormal,
                id: '3',
                nombre: 'Figura Barata',
                precio: 5000
            }
        ];
         renderPage(<Productos />);

        const selects = screen.getAllByRole('combobox');

        fireEvent.change(selects[1], {
            target: { value: 'menor-mayor' }
        });

        const articulos = screen.getAllByRole('article');

        expect(articulos[0].textContent).toContain('Figura Barata');
        expect(articulos[1].textContent).toContain('Figura Cara');
    });

    it('Contacto permite enviar el formulario y limpia los campos', () => {
        renderPage(<Contacto />);

        const inputs = document.querySelectorAll('input');
        const textarea = document.querySelector('textarea');

        fireEvent.change(inputs[0], {
            target: { value: 'Jose Pizarro' }
        });

        fireEvent.change(inputs[1], {
            target: { value: 'jose@example.com' }
        });

        fireEvent.change(textarea, {
            target: { value: 'Consulta de prueba' }
        });

        fireEvent.click(
            screen.getByRole('button', { name: /Enviar Mensaje/i })
        );

        expect(window.alert).toHaveBeenCalledWith(
            '¡ÉXITO: Mensaje enviado con éxito!'
        );

        expect(inputs[0].value).toBe('');
        expect(inputs[1].value).toBe('');
        expect(textarea.value).toBe('');
    });

    it('Nosotros muestra la información de la tienda', () => {
        renderPage(<Nosotros />);

        expect(screen.getByText(/SOBRE COLLECTORVAULT/i)).toBeTruthy();
        expect(screen.getByText(/NUESTRA MISIÓN/i)).toBeTruthy();
        expect(screen.getByText(/NUESTRAS SUCURSALES/i)).toBeTruthy();
        expect(
            screen.getByText('Formulario de contacto de la tienda')
        ).toBeTruthy();
    });

    it('DetalleProducto permite cambiar la imagen principal', () => {
        renderPage(
            <Routes>
                <Route
                    path="/detalle/:id"
                    element={<DetalleProducto />}
                />
            </Routes>,
            '/detalle/1'
        );

        expect(
            screen.getByRole('heading', { name: 'Figura Naruto' })
        ).toBeTruthy();

        fireEvent.click(screen.getByAltText('Vista 2'));

        expect(
            screen.getByAltText('Figura Naruto').getAttribute('src')
        ).toBe('/naruto-2.jpg');
    });

    it('DetalleProducto permite añadir el producto al carrito', () => {
        renderPage(
            <Routes>
                <Route
                    path="/detalle/:id"
                    element={<DetalleProducto />}
                />
            </Routes>,
            '/detalle/1'
        );

        fireEvent.click(
            screen.getByRole('button', {
                name: /AÑADIR AL CARRITO/i
            })
        );
         expect(mocks.agregarAlCarrito).toHaveBeenCalled();
    });

    it('DetalleProducto informa si el producto no existe', () => {
        mocks.productos = [];

        renderPage(
            <Routes>
                <Route
                    path="/detalle/:id"
                    element={<DetalleProducto />}
                />
            </Routes>,
            '/detalle/1'
        );

        expect(
            screen.getByText('Producto no encontrado.')
        ).toBeTruthy();
    });

    it('Login muestra el formulario de acceso', () => {
        renderPage(<Login />);

        expect(screen.getByText(/Iniciar Sesión/i)).toBeTruthy();
        expect(
            screen.getByRole('button', { name: /Ingresar/i })
        ).toBeTruthy();

        expect(
            screen.getByRole('link', { name: /Regístrate aquí/i })
                .getAttribute('href')
        ).toBe('/registro');
    });

    it('Login inicia sesión y redirige al inicio para un cliente', () => {
        renderPage(
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<h1>Inicio de la tienda</h1>} />
            </Routes>,
            '/login'
        );

        const inputs = document.querySelectorAll('input');

        fireEvent.change(inputs[0], {
            target: { value: 'jose@example.com' }
        });

        fireEvent.change(inputs[1], {
            target: { value: 'clave123' }
        });

        fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

        expect(mocks.login).toHaveBeenCalledWith(
            'jose@example.com',
            'clave123'
        );

        expect(window.alert).toHaveBeenCalledWith(
            '¡Bienvenido/a de vuelta, Jose!'
        );

        expect(screen.getByText('Inicio de la tienda')).toBeTruthy();
    });

    it.each(['Administrador', 'Vendedor'])(
        'Login redirige al panel para el rol %s',
        (rol) => {
            mocks.login.mockReturnValue({
                success: true,
                message: 'Inicio correcto',
                user: {
                    nombre: 'Jose',
                    rol
                }
            });

            renderPage(
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/admin/productos"
                        element={<h1>Panel de productos</h1>}
                    />
                </Routes>,
                '/login'
            );

            const inputs = document.querySelectorAll('input');

            fireEvent.change(inputs[0], {
                target: { value: 'admin@example.com' }
            });
             fireEvent.change(inputs[1], {
                target: { value: 'clave123' }
            });

            fireEvent.click(
                screen.getByRole('button', { name: /Ingresar/i })
            );

            expect(
                screen.getByText('Panel de productos')
            ).toBeTruthy();
        }
    );

    it('Login muestra un error cuando las credenciales son incorrectas', () => {
        mocks.login.mockReturnValue({
            success: false,
            message: 'Credenciales incorrectas'
        });

        renderPage(<Login />);

        const inputs = document.querySelectorAll('input');

        fireEvent.change(inputs[0], {
            target: { value: 'incorrecto@example.com' }
        });

        fireEvent.change(inputs[1], {
            target: { value: 'incorrecta' }
        });

        fireEvent.click(
            screen.getByRole('button', { name: /Ingresar/i })
        );

        expect(window.alert).toHaveBeenCalledWith(
            'ERROR: Credenciales incorrectas'
        );
    });

    it('Registro muestra sus campos principales', () => {
        renderPage(<Registro />);

        expect(screen.getByText('Registro de Usuario')).toBeTruthy();
        expect(screen.getByPlaceholderText('Ej: 19011022K')).toBeTruthy();
        expect(
            screen.getByText(/TÉRMINOS Y CONDICIONES/i)
        ).toBeTruthy();
    });

    it('Registro informa si las contraseñas no coinciden', () => {
        renderPage(<Registro />);

        llenarRegistro({
            password: 'clave123',
            confirmPassword: 'otra456'
        });

        fireEvent.click(
            screen.getByRole('button', { name: /Registrarse/i })
        );

        expect(window.alert).toHaveBeenCalledWith(
            'Las contraseñas no coinciden.'
        );

        expect(mocks.registrarUsuario).not.toHaveBeenCalled();
    });

    it('Registro exige aceptar los términos y condiciones', () => {
        renderPage(<Registro />);

        llenarRegistro({ terminos: false });

        fireEvent.click(
            screen.getByRole('button', { name: /Registrarse/i })
        );

        expect(window.alert).toHaveBeenCalledWith(
            'Debes aceptar los Términos y Condiciones.'
        );

        expect(mocks.registrarUsuario).not.toHaveBeenCalled();
    });

    it('Registro permite seleccionar región y actualizar comunas', () => {
    renderPage(<Registro />);

    const selects = screen.getAllByRole('combobox');

    fireEvent.change(selects[0], {
        target: { value: 'VS' }
    });

    expect(
        screen.getByRole('option', { name: 'Viña del Mar' })
    ).toBeTruthy();

    expect(
        screen.getByRole('option', { name: 'Valparaíso' })
    ).toBeTruthy();

    fireEvent.change(selects[0], {
        target: { value: 'RM' }
    });

    expect(
        screen.getByRole('option', { name: 'Santiago' })
    ).toBeTruthy();

    expect(
        screen.queryByRole('option', { name: 'Viña del Mar' })
    ).toBeNull();
});

    it('Carrito vacío muestra un enlace al catálogo', () => {
        renderPage(<Carrito />);

        expect(screen.getByText('Tu carrito está vacío')).toBeTruthy();

        expect(
            screen.getByRole('link', { name: /Ver Productos/i })
                .getAttribute('href')
        ).toBe('/productos');
    });

    it('Carrito permite aplicar un cupón con productos', () => {
        mocks.cart = [{
            id: '1',
            nombre: 'Figura Naruto',
            precio: 15000,
            cantidad: 1,
            imagen: '/naruto.jpg'
        }];

        mocks.subtotal = 15000;
        mocks.total = 15000;

        renderPage(<Carrito />);

        fireEvent.change(
            screen.getByPlaceholderText('Ingresa código'),
            { target: { value: 'SHINOBI10' } }
        );

        fireEvent.click(
            screen.getByRole('button', { name: /Aplicar/i })
        );

        expect(mocks.aplicarCupon).toHaveBeenCalledWith('SHINOBI10');
    });

    it('Carrito solicita iniciar sesión antes de pagar', () => {
        mocks.cart = [{
            id: '1',
            nombre: 'Figura Naruto',
            precio: 15000,
            cantidad: 1,
            imagen: '/naruto.jpg'
        }];

        renderPage(<Carrito />);

        fireEvent.click(
            screen.getByRole('button', { name: /PAGAR/i })
        );

        expect(window.alert).toHaveBeenCalledWith(
            'Debes iniciar sesión con tu cuenta para poder procesar la compra.'
        );
    });

    it('StoreLayout muestra navegación, contenido y pie de página', () => {
        renderPage(
            <Routes>
                <Route element={<StoreLayout />}>
                    <Route
                        path="/"
                        element={<p>Contenido de prueba</p>}
                    />
                </Route>
            </Routes>
        );

        expect(screen.getByText('Navegación pública')).toBeTruthy();
        expect(screen.getByText('Contenido de prueba')).toBeTruthy();
        expect(screen.getByText('Pie de página público')).toBeTruthy();
    });

    it('AdminLayout muestra menú y contenido administrativo', () => {
        renderPage(
            <Routes>
                <Route
                    element={
                        <AdminLayout tituloBreadcrumb="Panel de prueba" />
                    }
                >
                    <Route
                        path="/"
                        element={<p>Contenido administrativo</p>}
                    />
                </Route>
            </Routes>
        );

        expect(screen.getByText('Panel de prueba')).toBeTruthy();
        expect(screen.getByText('Menú administrador')).toBeTruthy();
        expect(screen.getByText('Contenido administrativo')).toBeTruthy();
    });
});
