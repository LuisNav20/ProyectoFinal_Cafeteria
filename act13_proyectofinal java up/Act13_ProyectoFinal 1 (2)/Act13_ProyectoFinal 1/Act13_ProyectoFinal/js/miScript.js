var claveCarrito = 'carrito';
var clavePedidos = 'ordenes';
var claveUsuarios = 'usuarios';
var claveSesion = 'usuarioActivo';
var claveLogueados = 'usuariosLogueados';

function claveCarritoUsuario() {
    var sesion = obtenerSesion();
    if (sesion && sesion.email) {
        return claveCarrito + '_' + sesion.email;
    }
    return '';
}

function cargarCarritoUsuario() {
    var clave = claveCarritoUsuario();
    if (clave === '') return [];
    return cargarJSON(clave, []);
}

function guardarCarritoUsuario(carrito) {
    var clave = claveCarritoUsuario();
    if (clave !== '') {
        guardarJSON(clave, carrito);
    }
}

function cargarJSON(clave, valorPorDefecto) {
    var raw = localStorage.getItem(clave);
    if (!raw) return valorPorDefecto;
    return JSON.parse(raw);
}

function guardarJSON(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
}

function obtenerSesion() {
    var sesionTexto = sessionStorage.getItem(claveSesion);
    if (!sesionTexto) {
        return null;
    }
    return JSON.parse(sesionTexto);
}

function guardarSesion(usuario) {
    sessionStorage.setItem(claveSesion, JSON.stringify(usuario));
    var logueados = cargarJSON(claveLogueados, []);
    var existe = false;
    var i = 0;
    while (i < logueados.length) {
        if (logueados[i].email === usuario.email) {
            existe = true;
        }
        i = i + 1;
    }
    if (!existe) {
        logueados.push(usuario);
        guardarJSON(claveLogueados, logueados);
    }
}

function limpiarSesion() {
    sessionStorage.removeItem(claveSesion);
}

function parsearPrecio(texto) {

    if (!texto) return 0;
    var resultado = '';
    var puntoEncontrado = false;
    for (var i = 0; i < texto.length; i++) {
        var caracter = texto[i];
        if (caracter >= '0' && caracter <= '9') {
            resultado = resultado + caracter;
        } else if (caracter === ',' || caracter === '.') {
            if (!puntoEncontrado) { resultado = resultado + '.'; puntoEncontrado = true; }
        }
    }
    var numero = parseFloat(resultado);
    if (isNaN(numero)) return 0;
    return numero;
}

function formatoFechaSimple() {
    return (new Date()).toDateString();
}

function formatoDinero(n) {
    return '$' + n.toFixed(2) + ' MXN';
}


function actualizarContador() {
    var el = document.getElementById('cartCount');
    if (!el) return;
    var carrito = cargarCarritoUsuario();
    var total = 0;
    for (var i = 0; i < carrito.length; i++) { total += carrito[i].cantidad || 0; }
    el.textContent = total;
}

function mostrarAuth() {
    var area = document.getElementById('authArea');
    if (!area) return;
    var usuario = obtenerSesion();
    if (usuario) {
        area.innerHTML = '<div class="d-flex align-items-center gap-2">' +
            '<a class="btn btn-sm btn-outline-light" href="perfil.html">MI PERFIL</a>' +
            '<span class="text-light">' + usuario.email + '</span>' +
            '<a href="#" id="btnCerrar" class="btn btn-sm btn-outline-light">Cerrar sesión</a>' +
            '</div>';
        var botonCerrar = document.getElementById('btnCerrar');
        if (botonCerrar) { botonCerrar.addEventListener('click', function (e) { e.preventDefault(); cerrarSesion(); }); }
    } else {
        area.innerHTML = '<div class="d-flex align-items-center gap-2">' +
            '<a class="btn btn-sm btn-outline-success" href="login.html">Iniciar sesión</a>' +
            '<a class="btn btn-sm btn-outline-primary" href="registrar.html">Registrarse</a>' +
            '</div>';
    }
}

