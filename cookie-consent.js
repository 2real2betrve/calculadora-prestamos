// ===================================
// COOKIE CONSENT BANNER - ESPAÑOL
// ===================================

(function() {
    'use strict';
    
    // Verificar si ya se dio consentimiento
    const cookieConsent = localStorage.getItem('cookieConsent');
    
    if (!cookieConsent) {
        // Crear el banner
        const banner = document.createElement('div');
        banner.className = 'cookie-consent';
        banner.id = 'cookieConsent';
        
        banner.innerHTML = `
            <div class="cookie-content">
                <p>
                    🍪 Utilizamos cookies para mejorar tu experiencia. Al continuar navegando, aceptas nuestra 
                    <a href="privacy.html">Política de Privacidad</a>.
                </p>
                <div class="cookie-buttons">
                    <button class="cookie-btn cookie-accept" onclick="acceptCookies()">
                        ✓ Aceptar
                    </button>
                    <button class="cookie-btn cookie-decline" onclick="declineCookies()">
                        ✗ Rechazar
                    </button>
                </div>
            </div>
        `;
        
        // Agregar al documento
        document.body.appendChild(banner);
    }
})();

// Aceptar cookies
function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    hideCookieBanner();
    // Aquí puedes activar Google Analytics u otras cookies
    console.log('Cookies aceptadas');
}

// Rechazar cookies
function declineCookies() {
    localStorage.setItem('cookieConsent', 'declined');
    hideCookieBanner();
    console.log('Cookies rechazadas');
}

// Ocultar banner
function hideCookieBanner() {
    const banner = document.getElementById('cookieConsent');
    if (banner) {
        banner.style.animation = 'slideDown 0.5s ease';
        setTimeout(() => {
            banner.remove();
        }, 500);
    }
}
