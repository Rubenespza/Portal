// Verificar si el usuario está autenticado
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard TECNM cargado correctamente');
    
    // Verificar autenticación
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
        console.log('⚠️ Usuario no autenticado, redirigiendo al login...');
        window.location.href = 'Login.html';
        return;
    }
    
    initializeDashboard();
});

// Inicializar dashboard
function initializeDashboard() {
    setupNavigation();
    setupNotificationButton();
    setupNotificationTabs();
    generateFilterTabs();
    setupApproveButtons();
    setupRejectButtons();
    setupFilterTabs();
    setupSearchBar();
    setupLogout();
    updateStatistics();
    updateNotificationBadge();
    setupDarkMode();
    loadUserInfo();
    setupEmailSettings();
    setupPasswordSettings();
    setupDocumentUpload();
    setupSolicitudModal(); // Nuevo: Modal de detalle
}

// ========================================
// NAVEGACIÓN DEL SIDEBAR
// ========================================

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const sectionName = this.getAttribute('data-section');
            
            // Remover active de todos los nav-items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Agregar active al nav-item clickeado
            this.classList.add('active');
            
            // Cambiar sección de contenido
            changeSection(sectionName);
        });
    });
}

function changeSection(sectionName) {
    // Ocultar todas las secciones
    const allSections = document.querySelectorAll('.section-content');
    allSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        console.log(`Cambiando a sección: ${sectionName.toUpperCase()}`);
        showNotification(`Navegando a ${getSectionTitle(sectionName)}`, 'info');
    }
}

function getSectionTitle(sectionName) {
    const titles = {
        'home': 'Inicio',
        'becas': 'Becas',
        'mensajes': 'Mensajes',
        'calendario': 'Calendario',
        'documentos': 'Documentos',
        'ajustes': 'Ajustes'
    };
    return titles[sectionName] || sectionName;
}

// ========================================
// GESTIÓN DE SOLICITUDES
// ========================================

function approveOrder(orderId) {
    if (confirm(`¿Estás seguro de aprobar la ${orderId}?\n\nEsta acción otorgará los beneficios solicitados al estudiante.`)) {
        console.log(`${orderId} aprobada`);
        
        // Encontrar la card y cambiar su estado
        const card = event.target.closest('.order-card');
        const footer = card.querySelector('.order-footer');
        
        // Actualizar estados de los items
        const itemStatuses = card.querySelectorAll('.item-status');
        itemStatuses.forEach(status => {
            status.classList.remove('pending');
            status.classList.add('approved');
            status.textContent = 'Aprobado';
        });
        
        // Remover botones de acción
        const actions = footer.querySelector('.order-actions');
        if (actions) {
            actions.remove();
        }
        
        // Agregar estado de completada
        const statusBtn = document.createElement('button');
        statusBtn.className = 'btn-status completed';
        statusBtn.textContent = 'COMPLETADA';
        footer.appendChild(statusBtn);
        
        // Mostrar notificación
        showNotification(`${orderId} aprobada exitosamente`, 'success');
        
        // Actualizar estadísticas
        updateStatistics();
    }
}

function rejectOrder(orderId) {
    const reason = prompt(`¿Por qué deseas rechazar la ${orderId}?\n\nEscribe el motivo:`);
    
    if (reason !== null && reason.trim() !== '') {
        console.log(`${orderId} rechazada. Motivo: ${reason}`);
        
        // Encontrar la card y cambiar su estado
        const card = event.target.closest('.order-card');
        const footer = card.querySelector('.order-footer');
        
        // Actualizar estados de los items
        const itemStatuses = card.querySelectorAll('.item-status');
        itemStatuses.forEach(status => {
            status.classList.remove('pending');
            status.classList.add('rejected');
            status.textContent = 'Rechazado';
        });
        
        // Remover botones de acción
        const actions = footer.querySelector('.order-actions');
        if (actions) {
            actions.remove();
        }
        
        // Agregar estado de rechazada
        const statusBtn = document.createElement('button');
        statusBtn.className = 'btn-status rejected';
        statusBtn.textContent = 'RECHAZADA';
        statusBtn.title = `Motivo: ${reason}`;
        footer.appendChild(statusBtn);
        
        // Mostrar notificación
        showNotification(`${orderId} rechazada`, 'error');
        
        // Actualizar estadísticas
        updateStatistics();
    } else if (reason !== null) {
        alert('Debes proporcionar un motivo para rechazar la solicitud.');
    }
}

function setupApproveButtons() {
    const approveButtons = document.querySelectorAll('.btn-approve');
    approveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.order-card');
            const orderTitle = card.querySelector('h3').textContent;
            approveOrder(orderTitle);
        });
    });
}

function setupRejectButtons() {
    const rejectButtons = document.querySelectorAll('.btn-reject');
    rejectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.order-card');
            const orderTitle = card.querySelector('h3').textContent;
            rejectOrder(orderTitle);
        });
    });
}

// ========================================
// SISTEMA DE NOTIFICACIONES MEJORADO
// ========================================

function setupNotificationButton() {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationsPanel = document.getElementById('notificationsPanel');

    if (notificationBtn && notificationsPanel) {
        notificationBtn.addEventListener('click', function(event) {
            event.stopPropagation();
            notificationsPanel.classList.toggle('active');
        });

        // Cierra el panel si haces clic fuera
        document.addEventListener('click', function(event) {
            if (!notificationsPanel.contains(event.target) && !notificationBtn.contains(event.target)) {
                notificationsPanel.classList.remove('active');
            }
        });
    }
}

