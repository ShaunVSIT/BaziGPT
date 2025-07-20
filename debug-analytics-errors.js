// Debug Analytics Errors Script
// Run this to check for analytics-related issues

(function () {
    console.log('=== Analytics Error Debug ===');

    // Check for any analytics-related errors in console
    console.log('🔍 Checking for analytics errors...');

    // Check if va function exists and what it contains
    if (window.va) {
        console.log('✅ window.va exists');
        console.log('Type of window.va:', typeof window.va);
        console.log('window.va.toString():', window.va.toString());

        // Try to call va function directly
        try {
            window.va('event', 'test_event', { test: true });
            console.log('✅ Direct va() call works');
        } catch (error) {
            console.log('❌ Direct va() call failed:', error);
        }

        // Check if track property exists
        if (window.va.track) {
            console.log('✅ window.va.track exists');
        } else {
            console.log('❌ window.va.track does not exist');
            console.log('Available properties on window.va:', Object.keys(window.va));
        }
    } else {
        console.log('❌ window.va does not exist');
    }

    // Check for any script loading errors
    const scripts = document.querySelectorAll('script');
    const analyticsScripts = Array.from(scripts).filter(script =>
        script.src && script.src.includes('vercel') ||
        script.src && script.src.includes('analytics') ||
        script.src && script.src.includes('insights')
    );

    console.log('Analytics-related scripts found:', analyticsScripts.length);
    analyticsScripts.forEach((script, index) => {
        console.log(`Script ${index + 1}:`, script.src);
    });

    // Check for network errors
    console.log('🔍 Check the Network tab for any failed requests to:');
    console.log('- /_vercel/insights/script.js');
    console.log('- /_vercel/insights/view');
    console.log('- Any other analytics-related URLs');

    // Check if we're on the correct domain
    console.log('Current domain:', window.location.hostname);
    console.log('Expected domain should be your Vercel deployment URL');

    console.log('=== End Analytics Error Debug ===');
})(); 