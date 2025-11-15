// Checkbox
let isChecked = false;
function toggleCheckbox() {
    isChecked = !isChecked;
    const checkbox = document.getElementById('checkbox');
    if (isChecked) {
        checkbox.classList.add('checked');
    } else {
        checkbox.classList.remove('checked');
    }
}

// Mostrar formulario de recuperación de contraseña
function showForgotPassword(event) {
    event.preventDefault();
    
    // Ocultar formulario de login
    document.getElementById('loginForm').style.display = 'none';
    
    // Mostrar formulario de recuperación
    document.getElementById('forgotPasswordForm').style.display = 'block';
    
    // Cambiar título y subtítulo
    document.getElementById('mainTitle').textContent = 'Recupera tu Cuenta';
    document.getElementById('mainSubtitle').textContent = 'Ingresa el correo electrónico asociado a tu cuenta para restablecer tu contraseña';
}

// Volver al formulario de login
function showLogin(event) {
    event.preventDefault();
    
    // Mostrar formulario de login
    document.getElementById('loginForm').style.display = 'block';
    
    // Ocultar formulario de recuperación
    document.getElementById('forgotPasswordForm').style.display = 'none';
    
    // Restaurar título y subtítulo
    document.getElementById('mainTitle').textContent = 'Inicio de Sesion';
    document.getElementById('mainSubtitle').textContent = 'Accede a tu cuenta para gestionar tus solicitudes de beca';
    
    // Limpiar campo de email
    document.getElementById('recoveryEmail').value = '';
}

// Lista de números de control registrados (simulación de base de datos)
const registeredStudents = {
    '20401234': {
        name: 'Juan Carlos Pérez González',
        email: 'juan.perez@tecnm.mx'
    },
    '20401235': {
        name: 'María López Hernández',
        email: 'maria.lopez@tecnm.mx'
    },
    '20401236': {
        name: 'Carlos Ramírez Torres',
        email: 'carlos.ramirez@tecnm.mx'
    }
};

// Inicializar contraseña por defecto para cada usuario si no existe
Object.keys(registeredStudents).forEach(controlNumber => {
    const passwordKey = `userPassword_${controlNumber}`;
    if (!localStorage.getItem(passwordKey)) {
        localStorage.setItem(passwordKey, 'tecnm2025');
    }
});

console.log('✓ Usuarios inicializados con contraseña por defecto: tecnm2025');

// Form submit de login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const controlNumber = document.getElementById('login').value.trim();
    const password = document.getElementById('password').value.trim();
    
    console.log('Intentando iniciar sesión...');
    console.log('Número de Control:', controlNumber);
    console.log('Recordar sesión:', isChecked);
    
    // Validar campos vacíos
    if (!controlNumber || !password) {
        showLoginNotification('Por favor completa todos los campos', 'error');
        return;
    }
    
    // Validar formato de número de control (8 dígitos)
    const controlNumberRegex = /^\d{8}$/;
    if (!controlNumberRegex.test(controlNumber)) {
        showLoginNotification('El número de control debe tener 8 dígitos', 'error');
        document.getElementById('login').focus();
        return;
    }
    
    // Verificar si el número de control está registrado
    if (!registeredStudents[controlNumber]) {
        showLoginNotification('Número de control no registrado', 'error');
        document.getElementById('login').value = '';
        document.getElementById('login').focus();
        return;
    }
    
    // Obtener contraseña guardada para este usuario
    const passwordKey = `userPassword_${controlNumber}`;
    const savedPassword = localStorage.getItem(passwordKey) || 'tecnm2025';
    
    // Validar contraseña
    if (password !== savedPassword) {
        showLoginNotification('Contraseña incorrecta', 'error');
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
        return;
    }
    
    // Credenciales válidas
    console.log('✓ Credenciales válidas');
    const studentInfo = registeredStudents[controlNumber];
    
    // Guardar estado de autenticación
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('username', controlNumber);
    sessionStorage.setItem('studentName', studentInfo.name);
    sessionStorage.setItem('studentEmail', studentInfo.email);
    
    // Si marca "Recordar sesión", guardarlo en localStorage
    if (isChecked) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('savedControlNumber', controlNumber);
    } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('savedControlNumber');
    }
    
    showLoginNotification(`¡Bienvenido ${studentInfo.name}! Redirigiendo...`, 'success');
    
    // Redirigir a index.html
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
});

// Form submit de recuperación de contraseña
document.getElementById('forgotPasswordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('recoveryEmail').value.trim();
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
        showLoginNotification('Por favor ingresa tu correo electrónico', 'error');
        return;
    }
    
    if (!emailRegex.test(email)) {
        showLoginNotification('Por favor ingresa un correo válido', 'error');
        return;
    }
    
    // Verificar si el correo está registrado
    const studentFound = Object.entries(registeredStudents).find(
        ([_, student]) => student.email === email
    );
    
    if (!studentFound) {
        showLoginNotification('Correo electrónico no registrado', 'error');
        return;
    }
    
    console.log('Enviando instrucciones de recuperación a:', email);
    
    showLoginNotification(`Instrucciones enviadas a ${email}`, 'success');
    
    // Volver automáticamente al login después de enviar
    setTimeout(() => {
        showLogin(e);
    }, 2000);
});

// Sistema de notificaciones para login
function showLoginNotification(message, type) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `login-notification ${type}`;
    notification.textContent = message;
    
    // Estilos
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '8px';
    notification.style.color = 'white';
    notification.style.fontWeight = '500';
    notification.style.fontSize = '14px';
    notification.style.zIndex = '9999';
    notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    notification.style.animation = 'slideInRight 0.3s ease-out';
    notification.style.minWidth = '300px';
    notification.style.maxWidth = '400px';
    
    if (type === 'success') {
        notification.style.background = '#2e7d32';
    } else if (type === 'error') {
        notification.style.background = '#c62828';
    } else if (type === 'info') {
        notification.style.background = '#19326c';
    }
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Cargar número de control guardado si existe "Recordar sesión"
window.addEventListener('load', function() {
    const rememberMe = localStorage.getItem('rememberMe');
    const savedControlNumber = localStorage.getItem('savedControlNumber');
    
    if (rememberMe === 'true' && savedControlNumber) {
        document.getElementById('login').value = savedControlNumber;
        isChecked = true;
        const checkbox = document.getElementById('checkbox');
        checkbox.classList.add('checked');
        console.log('✓ Número de control recordado cargado');
    }
});

// Mostrar información en consola
console.log('=== TECNM | IMPULSO ESTUDIANTIL ===');
console.log('Números de Control Registrados:');
Object.entries(registeredStudents).forEach(([controlNumber, student]) => {
    console.log(`  • ${controlNumber} - ${student.name}`);
});
console.log('\nContraseña por defecto: tecnm2025');
console.log('Puedes cambiar tu contraseña en Ajustes > Cambiar Contraseña');
console.log('===================================');