function setupNotificationTabs() {
    const tabBtns = document.querySelectorAll('.notifications-tabs .tab-btn');
    const notificationItems = document.querySelectorAll('.notification-item');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover active de todos los tabs
            tabBtns.forEach(tab => tab.classList.remove('active'));
            
            // Agregar active al tab clickeado
            this.classList.add('active');
            
            const tabText = this.textContent.trim();
            
            // Filtrar notificaciones
            if (tabText === 'Todas') {
                // Mostrar todas las notificaciones
                notificationItems.forEach(item => {
                    item.style.display = 'flex';
                });
                
                // Mostrar todas las secciones
                document.querySelectorAll('.notifications-section').forEach(section => {
                    section.style.display = 'block';
                });
                
                console.log('Mostrando todas las notificaciones');
            } else if (tabText === 'No leídas') {
                // Mostrar solo no leídas
                let hasUnread = false;
                
                notificationItems.forEach(item => {
                    if (item.classList.contains('unread')) {
                        item.style.display = 'flex';
                        hasUnread = true;
                    } else {
                        item.style.display = 'none';
                    }
                });
                
                // Ocultar secciones sin notificaciones no leídas
                document.querySelectorAll('.notifications-section').forEach(section => {
                    const unreadInSection = section.querySelectorAll('.notification-item.unread:not([style*="display: none"])');
                    if (unreadInSection.length === 0) {
                        section.style.display = 'none';
                    } else {
                        section.style.display = 'block';
                    }
                });
                
                // Si no hay notificaciones no leídas, mostrar mensaje
                if (!hasUnread) {
                    showNotification('¡Genial! No tienes notificaciones sin leer', 'success');
                } else {
                    const unreadCount = document.querySelectorAll('.notification-item.unread').length;
                    console.log(`Mostrando ${unreadCount} notificaciones no leídas`);
                }
            }
        });
    });
    
    // Funcionalidad para marcar como leída al hacer clic en el punto azul
    const unreadIndicators = document.querySelectorAll('.unread-indicator');
    unreadIndicators.forEach(indicator => {
        indicator.addEventListener('click', function(e) {
            e.stopPropagation();
            const notificationItem = this.closest('.notification-item');
            
            if (notificationItem.classList.contains('unread')) {
                // Marcar como leída con animación
                notificationItem.style.transition = 'all 0.3s ease';
                notificationItem.classList.remove('unread');
                this.style.animation = 'fadeOut 0.3s ease';
                
                setTimeout(() => {
                    this.remove();
                    updateNotificationBadge();
                    
                    // Si estamos en el tab "No leídas", actualizar vista
                    const activeTab = document.querySelector('.notifications-tabs .tab-btn.active');
                    if (activeTab && activeTab.textContent.trim() === 'No leídas') {
                        // Si ya no tiene la clase unread, ocultarla en el filtro
                        notificationItem.style.display = 'none';
                        
                        // Verificar si la sección quedó vacía
                        const section = notificationItem.closest('.notifications-section');
                        const visibleUnread = section.querySelectorAll('.notification-item.unread:not([style*="display: none"])');
                        if (visibleUnread.length === 0) {
                            section.style.display = 'none';
                        }
                        
                        // Verificar si ya no quedan notificaciones no leídas
                        const remainingUnread = document.querySelectorAll('.notification-item.unread').length;
                        if (remainingUnread === 0) {
                            showNotification('¡Todas las notificaciones están leídas!', 'success');
                        }
                    }
                }, 300);
                
                showNotification('Notificación marcada como leída', 'info');
            }
        });
    });
    
    // Agregar funcionalidad al botón de opciones para marcar todas como leídas
    const optionsBtn = document.querySelector('.options-btn');
    if (optionsBtn) {
        optionsBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const unreadCount = document.querySelectorAll('.notification-item.unread').length;
            
            if (unreadCount === 0) {
                showNotification('No hay notificaciones sin leer', 'info');
                return;
            }
            
            if (confirm(`¿Marcar todas las notificaciones (${unreadCount}) como leídas?`)) {
                const unreadItems = document.querySelectorAll('.notification-item.unread');
                
                unreadItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.remove('unread');
                        const indicator = item.querySelector('.unread-indicator');
                        if (indicator) {
                            indicator.remove();
                        }
                    }, index * 50);
                });
                
                setTimeout(() => {
                    updateNotificationBadge();
                    showNotification('Todas las notificaciones marcadas como leídas', 'success');
                    
                    // Si estamos en "No leídas", volver a "Todas"
                    const activeTab = document.querySelector('.notifications-tabs .tab-btn.active');
                    if (activeTab && activeTab.textContent.trim() === 'No leídas') {
                        document.querySelector('.notifications-tabs .tab-btn').click();
                    }
                }, unreadCount * 50 + 100);
            }
        });
    }
}

function updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    const unreadCount = document.querySelectorAll('.notification-item.unread').length;
    
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
}

