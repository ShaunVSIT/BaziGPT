#!/usr/bin/env node

// Local test script for share card endpoints
const BASE_URL = 'http://localhost:3000'; // Local development server

async function testLocalShareCards() {
    console.log('🧪 Testing Share Card Endpoints Locally...\n');

    const endpoints = [
        {
            name: 'SVG Share Card',
            url: '/api/daily-share-card',
            description: 'Returns SVG image'
        },
        {
            name: 'HTML Share Card',
            url: '/api/daily-share-card-png',
            description: 'Returns HTML for PNG conversion'
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

                // Check if it's real forecast or hardcoded
                if (content.includes('Yang Fire over Monkey')) {
                    console.log(`⚠️  WARNING: Still using hardcoded content`);
                } else {
                    console.log(`✅ SUCCESS: Using real forecast data`);
                }

                console.log(`📄 Content preview: ${content.substring(0, 100)}...`);
            } else {
                console.log(`❌ Error: ${response.statusText}`);
            }

        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
            console.log(`💡 Make sure your dev server is running: npm run dev`);
        }

        console.log('─'.repeat(50));
        console.log('');

        // Wait 1 second between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('🎯 To test:');
    console.log('1. Start dev server: npm run dev');
    console.log('2. Run this test: node test-local.js');
    console.log('3. Check browser: http://localhost:3000/api/daily-share-card');
    console.log('4. Check browser: http://localhost:3000/api/daily-share-card-png');
}

// Run the test
testLocalShareCards().catch(console.error); 