function cerrarSesion() {
    limpiarSesion();
    mostrarAuth();
    actualizarContador();
    window.location = 'index.html';
}

function agregarAlCarrito(nombre, precio) {
    var carrito = cargarCarritoUsuario();
    var encontrado = null;
    for (var i = 0; i < carrito.length; i++) { if (carrito[i].nombre === nombre) { encontrado = carrito[i]; break; } }
    if (encontrado) { encontrado.cantidad = (encontrado.cantidad || 0) + 1; }
    else { carrito.push({ nombre: nombre, precio: precio, cantidad: 1 }); }
    guardarCarritoUsuario(carrito);
    actualizarContador();
}

function agregarAlCarritoConImagen(nombre, precio, imagen) {
    var carrito = cargarCarritoUsuario();
    var itemEncontrado = null;
    for (var i = 0; i < carrito.length; i++) { if (carrito[i].nombre === nombre && carrito[i].imagen === imagen) { itemEncontrado = carrito[i]; break; } }
    if (itemEncontrado) { itemEncontrado.cantidad = (itemEncontrado.cantidad || 0) + 1; }
    else { carrito.push({ nombre: nombre, precio: precio, cantidad: 1, imagen: imagen || '' }); }
    guardarCarritoUsuario(carrito);
    actualizarContador();
}

