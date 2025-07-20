// Production Analytics Test Script
// Only run this on your production Vercel deployment (not localhost)

(function () {
    console.log('=== Production Vercel Analytics Test ===');

    // Verify we're on production
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('❌ This test should only be run on production deployment');
        console.log('🚀 Deploy to Vercel and run this test on your production URL');
        console.log('=== End Test (Development Mode) ===');
        return;
    }

    console.log('✅ Production environment detected');

    // Test 1: Check if Analytics is loaded
    if (typeof window !== 'undefined' && window.va) {
        console.log('✅ Vercel Analytics is loaded:', window.va);
    } else {
        console.log('❌ Vercel Analytics not found');
    }

    // Test 2: Check for track function
    if (typeof window !== 'undefined' && window.va && window.va.track) {
        console.log('✅ Track function available');
    } else {
        console.log('❌ Track function not available');
    }

    // Test 3: Test custom event tracking
    try {
        if (window.va && window.va.track) {
            window.va.track('production_test_event', {
                test: true,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            });
            console.log('✅ Production custom event tracking test sent');
        }
    } catch (error) {
        console.error('❌ Error testing custom event:', error);
    }

    // Test 4: Check for page view tracking
    console.log('Current URL:', window.location.href);
    console.log('Current pathname:', window.location.pathname);

    // Test 5: Check for any analytics errors in console
    console.log('Check the console for any analytics-related errors');

    // Test 6: Verify Analytics component is in DOM
    const analyticsElements = document.querySelectorAll('[data-va]');
    console.log('Analytics elements in DOM:', analyticsElements.length);

    // Test 7: Check for web-vitals
    if (typeof window !== 'undefined' && 'web-vital' in window) {
        console.log('✅ Web Vitals available');
    } else {
        console.log('❌ Web Vitals not available');
    }

    // Test 8: Check localStorage for analytics data
    const analyticsKeys = Object.keys(localStorage).filter(key =>
        key.includes('analytics') || key.includes('va') || key.includes('vercel')
    );
    console.log('Analytics-related localStorage keys:', analyticsKeys);

    console.log('=== End Production Analytics Test ===');
    console.log('📊 Check your Vercel dashboard for these test events');
    console.log('⏰ It may take 24-48 hours for data to appear in the dashboard');
})(); 