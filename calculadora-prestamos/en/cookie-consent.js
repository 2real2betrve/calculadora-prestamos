// ===================================
// COOKIE CONSENT BANNER - ENGLISH
// ===================================

(function() {
    'use strict';
    
    // Check if consent was already given
    const cookieConsent = localStorage.getItem('cookieConsent');
    
    if (!cookieConsent) {
        // Create the banner
        const banner = document.createElement('div');
        banner.className = 'cookie-consent';
        banner.id = 'cookieConsent';
        
        banner.innerHTML = `
            <div class="cookie-content">
                <p>
                    🍪 We use cookies to improve your experience. By continuing to browse, you accept our 
                    <a href="privacy.html">Privacy Policy</a>.
                </p>
                <div class="cookie-buttons">
                    <button class="cookie-btn cookie-accept" onclick="acceptCookies()">
                        ✓ Accept
                    </button>
                    <button class="cookie-btn cookie-decline" onclick="declineCookies()">
                        ✗ Decline
                    </button>
                </div>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(banner);
    }
})();

// Accept cookies
function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    hideCookieBanner();
    // Here you can activate Google Analytics or other cookies
    console.log('Cookies accepted');
}

// Decline cookies
function declineCookies() {
    localStorage.setItem('cookieConsent', 'declined');
    hideCookieBanner();
    console.log('Cookies declined');
}

// Hide banner
function hideCookieBanner() {
    const banner = document.getElementById('cookieConsent');
    if (banner) {
        banner.style.animation = 'slideDown 0.5s ease';
        setTimeout(() => {
            banner.remove();
        }, 500);
    }
}