function mostrarCarrito() {
    var root = document.getElementById('cartRoot');
    if (!root) return;
    var usuario = obtenerSesion();
    if (!usuario) { window.location = 'login.html'; return; }
    var carrito = cargarCarritoUsuario();
    if (!carrito || carrito.length === 0) { root.innerHTML = '<p class="text-center mt-3">Carrito vacío</p>'; return; }
 
    var html = '<ul class="list-group">';
    for (var i = 0; i < carrito.length; i++) {
        var item = carrito[i];
        var imagenHTML = '';
        if (item.imagen) { imagenHTML = '<img src="' + item.imagen + '" class="img-thumbnail me-3" style="width:64px;height:64px;object-fit:cover" alt="' + item.nombre + '">'; }
        html += '<li class="list-group-item d-flex justify-content-between align-items-center">' +
            '<div class="d-flex align-items-center">' + imagenHTML + '<div><b>' + item.nombre + '</b><br>' + formatoDinero(item.precio) + ' x ' + item.cantidad + '</div></div>' +
            '<div class="d-flex gap-1">' +
            '<button class="btn btn-sm btn-primary" data-acc="sumar" data-i="' + i + '">+</button>' +
            '<button class="btn btn-sm btn-warning" data-acc="restar" data-i="' + i + '">-</button>' +
            '<button class="btn btn-sm btn-danger" data-acc="eliminar" data-i="' + i + '">X</button>' +
            '</div></li>';
    }
    html += '</ul>';
    var total = 0;
    for (var j = 0; j < carrito.length; j++) { total = total + (carrito[j].precio * (carrito[j].cantidad || 0)); }
    html += '<h5 class="mt-3">Total: ' + formatoDinero(total) + '</h5>' +
        '<button id="botonPagar" class="btn btn-success w-100 mt-2">PAGAR</button>';
    root.innerHTML = html;
    var totalEl = document.getElementById('totalCarrito'); if (totalEl) totalEl.textContent = 'Total: ' + formatoDinero(total);
    
    var botones = root.getElementsByTagName('button');
    for (var k = 0; k < botones.length; k++) {
        var accion = botones[k].getAttribute('data-acc');
        if (accion === 'sumar' || accion === 'restar' || accion === 'eliminar') {
            botones[k].addEventListener('click', accionCarrito);
        }
    }
    var botonPagar = document.getElementById('botonPagar'); if (botonPagar) botonPagar.addEventListener('click', function(e){ e.preventDefault(); window.location = 'pago.html'; });
    var botonVaciar = document.getElementById('vaciarCarrito'); if (botonVaciar) { botonVaciar.addEventListener('click', function(){ if (confirm('¿Vaciar el carrito?')) { guardarCarritoUsuario([]); actualizarContador(); mostrarCarrito(); } }); }
}

    function mostrarPago() {
        var root = document.getElementById('paymentRoot');
        if (!root) return;
        var usuarioActivo = obtenerSesion();
        if (!usuarioActivo) { window.location = 'login.html'; return; }
        var carrito = cargarCarritoUsuario();
        if (!carrito || carrito.length === 0) { root.innerHTML = '<p class="text-center mt-3">Carrito vacío</p>'; return; }

        var html = '<div class="row"><div class="col-md-8">';
        html += '<ul class="list-group">';
        var total = 0;
        for (var i = 0; i < carrito.length; i++) {
            var item = carrito[i];
            total += item.precio * (item.cantidad || 0);
            var imagenHTML = '';
            if (item.imagen) imagenHTML = '<img src="' + item.imagen + '" class="img-thumbnail me-3" style="width:80px;height:80px;object-fit:cover" alt="' + item.nombre + '">';
            html += '<li class="list-group-item d-flex align-items-center">' + imagenHTML + '<div><b>' + item.nombre + '</b><br>' + formatoDinero(item.precio) + ' x ' + item.cantidad + '</div></li>';
        }
        html += '</ul>';
        html += '</div>';
        html += '<div class="col-md-4">';
        html += '<div class="card p-3">';
        html += '<h5>Resumen</h5>';
        html += '<p class="mb-1">Total: <strong>' + formatoDinero(total) + '</strong></p>';
        html += '<hr>';
        html += '<h6>Métodos de pago</h6>';
        html += '<div class="list-group mb-3">';
        html += '<label class="list-group-item"><input class="form-check-input me-2" type="radio" name="paymentMethod" value="Tarjeta"><i class="bi bi-credit-card-fill"></i> Tarjeta de crédito/débito</label>';
        html += '<label class="list-group-item"><input class="form-check-input me-2" type="radio" name="paymentMethod" value="PayPal"><i class="bi bi-paypal"></i> PayPal</label>';
        html += '<label class="list-group-item"><input class="form-check-input me-2" type="radio" name="paymentMethod" value="Efectivo"> <i class="bi bi-cash"></i> Efectivo / Contra entrega</label>';
        html += '</div>';
        html += '<button id="confirmarPagoBtnPage" class="btn btn-primary w-100">Confirmar y pagar</button>';
        html += '<a href="carrito.html" class="btn btn-link w-100 mt-2">Volver al carrito</a>';
        html += '</div></div></div>';
        root.innerHTML = html;
        var botonConfirmar = document.getElementById('confirmarPagoBtnPage'); if (botonConfirmar) botonConfirmar.addEventListener('click', function(){ confirmarCompra(); });
    }

function accionCarrito(e) {
    var boton = this;
    var accion = boton.getAttribute('data-acc');
    var indice = parseInt(boton.getAttribute('data-i'));
    var carrito = cargarCarritoUsuario();
    if (!carrito[indice]) return;
    if (accion === 'sumar') { carrito[indice].cantidad = (carrito[indice].cantidad || 0) + 1; }
    else if (accion === 'restar') { carrito[indice].cantidad = (carrito[indice].cantidad || 0) - 1; if (carrito[indice].cantidad <= 0) carrito.splice(indice, 1); }
    else if (accion === 'eliminar') { carrito.splice(indice, 1); }
    guardarCarritoUsuario(carrito);
    actualizarContador();
    mostrarCarrito();
}

function mostrarPerfil() {
    var formulario = document.getElementById('perfilForm');
    if (!formulario) return;
    var sesion = obtenerSesion();
    if (!sesion) { 
        window.location = 'login.html'; 
        return; 
    }
    var usuarios = cargarJSON(claveUsuarios, []);
    var usuario = null;
    for (var i = 0; i < usuarios.length; i++) { 
        if (usuarios[i].email === sesion.email) { 
            usuario = usuarios[i]; 
            break; 
        } 
    }
    if (!usuario) {
        alert('Usuario no encontrado');
        return;
    }
    var nameEl = document.getElementById('perfilName');
    var emailEl = document.getElementById('perfilEmail');
    var passEl = document.getElementById('perfilPassword');
    if (nameEl) nameEl.value = usuario.nombre || '';
    if (emailEl) emailEl.value = usuario.email || '';
    if (passEl) passEl.value = '';
}

