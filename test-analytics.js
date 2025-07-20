// Test script for Vercel Analytics
// Run this in the browser console to test analytics functionality

console.log('=== Vercel Analytics Test ===');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('URL:', window.location.href);

// Check if we're in development mode
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔧 Development mode detected - Analytics will not send data to Vercel');
    console.log('📊 To test analytics, deploy to Vercel and test on the production URL');
}

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
        window.va.track('test_event', {
            test: true,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        });
        console.log('✅ Custom event tracking test sent');
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

console.log('=== End Analytics Test ===');
console.log('Check your Vercel dashboard for these test events'); 