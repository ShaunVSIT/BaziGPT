// Debug script for SocialFooter visibility issue
// Run this in the browser console when the footer disappears

(function () {
    console.log('=== SocialFooter Debug Script ===');

    // Check if SocialFooter component exists in DOM
    const socialFooter = document.querySelector('[data-testid="social-footer"]');
    console.log('SocialFooter in DOM:', !!socialFooter);

    if (socialFooter) {
        console.log('SocialFooter styles:', window.getComputedStyle(socialFooter));
        console.log('SocialFooter visibility:', window.getComputedStyle(socialFooter).visibility);
        console.log('SocialFooter display:', window.getComputedStyle(socialFooter).display);
        console.log('SocialFooter opacity:', window.getComputedStyle(socialFooter).opacity);
        console.log('SocialFooter position:', window.getComputedStyle(socialFooter).position);
        console.log('SocialFooter z-index:', window.getComputedStyle(socialFooter).zIndex);
    }

    // Check for any CSS that might be hiding the footer
    const allElements = document.querySelectorAll('*');
    const hiddenElements = Array.from(allElements).filter(el => {
        const style = window.getComputedStyle(el);
        return style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0';
    });

    console.log('Hidden elements found:', hiddenElements.length);

    // Check for service worker status
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            console.log('Service workers:', registrations.length);
            registrations.forEach((registration, index) => {
                console.log(`Service worker ${index}:`, registration.active ? 'active' : 'inactive');
            });
        });
    }

    // Check localStorage for any cached data that might affect rendering
    console.log('localStorage keys:', Object.keys(localStorage));
    console.log('sessionStorage keys:', Object.keys(sessionStorage));

    // Check for any React errors in console
    console.log('=== End Debug Script ===');
})(); 