function comprar() {

}


function confirmarCompra() {
    var usuarioActivo = obtenerSesion();
    if (!usuarioActivo) { window.location = 'login.html'; return; }
    var carrito = cargarCarritoUsuario();
    if (!carrito || carrito.length === 0) { alert('Carrito vacío'); return; }
    var radiosMetodo = document.getElementsByName('paymentMethod');
    var metodoSeleccionado = 'Desconocido';
    for (var r = 0; r < radiosMetodo.length; r++) {
        if (radiosMetodo[r].checked) { metodoSeleccionado = radiosMetodo[r].value; break; }
    }
    var pedidos = cargarJSON(clavePedidos, []);
    var total = 0; for (var i = 0; i < carrito.length; i++) { total += carrito[i].precio * (carrito[i].cantidad || 0); }
    pedidos.push({ usuario: usuarioActivo.email, items: carrito, total: total, fecha: formatoFechaSimple(), metodoPago: metodoSeleccionado });
    guardarJSON(clavePedidos, pedidos);
    guardarCarritoUsuario([]);
    actualizarContador();
    mostrarCarrito();
    alert('Compra realizada con éxito. Método: ' + metodoSeleccionado);
}

function vincularBotones() {
    var botones = document.querySelectorAll('[data-nombre]');
    for (var i = 0; i < botones.length; i++) {
        botones[i].addEventListener('click', function (e) {
            e.preventDefault();
            var nombreProducto = this.getAttribute('data-nombre');
            var rutaImagen = this.getAttribute('data-img') || '';
            var textoPrecio = this.getAttribute('data-precio');
            var usuarioActivo = obtenerSesion();
            if (!usuarioActivo) { sessionStorage.setItem('intentoAgregar', '1'); window.location = 'login.html'; return; }
            var precioNumero = 0;
            if (textoPrecio) { var num = parseFloat(textoPrecio); if (!isNaN(num)) precioNumero = num; }
            if (rutaImagen) agregarAlCarritoConImagen(nombreProducto || 'Producto', precioNumero, rutaImagen);
            else agregarAlCarrito(nombreProducto || 'Producto', precioNumero);
            alert('Producto agregado al carrito');
         
        });
    }
}

