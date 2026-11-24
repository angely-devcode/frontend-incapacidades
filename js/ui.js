function mostrarAlerta(mensaje, tipo = 'error') {
    const contenedor = document.getElementById('alerta-global');
    if (!contenedor) return;

    contenedor.textContent = mensaje;
    contenedor.className = `alerta alerta-${tipo}`;

    // Ocultar automáticamente después de 4 segundos si es de éxito
    if (tipo === 'exito') {
        setTimeout(() => {
            contenedor.classList.add('oculto');
        }, 4000);
    }
}

function ocultarAlerta() {
    const contenedor = document.getElementById('alerta-global');
    if (contenedor) {
        contenedor.classList.add('oculto');
    }
}

// Navegación entre módulos en dashboard.html
document.addEventListener('DOMContentLoaded', () => {
    const botonesNav = document.querySelectorAll('.nav-btn');
    const vistasModulo = document.querySelectorAll('.modulo-vista');

    botonesNav.forEach((boton) => {
        boton.addEventListener('click', () => {
            const moduloDestino = boton.dataset.modulo;

            botonesNav.forEach((b) => b.classList.remove('activo'));
            boton.classList.add('activo');

            vistasModulo.forEach((vista) => {
                if (vista.id === `modulo-${moduloDestino}`) {
                    vista.classList.remove('oculto');
                } else {
                    vista.classList.add('oculto');
                }
            });

            ocultarAlerta();
        });
    });
});