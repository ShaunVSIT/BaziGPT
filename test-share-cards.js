#!/usr/bin/env node

// Test script for the hidden share card endpoints
const BASE_URL = 'https://bazigpt.xyz'; // Replace with your actual domain

async function testShareCards() {
    console.log('🖼️  Testing Hidden Share Card Endpoints...\n');

    const endpoints = [
        {
            name: 'SVG Share Card',
            url: '/api/daily-share-card',
            description: 'Returns SVG image (good for web)'
        },
        {
            name: 'HTML Share Card',
            url: '/api/daily-share-card-png',
            description: 'Returns HTML (can be converted to PNG by services)'
        }
    ];

    for (const endpoint of endpoints) {
        console.log(`📋 ${endpoint.name}`);
        console.log(`🔗 ${BASE_URL}${endpoint.url}`);
        console.log(`📝 ${endpoint.description}`);

        try {
            const response = await fetch(`${BASE_URL}${endpoint.url}`);

            console.log(`📊 Status: ${response.status}`);
            console.log(`📄 Content-Type: ${response.headers.get('content-type')}`);

            if (response.ok) {
                const content = await response.text();
                console.log(`📏 Content length: ${content.length} characters`);
                console.log(`✅ Success! Content preview: ${content.substring(0, 100)}...`);
            } else {
                console.log(`❌ Error: ${response.statusText}`);
            }

        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }

        console.log('─'.repeat(50));
        console.log('');

        // Wait 1 second between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('🎯 For your tweetbot, you can:');
    console.log('1. Use the SVG endpoint for web display');
    console.log('2. Use the HTML endpoint and convert to PNG with a service like:');
    console.log('   - Puppeteer');
    console.log('   - Playwright');
    console.log('   - Browserless.io');
    console.log('   - Screenshotapi.net');
    console.log('');
    console.log('📱 Example tweetbot workflow:');
    console.log('1. Fetch: GET /api/daily-share-card-png');
    console.log('2. Convert HTML to PNG');
    console.log('3. Upload to Twitter');
    console.log('4. Post with caption: "Today\'s Bazi Forecast 🀄"');
}

// Run the test
testShareCards().catch(console.error); 