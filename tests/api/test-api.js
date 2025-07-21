#!/usr/bin/env node

// Test script for the daily-bazi API
const BASE_URL = 'https://your-domain.vercel.app'; // Replace with your actual domain

async function testAPI() {
    console.log('🧪 Testing Daily Bazi API...\n');

    const tests = [
        {
            name: 'Normal Request (should use cache)',
            url: '/api/daily-bazi'
        },
        {
            name: 'Force Refresh (should call OpenAI)',
            url: '/api/daily-bazi?force=true'
        },
        {
            name: 'Test Different Date',
            url: '/api/daily-bazi?date=2025-01-28'
        },
        {
            name: 'Force Refresh with Test Date',
            url: '/api/daily-bazi?force=true&date=2025-01-29'
        }
    ];

    for (const test of tests) {
        console.log(`📋 ${test.name}`);
        console.log(`🔗 ${BASE_URL}${test.url}`);

        try {
            const startTime = Date.now();
            const response = await fetch(`${BASE_URL}${test.url}`);
            const endTime = Date.now();

            const data = await response.json();

            console.log(`⏱️  Response time: ${endTime - startTime}ms`);
            console.log(`📊 Status: ${response.status}`);
            console.log(`💾 Cached: ${data.cached}`);
            console.log(`📅 Date: ${data.date}`);
            console.log(`🔮 Bazi Pillar: ${data.baziPillar}`);
            console.log(`📝 Forecast: ${data.forecast.substring(0, 100)}...`);

            if (data.error) {
                console.log(`❌ Error: ${data.error}`);
            }

        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }

        console.log('─'.repeat(50));
        console.log('');

        // Wait 2 seconds between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

// Run the test
testAPI().catch(console.error); 