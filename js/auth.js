document.addEventListener('DOMContentLoaded', async () => {
    const formLogin = document.getElementById('form-login');
    const btnLogout = document.getElementById('btn-logout');
    const nombreUsuarioActivo = document.getElementById('nombre-usuario-activo');

    // --- LÓGICA EN DASHBOARD (Validar sesión activa y cargar datos) ---
    if (nombreUsuarioActivo) {
        const token = localStorage.getItem('auth_token');

        if (!token) {
            redirigirALogin();
            return;
        }

        try {
            const respuesta = await apiFetch(API_URLS.AUTH, '/validar-sesion', {
                method: 'GET'
            });

            if (respuesta && respuesta.usuario) {
                localStorage.setItem('auth_user', JSON.stringify(respuesta.usuario));
                nombreUsuarioActivo.textContent = `${respuesta.usuario.nombre} (${respuesta.usuario.rol})`;
            }
        } catch (error) {
            // Si el backend no responde o el token es inválido, redirigir al login
            redirigirALogin();
            return;
        }
    }

    // --- BOTÓN CERRAR SESIÓN ---
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            try {
                btnLogout.disabled = true;
                btnLogout.textContent = 'Saliendo...';

                await apiFetch(API_URLS.AUTH, '/logout', {
                    method: 'POST'
                });
            } catch (error) {
                console.warn('Aviso al cerrar sesión en servidor:', error.message);
            } finally {
                redirigirALogin();
            }
        });
    }

    // --- LÓGICA EN LOGIN ---
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            ocultarAlerta();

            const identificador = document.getElementById('identificador').value.trim();
            const contrasena = document.getElementById('contrasena').value;
            const btnLogin = document.getElementById('btn-login');

            if (!identificador || !contrasena) {
                mostrarAlerta('Por favor completa ambos campos para iniciar sesión.', 'error');
                return;
            }

            try {
                btnLogin.disabled = true;
                btnLogin.textContent = 'Verificando...';

                const respuesta = await apiFetch(API_URLS.AUTH, '/login', {
                    method: 'POST',
                    body: JSON.stringify({ identificador, contrasena })
                });

                localStorage.setItem('auth_token', respuesta.token);
                localStorage.setItem('auth_user', JSON.stringify(respuesta.usuario));

                mostrarAlerta('Bienvenido. Redirigiendo al panel...', 'exito');

                setTimeout(() => {
                    window.location.href = 'pages/dashboard.html';
                }, 600);
            } catch (error) {
                mostrarAlerta(error.message, 'error');
            } finally {
                btnLogin.disabled = false;
                btnLogin.textContent = 'Iniciar Sesión';
            }
        });
    }
});