document.addEventListener('DOMContentLoaded', () => {
    const tablaBody = document.getElementById('tabla-empleados-body');
    if (!tablaBody) return;

    const btnNuevo = document.getElementById('btn-nuevo-empleado');
    const contenedorForm = document.getElementById('contenedor-form-empleado');
    const tituloForm = document.getElementById('titulo-form-empleado');
    const formEmpleado = document.getElementById('form-empleado');
    const btnCancelar = document.getElementById('btn-cancelar-empleado');
    const btnGuardar = document.getElementById('btn-guardar-empleado');

    const inputId = document.getElementById('emp-id');
    const inputNombres = document.getElementById('emp-nombres');
    const inputApellidos = document.getElementById('emp-apellidos');
    const inputDocumento = document.getElementById('emp-documento');
    const inputCorreo = document.getElementById('emp-correo');
    const inputTelefono = document.getElementById('emp-telefono');
    const inputCargo = document.getElementById('emp-cargo');
    const inputArea = document.getElementById('emp-area');
    const inputFechaIngreso = document.getElementById('emp-fecha-ingreso');

    const filtroBuscar = document.getElementById('filtro-buscar-empleado');
    const filtroEstado = document.getElementById('filtro-estado-empleado');
    const btnFiltrar = document.getElementById('btn-buscar-empleados');

    let listaEmpleados = [];

    function abrirFormularioCrear() {
        formEmpleado.reset();
        inputId.value = '';
        tituloForm.textContent = 'Registrar Nuevo Empleado';
        btnGuardar.textContent = 'Guardar Empleado';
        contenedorForm.classList.remove('oculto');
        inputNombres.focus();
    }

    function abrirFormularioEditar(emp) {
        inputId.value = emp.id;
        inputNombres.value = emp.nombres;
        inputApellidos.value = emp.apellidos;
        inputDocumento.value = emp.documento;
        inputCorreo.value = emp.correo;
        inputTelefono.value = emp.telefono;
        inputCargo.value = emp.cargo;
        inputArea.value = emp.area;
        inputFechaIngreso.value = emp.fecha_ingreso;

        tituloForm.textContent = `Editar Empleado #${emp.id}`;
        btnGuardar.textContent = 'Actualizar Cambios';
        contenedorForm.classList.remove('oculto');
        contenedorForm.scrollIntoView({ behavior: 'smooth' });
    }

    function cerrarFormulario() {
        formEmpleado.reset();
        inputId.value = '';
        contenedorForm.classList.add('oculto');
    }

    async function cargarEmpleados() {
        try {
            const params = new URLSearchParams();
            if (filtroBuscar.value.trim() !== '') {
                params.append('buscar', filtroBuscar.value.trim());
            }
            if (filtroEstado.value !== '') {
                params.append('estado', filtroEstado.value);
            }

            const query = params.toString() ? `?${params.toString()}` : '';
            const respuesta = await apiFetch(API_URLS.EMPLEADOS, `/empleados${query}`, {
                method: 'GET'
            });

            listaEmpleados = respuesta.empleados || [];
            renderizarTabla(listaEmpleados);
        } catch (error) {
            tablaBody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:#b91c1c;">Error al cargar empleados: ${error.message}</td></tr>`;
        }
    }

    function renderizarTabla(empleados) {
        if (!empleados.length) {
            tablaBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No se encontraron empleados registrados.</td></tr>';
            return;
        }

        tablaBody.innerHTML = empleados.map(emp => {
            const badgeClase = emp.estado === 'activo' ? 'badge-activo' : 'badge-inactivo';
            const textoBotonEstado = emp.estado === 'activo' ? 'Inactivar' : 'Activar';

            return `
                <tr>
                    <td>${emp.id}</td>
                    <td><strong>${emp.documento}</strong></td>
                    <td>${emp.nombres} ${emp.apellidos}</td>
                    <td>${emp.correo}</td>
                    <td>${emp.telefono}</td>
                    <td>${emp.cargo}<br><small style="color:#64748b;">${emp.area}</small></td>
                    <td>${emp.fecha_ingreso}</td>
                    <td><span class="badge ${badgeClase}">${emp.estado}</span></td>
                    <td style="white-space:nowrap;">
                        <button type="button" class="btn-sm btn-edit" data-accion="editar" data-id="${emp.id}">Editar</button>
                        <button type="button" class="btn-sm btn-toggle" data-accion="estado" data-id="${emp.id}">${textoBotonEstado}</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Eventos del formulario
    btnNuevo.addEventListener('click', abrirFormularioCrear);
    btnCancelar.addEventListener('click', cerrarFormulario);

    formEmpleado.addEventListener('submit', async (e) => {
        e.preventDefault();
        ocultarAlerta();

        const payload = {
            nombres: inputNombres.value.trim(),
            apellidos: inputApellidos.value.trim(),
            documento: inputDocumento.value.trim(),
            correo: inputCorreo.value.trim(),
            telefono: inputTelefono.value.trim(),
            cargo: inputCargo.value.trim(),
            area: inputArea.value.trim(),
            fecha_ingreso: inputFechaIngreso.value
        };

        const idEditar = inputId.value;
        const esEdicion = idEditar !== '';

        try {
            btnGuardar.disabled = true;
            btnGuardar.textContent = esEdicion ? 'Actualizando...' : 'Guardando...';

            const respuesta = await apiFetch(
                API_URLS.EMPLEADOS,
                esEdicion ? `/empleados/${idEditar}` : '/empleados',
                {
                    method: esEdicion ? 'PUT' : 'POST',
                    body: JSON.stringify(payload)
                }
            );

            mostrarAlerta(respuesta.mensaje, 'exito');
            cerrarFormulario();
            await cargarEmpleados();
        } catch (error) {
            mostrarAlerta(error.message, 'error');
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.textContent = esEdicion ? 'Actualizar Cambios' : 'Guardar Empleado';
        }
    });

    // Eventos de botones en la tabla (Editar / Cambiar Estado)
    tablaBody.addEventListener('click', async (e) => {
        const boton = e.target.closest('button[data-accion]');
        if (!boton) return;

        const accion = boton.dataset.accion;
        const id = Number(boton.dataset.id);
        const empleado = listaEmpleados.find(item => Number(item.id) === id);
        if (!empleado) return;

        if (accion === 'editar') {
            abrirFormularioEditar(empleado);
        } else if (accion === 'estado') {
            const nuevoEstado = empleado.estado === 'activo' ? 'inactivo' : 'activo';
            try {
                boton.disabled = true;
                const respuesta = await apiFetch(API_URLS.EMPLEADOS, `/empleados/${id}/estado`, {
                    method: 'PATCH',
                    body: JSON.stringify({ estado: nuevoEstado })
                });
                mostrarAlerta(respuesta.mensaje, 'exito');
                await cargarEmpleados();
            } catch (error) {
                mostrarAlerta(error.message, 'error');
                boton.disabled = false;
            }
        }
    });

    // Eventos de búsqueda y filtrado
    btnFiltrar.addEventListener('click', cargarEmpleados);
    filtroEstado.addEventListener('change', cargarEmpleados);
    filtroBuscar.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') cargarEmpleados();
    });

    // Carga inicial al abrir el Dashboard
    cargarEmpleados();
});