function manejarFormularios() {
    var formularioRegistro = document.getElementById('registerForm');
    if (formularioRegistro) {
        formularioRegistro.addEventListener('submit', function (e) {
            e.preventDefault();
            var email = (document.getElementById('correoRegistro').value || '').trim().toLowerCase();
            var contrasena = document.getElementById('contrasenaRegistro').value || '';
            var nombre = (document.getElementById('nombreRegistro').value || '').trim();
            var mensaje = (document.getElementById('mensajeRegistro').value || '').trim();
            if (!email || !contrasena || !nombre) { alert('Completa todos los campos obligatorios'); return; }
            var usuarios = cargarJSON(claveUsuarios, []);
            for (var i = 0; i < usuarios.length; i++) { if (usuarios[i].email === email) { alert('Ya existe una cuenta con ese correo'); return; } }
            usuarios.push({ nombre: nombre, email: email, pwd: contrasena, mensaje: mensaje });
            guardarJSON(claveUsuarios, usuarios);
            guardarSesion({ email: email });
            mostrarAuth();
            alert('Registro exitoso');
            if (sessionStorage.getItem('intentoAgregar')) { sessionStorage.removeItem('intentoAgregar'); window.location = 'index.html'; }
            else { window.location = 'index.html'; }
        });
    }
    var formularioLogin = document.getElementById('loginForm');
    if (formularioLogin) {
        formularioLogin.addEventListener('submit', function (e) {
            e.preventDefault();
            var email = (document.getElementById('correoLogin').value || '').trim().toLowerCase();
            var contrasena = document.getElementById('contrasenaLogin').value || '';
            if (!email || !contrasena) { alert('Completa todos los campos'); return; }
            var usuarios = cargarJSON(claveUsuarios, []);
            var usuarioEncontrado = null;
            for (var i = 0; i < usuarios.length; i++) { if (usuarios[i].email === email && (usuarios[i].pwd === contrasena || usuarios[i].password === contrasena)) { usuarioEncontrado = usuarios[i]; break; } }
            if (!usuarioEncontrado) { alert('Error Al Iniciar sesion comprueba si tiene una cuenta'); return; }
            guardarSesion({ email: email });
            mostrarAuth();
            alert('Inicio de sesión correcto');
            if (sessionStorage.getItem('intentoAgregar')) { sessionStorage.removeItem('intentoAgregar'); window.location = 'carrito.html'; }
            else { window.location = 'carrito.html'; }
        });
    }

    var formularioPerfil = document.getElementById('perfilForm');
    if (formularioPerfil) {
        formularioPerfil.addEventListener('submit', function (e) {
            e.preventDefault();
            var nombreNuevo = (document.getElementById('perfilName').value || '').trim();
            var emailNuevo = (document.getElementById('perfilEmail').value || '').trim().toLowerCase();
            var contrasenaNueva = document.getElementById('perfilPassword').value || '';
            var sesion = obtenerSesion();
            if (!sesion) { window.location = 'login.html'; return; }
            var usuarios = cargarJSON(claveUsuarios, []);
            var indiceUsuario = -1;
            for (var i = 0; i < usuarios.length; i++) { if (usuarios[i].email === sesion.email) { indiceUsuario = i; break; } }
            if (indiceUsuario === -1) { alert('Usuario no encontrado'); return; }
            if (emailNuevo !== sesion.email) {
                for (var j = 0; j < usuarios.length; j++) { if (usuarios[j].email === emailNuevo) { alert('El correo ya está en uso'); return; } }
            }
            usuarios[indiceUsuario].nombre = nombreNuevo || usuarios[indiceUsuario].nombre;
            usuarios[indiceUsuario].email = emailNuevo || usuarios[indiceUsuario].email;
            if (contrasenaNueva) { usuarios[indiceUsuario].pwd = contrasenaNueva; }
            guardarJSON(claveUsuarios, usuarios);
            guardarSesion({ email: usuarios[indiceUsuario].email });
            mostrarAuth();
            alert('Datos de perfil actualizados');
        });
    }
    var botonLogoutPerfil = document.getElementById('btnLogout');
    if (botonLogoutPerfil) {
        botonLogoutPerfil.addEventListener('click', function (e) {
            e.preventDefault();
            cerrarSesion();
        });
    }
    var formularioContacto = document.getElementById('contactForm');
    if (formularioContacto) {
        formularioContacto.addEventListener('submit', function (e) {
            e.preventDefault();
            var nombreContacto = (document.getElementById('contactName').value || '').trim();
            var emailContacto = (document.getElementById('contactEmail').value || '').trim().toLowerCase();
            var mensajeContacto = (document.getElementById('contactMessage').value || '').trim();
            if (!nombreContacto || !emailContacto || !mensajeContacto) { alert('Completa todos los campos'); return; }
            var mensajes = cargarJSON('mensajesContacto', []);
            mensajes.push({ nombre: nombreContacto, email: emailContacto, mensaje: mensajeContacto, fecha: formatoFechaSimple() });
            guardarJSON('mensajesContacto', mensajes);
            alert('Mensaje enviado. Gracias Por tu comentario.');
            formularioContacto.reset();
        });
    }
}

function iniciar() {
    actualizarContador();
    mostrarAuth();
    mostrarCarrito();
    mostrarPago();
    mostrarPerfil();
    vincularBotones();
    manejarFormularios();
}

document.addEventListener('DOMContentLoaded', iniciar);