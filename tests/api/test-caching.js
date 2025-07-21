#!/usr/bin/env node

/**
 * Test caching behavior in production
 * Makes multiple rapid requests to check if caching is working properly
 */

const API_URL = 'https://bazigpt.xyz/api/daily-bazi';

async function testCaching() {
    console.log('🧪 Testing Caching Behavior in Production...\n');

    const results = [];

    // Make 5 rapid requests
    for (let i = 1; i <= 5; i++) {
        console.log(`📡 Request ${i}...`);

        const startTime = Date.now();

        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            const endTime = Date.now();
            const duration = endTime - startTime;

            results.push({
                request: i,
                cached: data.cached,
                duration: duration,
                date: data.date,
                baziPillar: data.baziPillar,
                forecastLength: data.forecast.length
            });

            console.log(`   ✅ Cached: ${data.cached}, Duration: ${duration}ms, Date: ${data.date}`);

        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
            results.push({
                request: i,
                error: error.message
            });
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n📊 Results Summary:');
    console.log('==================');

    const cachedRequests = results.filter(r => r.cached === true).length;
    const totalRequests = results.length;

    console.log(`Total Requests: ${totalRequests}`);
    console.log(`Cached Responses: ${cachedRequests}`);
    console.log(`Cache Hit Rate: ${((cachedRequests / totalRequests) * 100).toFixed(1)}%`);

    if (cachedRequests > 0) {
        const avgDuration = results
            .filter(r => r.duration)
            .reduce((sum, r) => sum + r.duration, 0) / results.filter(r => r.duration).length;
        console.log(`Average Response Time: ${avgDuration.toFixed(0)}ms`);
    }

    console.log('\n🔍 Detailed Results:');
    results.forEach(result => {
        if (result.error) {
            console.log(`Request ${result.request}: ❌ ${result.error}`);
        } else {
            console.log(`Request ${result.request}: ${result.cached ? '✅ CACHED' : '🔄 FRESH'} (${result.duration}ms)`);
        }
    });

    // Check for consistency
    const uniqueDates = [...new Set(results.filter(r => r.date).map(r => r.date))];
    const uniquePillars = [...new Set(results.filter(r => r.baziPillar).map(r => r.baziPillar))];

    console.log('\n🔍 Consistency Check:');
    console.log(`Unique Dates: ${uniqueDates.length} (${uniqueDates.join(', ')})`);
    console.log(`Unique Bazi Pillars: ${uniquePillars.length} (${uniquePillars.join(', ')})`);

    if (uniqueDates.length === 1 && uniquePillars.length === 1) {
        console.log('✅ All responses are consistent!');
    } else {
        console.log('⚠️  Inconsistent responses detected!');
    }
}

// Run the test
testCaching().catch(console.error); 