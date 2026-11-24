document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login');
    const nombreUsuarioActivo = document.getElementById('nombre-usuario-activo');

    // Si estamos en dashboard.html, mostrar el nombre del usuario autenticado
    if (nombreUsuarioActivo) {
        const usuarioGuardado = JSON.parse(localStorage.getItem('auth_user') || 'null');
        if (usuarioGuardado) {
            nombreUsuarioActivo.textContent = `${usuarioGuardado.nombre} (${usuarioGuardado.rol})`;
        }
    }

    // Si estamos en index.html, escuchar el envío del formulario de inicio de sesión
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            ocultarAlerta();

            const identificador = document.getElementById('identificador').value.trim();
            const contrasena = document.getElementById('contrasena').value;
            const btnLogin = document.getElementById('btn-login');

            // Validación básica en cliente
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

                // Almacenar token y datos del usuario en localStorage
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