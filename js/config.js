const API_URLS = {
    AUTH : 'http://localhost:8001',
    EMPLEADOS : 'http://localhost:8002',
    INCAPACIDADES : 'http://localhost:8003',
    SEGUIMIENTO : 'http://localhost:8004',
};

function redirigirALogin() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    const enSubcarpeta = window.location.pathname.includes('/pages/');
    window.location.href = enSubcarpeta ? '../index.html' : 'index.html';
}

async function apiFetch(baseUrl, endpoint, options = {}) {
    const token = localStorage.getItem('auth_token');

    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers || {})
    };

    if (token) {
        headers['Authorization']=`Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json().catch(()=>({}));

    if(response.status === 401 && !endpoint.includes('/login')){
        redirigirALogin();
        throw new Error(data.mensaje || "Su sesión ha expirado");        
    }

    if (!response.ok){
        throw new Error(data.mensaje || data.error || 'Error en la petición al servidor');
    }

    return data;
    
}