function showNotification(message, type) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
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
    notification.style.animation = 'slideIn 0.3s ease-out';
    notification.style.minWidth = '300px';
    
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
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
`;
document.head.appendChild(style);

// ========================================
// FILTROS Y BÚSQUEDA
// ========================================

function generateFilterTabs() {
    const orderCards = document.querySelectorAll('.order-card');
    const filterTabsContainer = document.getElementById('filterTabsContainer');
    
    if (!filterTabsContainer || orderCards.length === 0) {
        console.log('No hay solicitudes para generar pestañas');
        return;
    }
    
    // Extraer los números de solicitud únicos
    const solicitudNumbers = new Set();
    orderCards.forEach(card => {
        const title = card.querySelector('h3').textContent;
        // Extraer el número de la solicitud (#351, #350, etc.)
        const match = title.match(/#(\d+)/);
        if (match) {
            solicitudNumbers.add(match[0]);
        }
    });
    
    // Convertir a array y ordenar
    const sortedNumbers = Array.from(solicitudNumbers).sort((a, b) => {
        const numA = parseInt(a.replace('#', ''));
        const numB = parseInt(b.replace('#', ''));
        return numB - numA;
    });
    
    // Limpiar contenedor
    filterTabsContainer.innerHTML = '';
    
    // Si solo hay 1-3 solicitudes, no mostrar pestañas
    if (sortedNumbers.length <= 3) {
        console.log(`Solo hay ${sortedNumbers.length} solicitud(es), no se necesitan pestañas de filtro`);
        filterTabsContainer.style.display = 'none';
        return;
    }
    
    // Mostrar el contenedor si hay más de 3 solicitudes
    filterTabsContainer.style.display = 'flex';
    
    // Crear pestañas dinámicamente
    sortedNumbers.forEach((number, index) => {
        const tab = document.createElement('button');
        tab.className = 'filter-tab';
        tab.textContent = number;
        
        if (index === 0) {
            tab.classList.add('active');
        }
        
        filterTabsContainer.appendChild(tab);
    });
    
    console.log(`✓ Generadas ${sortedNumbers.length} pestañas de filtro:`, sortedNumbers.join(', '));
}

function setupFilterTabs() {
    const filterTabsContainer = document.getElementById('filterTabsContainer');
    
    if (!filterTabsContainer) {
        return;
    }
    
    filterTabsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('filter-tab')) {
            const allTabs = filterTabsContainer.querySelectorAll('.filter-tab');
            allTabs.forEach(t => t.classList.remove('active'));
            
            e.target.classList.add('active');
            
            const filterNumber = e.target.textContent.trim();
            console.log(`Filtrando por: ${filterNumber}`);
            
            filterOrders(filterNumber);
        }
    });
}

function filterOrders(filterNumber) {
    const cards = document.querySelectorAll('.order-card');
    let visibleCount = 0;
    
    if (!filterNumber || filterNumber === '') {
        cards.forEach(card => {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.3s ease-out';
        });
        showNotification(`Mostrando todas las solicitudes (${cards.length})`, 'info');
        return;
    }
    
    cards.forEach(card => {
        const orderTitle = card.querySelector('h3').textContent;
        
        if (orderTitle.includes(filterNumber)) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.3s ease-out';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    if (visibleCount === 0) {
        cards.forEach(card => {
            card.style.display = 'block';
        });
        showNotification(`No se encontró la solicitud ${filterNumber}. Mostrando todas`, 'info');
    } else {
        showNotification(`Mostrando ${visibleCount} solicitud(es)`, 'info');
    }
}

function setupSearchBar() {
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const cards = document.querySelectorAll('.order-card');
            let visibleCount = 0;
            
            cards.forEach(card => {
                const orderTitle = card.querySelector('h3').textContent.toLowerCase();
                const itemTitles = Array.from(card.querySelectorAll('.item-details h4'))
                    .map(h4 => h4.textContent.toLowerCase())
                    .join(' ');
                const itemDescriptions = Array.from(card.querySelectorAll('.item-details p'))
                    .map(p => p.textContent.toLowerCase())
                    .join(' ');
                
                if (orderTitle.includes(searchTerm) || 
                    itemTitles.includes(searchTerm) || 
                    itemDescriptions.includes(searchTerm)) {
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
            
            if (searchTerm !== '') {
                const filterTabsContainer = document.getElementById('filterTabsContainer');
                if (filterTabsContainer) {
                    filterTabsContainer.querySelectorAll('.filter-tab').forEach(tab => {
                        tab.classList.remove('active');
                    });
                }
            } else {
                const filterTabsContainer = document.getElementById('filterTabsContainer');
                if (filterTabsContainer) {
                    const firstTab = filterTabsContainer.querySelector('.filter-tab');
                    if (firstTab) {
                        firstTab.classList.add('active');
                    }
                }
                cards.forEach(card => {
                    card.style.display = 'block';
                });
            }
        });
    }
}

// ========================================
// OTROS CONTROLES
// ========================================

function setupLogout() {
    const logoutBtn = document.querySelector('.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                console.log('Cerrando sesión...');
                
                // Limpiar sesión
                sessionStorage.removeItem('isAuthenticated');
                sessionStorage.removeItem('username');
                
                showNotification('Cerrando sesión...', 'info');
                setTimeout(() => {
                    window.location.href = 'Login.html';
                }, 1000);
            }
        });
    }
}

function updateStatistics() {
    const cards = document.querySelectorAll('.order-card');
    const pendingOrders = document.querySelectorAll('.order-actions').length;
    const completedOrders = document.querySelectorAll('.btn-status.completed').length;
    const rejectedOrders = document.querySelectorAll('.btn-status.rejected').length;
    
    console.log('=== ESTADÍSTICAS TECNM ===');
    console.log(`Total de solicitudes: ${cards.length}`);
    console.log(`Pendientes: ${pendingOrders}`);
    console.log(`Aprobadas: ${completedOrders}`);
    console.log(`Rechazadas: ${rejectedOrders}`);
    console.log('========================');
}

// ========================================
// CONFIGURACIÓN DE CONTRASEÑA
// ========================================

function setupPasswordSettings() {
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    
    // Verificar que existen todos los elementos
    if (!currentPasswordInput || !newPasswordInput || !confirmPasswordInput) {
        return;
    }
    
    // Obtener número de control del usuario autenticado
    const controlNumber = sessionStorage.getItem('username') || '20401234';
    
    // Establecer contraseña por defecto si no existe para este usuario
    const passwordKey = 'userPassword_' + controlNumber;
    if (!localStorage.getItem(passwordKey)) {
        localStorage.setItem(passwordKey, 'tecnm2025'); // Contraseña por defecto
        console.log('✓ Contraseña por defecto establecida para: ' + controlNumber);
    }
    
    // Validación de requisitos de contraseña en tiempo real
    newPasswordInput.addEventListener('input', function() {
        const password = this.value;
        validatePasswordRequirements(password);
    });
    
    // Validación de coincidencia en tiempo real
    confirmPasswordInput.addEventListener('input', function() {
        const newPassword = newPasswordInput.value;
        const confirmPassword = this.value;
        
        if (confirmPassword && newPassword !== confirmPassword) {
            this.style.borderColor = '#c62828';
        } else if (confirmPassword && newPassword === confirmPassword) {
            this.style.borderColor = '#2e7d32';
        } else {
            this.style.borderColor = '#e8eef5';
        }
    });
    
    // Encontrar el botón de cambiar contraseña
    const passwordCard = currentPasswordInput.closest('.settings-card');
    const passwordUpdateBtn = passwordCard.querySelector('.settings-btn.primary');
    
    if (passwordUpdateBtn) {
        passwordUpdateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const currentPassword = currentPasswordInput.value.trim();
            const newPassword = newPasswordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();
            const savedPassword = localStorage.getItem(passwordKey);
            
            // Validaciones
            if (!currentPassword || !newPassword || !confirmPassword) {
                showNotification('Por favor completa todos los campos', 'error');
                return;
            }
            
            // Verificar contraseña actual
            if (currentPassword !== savedPassword) {
                showNotification('La contraseña actual es incorrecta', 'error');
                currentPasswordInput.style.borderColor = '#c62828';
                return;
            }
            
            // Verificar que la nueva contraseña sea diferente
            if (newPassword === savedPassword) {
                showNotification('La nueva contraseña debe ser diferente a la actual', 'info');
                return;
            }
            
            // Validar requisitos de contraseña
            const requirements = validatePasswordRequirements(newPassword);
            if (!requirements.isValid) {
                showNotification('La nueva contraseña no cumple con los requisitos', 'error');
                newPasswordInput.style.borderColor = '#c62828';
                return;
            }
            
            // Verificar que las contraseñas coincidan
            if (newPassword !== confirmPassword) {
                showNotification('Las contraseñas no coinciden', 'error');
                confirmPasswordInput.style.borderColor = '#c62828';
                return;
            }
            
            // Actualizar contraseña para este usuario específico
            localStorage.setItem(passwordKey, newPassword);
            
            // Limpiar campos
            currentPasswordInput.value = '';
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
            
            // Resetear colores de borde
            currentPasswordInput.style.borderColor = '#e8eef5';
            newPasswordInput.style.borderColor = '#e8eef5';
            confirmPasswordInput.style.borderColor = '#e8eef5';
            
            // Limpiar validación visual
            resetPasswordRequirements();
            
            // Mostrar notificación de éxito
            showNotification('✅ Contraseña actualizada exitosamente', 'success');
            console.log('✓ Contraseña actualizada para usuario: ' + controlNumber);
        });
    }
}

function validatePasswordRequirements(password) {
    const requirements = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        isValid: false
    };
    
    requirements.isValid = requirements.minLength && 
                          requirements.hasUppercase && 
                          requirements.hasNumber && 
                          requirements.hasSpecial;
    
    // Actualizar visualización de requisitos
    updatePasswordRequirementsDisplay(requirements);
    
    return requirements;
}

function updatePasswordRequirementsDisplay(requirements) {
    const requirementsList = document.querySelector('.password-requirements ul');
    
    if (!requirementsList) {
        return;
    }
    
    const items = requirementsList.querySelectorAll('li');
    
    if (items.length >= 4) {
        // Mínimo 8 caracteres
        items[0].style.color = requirements.minLength ? '#2e7d32' : '#8a99b3';
        items[0].style.fontWeight = requirements.minLength ? '600' : '400';
        
        // Al menos una letra mayúscula
        items[1].style.color = requirements.hasUppercase ? '#2e7d32' : '#8a99b3';
        items[1].style.fontWeight = requirements.hasUppercase ? '600' : '400';
        
        // Al menos un número
        items[2].style.color = requirements.hasNumber ? '#2e7d32' : '#8a99b3';
        items[2].style.fontWeight = requirements.hasNumber ? '600' : '400';
        
        // Al menos un carácter especial
        items[3].style.color = requirements.hasSpecial ? '#2e7d32' : '#8a99b3';
        items[3].style.fontWeight = requirements.hasSpecial ? '600' : '400';
    }
}

function resetPasswordRequirements() {
    const requirementsList = document.querySelector('.password-requirements ul');
    
    if (!requirementsList) {
        return;
    }
    
    const items = requirementsList.querySelectorAll('li');
    items.forEach(item => {
        item.style.color = '#8a99b3';
        item.style.fontWeight = '400';
    });
}

// ========================================
// MODO OSCURO
// ========================================

function setupDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    if (!darkModeToggle) {
        return;
    }
    
    // Verificar si hay una preferencia guardada
    const savedTheme = localStorage.getItem('darkMode');
    
    if (savedTheme === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }
    
    // Evento para cambiar el tema
    darkModeToggle.addEventListener('change', function() {
        if (this.checked) {
            // Activar modo oscuro
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
            showNotification('Modo oscuro activado 🌙', 'info');
            console.log('✓ Modo oscuro activado');
        } else {
            // Desactivar modo oscuro
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
            showNotification('Modo claro activado ☀️', 'info');
            console.log('✓ Modo claro activado');
        }
    });
}

// ========================================
// GESTIÓN DE DOCUMENTOS
// ========================================

function setupDocumentUpload() {
    const uploadButtons = document.querySelectorAll('.doc-action-btn.upload');
    const uploadModal = document.getElementById('uploadModal');
    const modalOverlay = uploadModal ? uploadModal.querySelector('.modal-overlay') : null;
    const modalClose = uploadModal ? uploadModal.querySelector('.modal-close') : null;
    const cancelBtn = uploadModal ? uploadModal.querySelector('.modal-btn.cancel') : null;
    const uploadBtn = uploadModal ? uploadModal.querySelector('.modal-btn.primary') : null;
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const uploadProgress = document.getElementById('uploadProgress');
    const modalTitle = document.getElementById('modalTitle');
    
    let currentDocumentType = '';
    let currentDocumentCard = null;
    let uploadedFile = null; // Guardar el archivo subido
    
    if (!uploadModal) return;
    
    // Abrir modal al hacer clic en botón de subir
    uploadButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            currentDocumentCard = this.closest('.document-card');
            currentDocumentType = currentDocumentCard.getAttribute('data-type');
            const documentName = currentDocumentCard.querySelector('h4').textContent;
            
            modalTitle.textContent = `Subir ${documentName}`;
            uploadModal.style.display = 'flex';
            uploadArea.style.display = 'block';
            uploadProgress.style.display = 'none';
            
            console.log(`Abriendo modal para: ${documentName}`);
        });
    });
    
    // Cerrar modal
    function closeModal() {
        uploadModal.style.display = 'none';
        fileInput.value = '';
        uploadArea.style.display = 'block';
        uploadProgress.style.display = 'none';
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    // Click en área de subida
    if (uploadArea) {
        uploadArea.addEventListener('click', function() {
            fileInput.click();
        });
    }
    
    // Drag and drop
    if (uploadArea) {
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = '#19326c';
            this.style.background = '#f8f9fc';
        });
        
        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.borderColor = '#d1d9e6';
            this.style.background = 'transparent';
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = '#d1d9e6';
            this.style.background = 'transparent';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        });
    }
    
    // Seleccionar archivo
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                handleFile(this.files[0]);
            }
        });
    }
    
    // Manejar archivo seleccionado
    function handleFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10 MB
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        
        // Validar tipo
        if (!allowedTypes.includes(file.type)) {
            showNotification('Solo se permiten archivos PDF, JPG o PNG', 'error');
            return;
        }
        
        // Validar tamaño
        if (file.size > maxSize) {
            showNotification('El archivo no debe superar los 10 MB', 'error');
            return;
        }
        
        uploadedFile = file; // Guardar el archivo
        
        // Mostrar información del archivo
        const fileName = uploadProgress.querySelector('.file-name');
        const fileSize = uploadProgress.querySelector('.file-size');
        
        if (fileName) fileName.textContent = file.name;
        if (fileSize) fileSize.textContent = formatFileSize(file.size);
        
        uploadArea.style.display = 'none';
        uploadProgress.style.display = 'block';
        
        console.log(`Archivo seleccionado: ${file.name} (${formatFileSize(file.size)})`);
    }
    
    // Botón de subir
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            const files = fileInput.files;
            
            if (files.length === 0) {
                showNotification('Por favor selecciona un archivo', 'error');
                return;
            }
            
            // Simular subida con barra de progreso
            const progressFill = uploadProgress.querySelector('.progress-fill');
            const progressText = uploadProgress.querySelector('.progress-text');
            let progress = 0;
            
            const interval = setInterval(() => {
                progress += 10;
                if (progressFill) progressFill.style.width = progress + '%';
                if (progressText) progressText.textContent = `Subiendo... ${progress}%`;
                
                if (progress >= 100) {
                    clearInterval(interval);
                    
                    // Convertir archivo a base64 para almacenamiento
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const fileData = {
                            name: uploadedFile.name,
                            type: uploadedFile.type,
                            size: uploadedFile.size,
                            data: e.target.result, // Base64
                            uploadDate: new Date().toISOString()
                        };
                        
                        // Guardar en localStorage
                        const controlNumber = sessionStorage.getItem('username');
                        const storageKey = `document_${controlNumber}_${currentDocumentType}`;
                        localStorage.setItem(storageKey, JSON.stringify(fileData));
                        
                        // Actualizar estado del documento
                        if (currentDocumentCard) {
                            const statusBadge = currentDocumentCard.querySelector('.document-status-new');
                            if (statusBadge) {
                                statusBadge.textContent = 'Subido';
                                statusBadge.classList.remove('pendiente');
                                statusBadge.classList.add('subido');
                            }
                            
                            // Guardar referencia al archivo en el card
                            currentDocumentCard.setAttribute('data-file-key', storageKey);
                            
                            // Cambiar botón de subir por ver/descargar/eliminar
                            const actions = currentDocumentCard.querySelector('.document-actions');
                            if (actions) {
                                actions.innerHTML = '<button class="doc-action-btn view" title="Ver"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button><button class="doc-action-btn download" title="Descargar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></button><button class="doc-action-btn delete" title="Eliminar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg></button>';
                                
                                setupDocumentActions(actions);
                            }
                            
                            // Agregar descripción del archivo
                            const description = currentDocumentCard.querySelector('.doc-description');
                            if (description) {
                                const uploadDate = new Date(fileData.uploadDate).toLocaleDateString('es-MX');
                                description.textContent = `${fileData.name} - ${formatFileSize(fileData.size)} - ${uploadDate}`;
                            }
                        }
                        
                        showNotification('✅ Documento subido exitosamente', 'success');
                        console.log(`Archivo guardado con clave: ${storageKey}`);
                        
                        setTimeout(() => {
                            closeModal();
                        }, 500);
                    };
                    
                    reader.readAsDataURL(uploadedFile);
                }
            }, 100);
        });
    }
    
    // Cargar documentos guardados al iniciar
    loadSavedDocuments();
}

function loadSavedDocuments() {
    const controlNumber = sessionStorage.getItem('username');
    const documentCards = document.querySelectorAll('.document-card');
    
    documentCards.forEach(card => {
        const documentType = card.getAttribute('data-type');
        const storageKey = 'document_' + controlNumber + '_' + documentType;
        const savedFile = localStorage.getItem(storageKey);
        
        if (savedFile) {
            try {
                const fileData = JSON.parse(savedFile);
                
                // Actualizar estado
                const statusBadge = card.querySelector('.document-status-new');
                if (statusBadge) {
                    statusBadge.textContent = 'Subido';
                    statusBadge.classList.remove('pendiente');
                    statusBadge.classList.add('subido');
                }
                
                // Guardar referencia
                card.setAttribute('data-file-key', storageKey);
                
                // Actualizar descripción
                const description = card.querySelector('.doc-description');
                if (description) {
                    const uploadDate = new Date(fileData.uploadDate).toLocaleDateString('es-MX');
                    description.textContent = fileData.name + ' - ' + formatFileSize(fileData.size) + ' - ' + uploadDate;
                }
                
                // Cambiar botones
                const actions = card.querySelector('.document-actions');
                if (actions) {
                    actions.innerHTML = '<button class="doc-action-btn view" title="Ver"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button><button class="doc-action-btn download" title="Descargar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></button><button class="doc-action-btn delete" title="Eliminar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg></button>';
                    
                    setupDocumentActions(actions);
                }
                
                console.log('✓ Documento cargado: ' + fileData.name);
            } catch (error) {
                console.error('Error al cargar documento ' + documentType + ':', error);
            }
        }
    });
}

function setupDocumentActions(container) {
    const viewBtn = container.querySelector('.doc-action-btn.view');
    const downloadBtn = container.querySelector('.doc-action-btn.download');
    const deleteBtn = container.querySelector('.doc-action-btn.delete');
    
    if (viewBtn) {
        viewBtn.addEventListener('click', function() {
            const card = this.closest('.document-card');
            const fileKey = card.getAttribute('data-file-key');
            
            if (!fileKey) {
                showNotification('No se encontró el archivo', 'error');
                return;
            }
            
            const savedFile = localStorage.getItem(fileKey);
            if (!savedFile) {
                showNotification('No se encontró el archivo', 'error');
                return;
            }
            
            try {
                const fileData = JSON.parse(savedFile);
                
                // Abrir en nueva pestaña
                const newWindow = window.open();
                
                if (fileData.type === 'application/pdf') {
                    // Para PDFs
                    newWindow.document.write('<html><head><title>' + fileData.name + '</title><style>body { margin: 0; } iframe { width: 100%; height: 100vh; border: none; }</style></head><body><iframe src="' + fileData.data + '"></iframe></body></html>');
                } else {
                    // Para imágenes
                    newWindow.document.write('<html><head><title>' + fileData.name + '</title><style>body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #1a1a1a; } img { max-width: 90%; max-height: 90vh; object-fit: contain; }</style></head><body><img src="' + fileData.data + '" alt="' + fileData.name + '"></body></html>');
                }
                
                showNotification('Visualizando documento...', 'info');
                console.log('Visualizando: ' + fileData.name);
            } catch (error) {
                showNotification('Error al visualizar el documento', 'error');
                console.error('Error:', error);
            }
        });
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            const card = this.closest('.document-card');
            const fileKey = card.getAttribute('data-file-key');
            
            if (!fileKey) {
                showNotification('No se encontró el archivo', 'error');
                return;
            }
            
            const savedFile = localStorage.getItem(fileKey);
            if (!savedFile) {
                showNotification('No se encontró el archivo', 'error');
                return;
            }
            
            try {
                const fileData = JSON.parse(savedFile);
                
                // Crear link de descarga
                const link = document.createElement('a');
                link.href = fileData.data;
                link.download = fileData.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                showNotification('📥 Descargando documento...', 'success');
                console.log('Descargando: ' + fileData.name);
            } catch (error) {
                showNotification('Error al descargar el documento', 'error');
                console.error('Error:', error);
            }
        });
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            if (confirm('¿Estás seguro de eliminar este documento?')) {
                const card = this.closest('.document-card');
                const fileKey = card.getAttribute('data-file-key');
                
                // Eliminar de localStorage
                if (fileKey) {
                    localStorage.removeItem(fileKey);
                    card.removeAttribute('data-file-key');
                }
                
                const statusBadge = card.querySelector('.document-status-new');
                const description = card.querySelector('.doc-description');
                const actions = card.querySelector('.document-actions');
                
                if (statusBadge) {
                    statusBadge.textContent = 'Sin subir';
                    statusBadge.classList.remove('subido');
                    statusBadge.classList.add('pendiente');
                }
                
                if (description) {
                    const documentType = card.getAttribute('data-type');
                    const descriptions = {
                        'acta-nacimiento': 'Documento oficial que acredita el nacimiento',
                        'curp': 'Clave Única de Registro de Población',
                        'identificacion': 'INE, Pasaporte o Cédula Profesional',
                        'comprobante-domicilio': 'Recibo de luz, agua o teléfono (máx. 3 meses)',
                        'fotografia': 'Tamaño infantil, fondo blanco',
                        'cuenta-bancaria': 'Estado de cuenta o carátula bancaria'
                    };
                    description.textContent = descriptions[documentType] || '';
                }
                
                if (actions) {
                    actions.innerHTML = '<button class="doc-action-btn upload" title="Subir documento"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg></button>';
                    
                    // Reagregar funcionalidad de subir
                    setupDocumentUpload();
                }
                
                showNotification('🗑️ Documento eliminado', 'info');
            }
        });
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}


                    
                    // Reagregar funcionalidad de subir
                    setupDocumentUpload();
                
                
                showNotification('Documento eliminado', 'info');
  

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ========================================
// CONFIGURACIÓN DE CORREO ELECTRÓNICO
// ========================================

function loadUserInfo() {
    // Cargar información del usuario desde sessionStorage
    const controlNumber = sessionStorage.getItem('username');
    const studentName = sessionStorage.getItem('studentName');
    const studentEmail = sessionStorage.getItem('studentEmail');
    
    // Actualizar campos de información personal si existen
    const fullnameInput = document.getElementById('fullname');
    const controlNumberInput = document.getElementById('control-number');
    const currentEmailInput = document.getElementById('current-email');
    
    if (fullnameInput && studentName) {
        fullnameInput.value = studentName;
    }
    
    if (controlNumberInput && controlNumber) {
        controlNumberInput.value = controlNumber;
    }
    
    if (currentEmailInput && studentEmail) {
        currentEmailInput.value = studentEmail;
        // Guardar el email del usuario si no existe
        const emailKey = 'userEmail_' + controlNumber;
        if (!localStorage.getItem(emailKey)) {
            localStorage.setItem(emailKey, studentEmail);
        }
    }
    
    console.log('✓ Información del usuario cargada: ' + studentName + ' (' + controlNumber + ')');
}

function setupEmailSettings() {
    const currentEmailInput = document.getElementById('current-email');
    const newEmailInput = document.getElementById('new-email');
    const confirmEmailInput = document.getElementById('confirm-email');
    const updateEmailBtn = document.querySelector('.settings-card-body button.settings-btn.primary');
    
    // Verificar que existen todos los elementos
    if (!currentEmailInput || !newEmailInput || !confirmEmailInput) {
        return;
    }
    
    // Cargar correo guardado si existe
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
        currentEmailInput.value = savedEmail;
    } else {
        currentEmailInput.placeholder = 'No hay correo registrado';
    }
    
    // Validación en tiempo real
    confirmEmailInput.addEventListener('input', function() {
        const newEmail = newEmailInput.value.trim();
        const confirmEmail = this.value.trim();
        
        if (confirmEmail && newEmail !== confirmEmail) {
            this.style.borderColor = '#c62828';
        } else if (confirmEmail && newEmail === confirmEmail) {
            this.style.borderColor = '#2e7d32';
        } else {
            this.style.borderColor = '#e8eef5';
        }
    });
    
    // Encontrar el botón de actualizar correo específico (el primero de la sección de correo)
    const emailCard = currentEmailInput.closest('.settings-card');
    const emailUpdateBtn = emailCard.querySelector('.settings-btn.primary');
    
    if (emailUpdateBtn) {
        emailUpdateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const newEmail = newEmailInput.value.trim();
            const confirmEmail = confirmEmailInput.value.trim();
            
            // Validaciones
            if (!newEmail || !confirmEmail) {
                showNotification('Por favor completa todos los campos', 'error');
                return;
            }
            
            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(newEmail)) {
                showNotification('Por favor ingresa un correo electrónico válido', 'error');
                newEmailInput.style.borderColor = '#c62828';
                return;
            }
            
            // Verificar que los correos coincidan
            if (newEmail !== confirmEmail) {
                showNotification('Los correos electrónicos no coinciden', 'error');
                confirmEmailInput.style.borderColor = '#c62828';
                return;
            }
            
            // Verificar que el nuevo correo sea diferente al actual
            if (newEmail === currentEmailInput.value) {
                showNotification('El nuevo correo es igual al actual', 'info');
                return;
            }
            
            // Actualizar correo
            currentEmailInput.value = newEmail;
            localStorage.setItem('userEmail', newEmail);
            
            // Limpiar campos
            newEmailInput.value = '';
            confirmEmailInput.value = '';
            
            // Resetear colores de borde
            newEmailInput.style.borderColor = '#e8eef5';
            confirmEmailInput.style.borderColor = '#e8eef5';
            
            // Mostrar notificación de éxito
            showNotification('✅ Correo electrónico actualizado exitosamente', 'success');
            console.log(`✓ Correo actualizado a: ${newEmail}`);
        });
    }
}

// ========================================
// UTILIDADES
// ========================================

function exportReport() {
    console.log('Generando reporte...');
    
    const cards = document.querySelectorAll('.order-card');
    let report = 'REPORTE DE SOLICITUDES - TECNM\n';
    report += '================================\n\n';
    
    cards.forEach(card => {
        const title = card.querySelector('h3').textContent;
        const date = card.querySelector('.order-date').textContent;
        const items = Array.from(card.querySelectorAll('.item-details h4'))
            .map(h4 => h4.textContent)
            .join(', ');
        const status = card.querySelector('.btn-status') ? 
            card.querySelector('.btn-status').textContent : 'PENDIENTE';
        
        report += `${title}\n`;
        report += `Fecha: ${date}\n`;
        report += `Solicita: ${items}\n`;
        report += `Estado: ${status}\n`;
        report += '--------------------------------\n\n';
    });
    
    console.log(report);
    showNotification('Reporte generado en consola', 'success');
}

// Atajos de teclado
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        exportReport();
    }
    
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        document.querySelector('.nav-item[data-section="home"]').click();
    }
    
    if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        document.querySelector('.nav-item[data-section="becas"]').click();
    }
    
    if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        document.querySelector('.nav-item[data-section="mensajes"]').click();
    }
});

// Prevenir que el formulario se envíe
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
    });
});

// Mensaje de bienvenida
setTimeout(() => {
    showNotification('Bienvenido al Sistema de Gestión TECNM', 'info');
}, 500);

// ========================================
// MODAL DE DETALLE DE SOLICITUD
// ========================================

function setupSolicitudModal() {
    const modal = document.getElementById('solicitudModal');
    const closeBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('modalCancelBtn');
    const approveBtn = document.getElementById('modalApproveBtn');
    const rejectBtn = document.getElementById('modalRejectBtn');
    const orderCards = document.querySelectorAll('.order-card');
    
    let currentCard = null;
    
    // Abrir modal al hacer clic en una tarjeta
    orderCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // No abrir si se hace clic en los botones de aprobar/rechazar
            if (e.target.closest('.btn-approve') || e.target.closest('.btn-reject') || e.target.closest('.btn-status')) {
                return;
            }
            
            currentCard = this;
            openSolicitudModal(this);
        });
    });
    
    // Cerrar modal
    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
            currentCard = null;
        }
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    // Cerrar al hacer clic en el overlay
    if (modal) {
        const overlay = modal.querySelector('.modal-overlay-full');
        if (overlay) {
            overlay.addEventListener('click', closeModal);
        }
    }
    
    // Aprobar desde el modal
    if (approveBtn) {
        approveBtn.addEventListener('click', function() {
            if (currentCard) {
                const orderTitle = currentCard.querySelector('h3').textContent;
                approveOrderFromModal(orderTitle, currentCard);
                closeModal();
            }
        });
    }
    
    // Rechazar desde el modal
    if (rejectBtn) {
        rejectBtn.addEventListener('click', function() {
            if (currentCard) {
                const orderTitle = currentCard.querySelector('h3').textContent;
                rejectOrderFromModal(orderTitle, currentCard);
                closeModal();
            }
        });
    }
    
    // Cerrar con tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
            closeModal();
        }
    });
}

function openSolicitudModal(card) {
    const modal = document.getElementById('solicitudModal');
    if (!modal) return;
    
    // Extraer información de la tarjeta
    const title = card.querySelector('h3').textContent;
    const date = card.querySelector('.order-date').textContent;
    const userInitial = card.querySelector('.user-initial').textContent;
    const requirements = card.querySelector('.order-requirements').textContent;
    const items = card.querySelectorAll('.order-item');
    const statusBtn = card.querySelector('.btn-status');
    
    // Determinar el estado
    let status = 'pending';
    let statusText = 'Pendiente';
    if (statusBtn) {
        if (statusBtn.classList.contains('completed')) {
            status = 'approved';
            statusText = 'Aprobada';
        } else if (statusBtn.classList.contains('rejected')) {
            status = 'rejected';
            statusText = 'Rechazada';
        }
    }
    
    // Llenar el modal
    document.getElementById('modalSolicitudTitle').textContent = title;
    document.getElementById('modalDate').textContent = date;
    document.getElementById('modalRequirements').textContent = requirements;
    
    // Nombre del estudiante (simulado basado en iniciales)
    const studentNames = {
        'JM': 'Juan Martínez',
        'AP': 'Ana Pérez',
        'LG': 'Luis González'
    };
    document.getElementById('modalStudentName').textContent = studentNames[userInitial] || 'Estudiante';
    
    // Número de control del usuario actual
    const controlNumber = sessionStorage.getItem('username') || '20401234';
    document.getElementById('modalControlNumber').textContent = controlNumber;
    
    // Badge de estado
    const statusBadge = document.getElementById('modalStatusBadge');
    statusBadge.textContent = statusText;
    statusBadge.className = 'modal-status-badge ' + status;
    
    // Llenar items
    const itemsList = document.getElementById('modalItemsList');
    itemsList.innerHTML = '';
    
    items.forEach(item => {
        const img = item.querySelector('img').src;
        const itemTitle = item.querySelector('.item-details h4').textContent;
        const itemDesc = item.querySelector('.item-details p').textContent;
        const itemStatus = item.querySelector('.item-status');
        
        const modalItem = document.createElement('div');
        modalItem.className = 'modal-item';
        modalItem.innerHTML = '<img src="' + img + '" alt="Item"><div class="modal-item-details"><h4>' + itemTitle + '</h4><p>' + itemDesc + '</p></div><span class="modal-item-status ' + itemStatus.className.replace('item-status', '').trim() + '">' + itemStatus.textContent + '</span>';
        
        itemsList.appendChild(modalItem);
    });
    
    // Mostrar/ocultar botones según el estado
    const approveBtn = document.getElementById('modalApproveBtn');
    const rejectBtn = document.getElementById('modalRejectBtn');
    
    if (status === 'pending') {
        if (approveBtn) approveBtn.style.display = 'flex';
        if (rejectBtn) rejectBtn.style.display = 'flex';
    } else {
        if (approveBtn) approveBtn.style.display = 'none';
        if (rejectBtn) rejectBtn.style.display = 'none';
    }
    
    // Mostrar modal
    modal.style.display = 'flex';
}

function approveOrderFromModal(orderId, card) {
    if (confirm('¿Estás seguro de aprobar la ' + orderId + '?\n\nEsta acción otorgará los beneficios solicitados al estudiante.')) {
        console.log(orderId + ' aprobada desde modal');
        
        const footer = card.querySelector('.order-footer');
        
        // Actualizar estados de los items
        const itemStatuses = card.querySelectorAll('.item-status');
        itemStatuses.forEach(status => {
            status.classList.remove('pending');
            status.classList.add('approved');
            status.textContent = 'Aprobado';
        });
        
        // Remover botones de acción
        const actions = footer.querySelector('.order-actions');
        if (actions) {
            actions.remove();
        }
        
        // Agregar estado de completada
        const statusBtn = document.createElement('button');
        statusBtn.className = 'btn-status completed';
        statusBtn.textContent = 'COMPLETADA';
        footer.appendChild(statusBtn);
        
        showNotification('✅ ' + orderId + ' aprobada exitosamente', 'success');
        updateStatistics();
    }
}

function rejectOrderFromModal(orderId, card) {
    const observaciones = document.getElementById('modalObservaciones').value.trim();
    const reason = observaciones || prompt('¿Por qué deseas rechazar la ' + orderId + '?\n\nEscribe el motivo:');
    
    if (reason !== null && reason.trim() !== '') {
        console.log(orderId + ' rechazada desde modal. Motivo: ' + reason);
        
        const footer = card.querySelector('.order-footer');
        
        // Actualizar estados de los items
        const itemStatuses = card.querySelectorAll('.item-status');
        itemStatuses.forEach(status => {
            status.classList.remove('pending');
            status.classList.add('rejected');
            status.textContent = 'Rechazado';
        });
        
        // Remover botones de acción
        const actions = footer.querySelector('.order-actions');
        if (actions) {
            actions.remove();
        }
        
        // Agregar estado de rechazada
        const statusBtn = document.createElement('button');
        statusBtn.className = 'btn-status rejected';
        statusBtn.textContent = 'RECHAZADA';
        statusBtn.title = 'Motivo: ' + reason;
        footer.appendChild(statusBtn);
        
        showNotification('❌ ' + orderId + ' rechazada', 'error');
        updateStatistics();
    } else if (reason !== null) {
        alert('Debes proporcionar un motivo para rechazar la solicitud.');
    }
}