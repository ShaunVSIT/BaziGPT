#!/usr/bin/env node

// Test the main daily forecast API locally
const BASE_URL = 'http://localhost:3000';

async function testDailyAPI() {
    console.log('🧪 Testing Main Daily Forecast API...\n');

    try {
        console.log(`📋 Testing: ${BASE_URL}/api/daily-bazi`);

        const response = await fetch(`${BASE_URL}/api/daily-bazi`);

        console.log(`📊 Status: ${response.status}`);
        console.log(`📄 Content-Type: ${response.headers.get('content-type')}`);

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ SUCCESS: Got daily forecast`);
            console.log(`📅 Date: ${data.date}`);
            console.log(`🔮 Bazi Pillar: ${data.baziPillar}`);
            console.log(`📝 Forecast: ${data.forecast.substring(0, 100)}...`);
            console.log(`💾 Cached: ${data.cached}`);

            // Check if it's real or hardcoded
            if (data.baziPillar === "Yang Fire over Monkey") {
                console.log(`⚠️  WARNING: Using hardcoded content`);
            } else {
                console.log(`✅ SUCCESS: Using real forecast data`);
            }
        } else {
            console.log(`❌ Error: ${response.statusText}`);
        }

    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        console.log(`💡 Make sure your dev server is running: npm run dev`);
    }

    console.log('\n🎯 Next steps:');
    console.log('1. If daily-bazi API works → Share cards should work');
    console.log('2. If daily-bazi API fails → Fix that first');
    console.log('3. Check browser: http://localhost:3000/api/daily-bazi');
}

// Run the test
testDailyAPI().catch(console.error); 