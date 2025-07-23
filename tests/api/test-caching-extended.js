#!/usr/bin/env node

/**
 * Extended caching test to check persistence across time periods
 * Tests if cache survives potential cold starts and time-based invalidation
 */

const API_URL = 'https://bazigpt.io/api/daily-bazi';

async function testExtendedCaching() {
    console.log('🧪 Extended Caching Test - Checking Daily Persistence...\n');

    const results = [];

    // Test 1: Initial request
    console.log('📡 Test 1: Initial request (should be fresh)');
    const result1 = await makeRequest(1);
    results.push(result1);

    // Test 2: Immediate follow-up (should be cached)
    console.log('📡 Test 2: Immediate follow-up (should be cached)');
    const result2 = await makeRequest(2);
    results.push(result2);

    // Test 3: After 30 seconds (should still be cached)
    console.log('📡 Test 3: After 30 seconds (should still be cached)');
    await new Promise(resolve => setTimeout(resolve, 30000));
    const result3 = await makeRequest(3);
    results.push(result3);

    // Test 4: After 2 minutes (should still be cached)
    console.log('📡 Test 4: After 2 minutes (should still be cached)');
    await new Promise(resolve => setTimeout(resolve, 90000)); // 1.5 more minutes
    const result4 = await makeRequest(4);
    results.push(result4);

    // Test 5: Force refresh parameter
    console.log('📡 Test 5: Force refresh (should be fresh)');
    const result5 = await makeRequest(5, true);
    results.push(result5);

    // Test 6: After force refresh (should be cached again)
    console.log('📡 Test 6: After force refresh (should be cached)');
    const result6 = await makeRequest(6);
    results.push(result6);

    console.log('\n📊 Extended Results Summary:');
    console.log('============================');

    const cachedRequests = results.filter(r => r.cached === true).length;
    const totalRequests = results.length;

    console.log(`Total Requests: ${totalRequests}`);
    console.log(`Cached Responses: ${cachedRequests}`);
    console.log(`Cache Hit Rate: ${((cachedRequests / totalRequests) * 100).toFixed(1)}%`);

    console.log('\n🔍 Detailed Timeline:');
    results.forEach(result => {
        const status = result.cached ? '✅ CACHED' : '🔄 FRESH';
        const time = result.timestamp ? new Date(result.timestamp).toLocaleTimeString() : 'N/A';
        console.log(`${result.test}: ${status} (${result.duration}ms) at ${time}`);
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

    // Check for cold start behavior
    const freshRequests = results.filter(r => !r.cached);
    if (freshRequests.length > 1) {
        console.log('\n⚠️  Multiple fresh requests detected - possible cold starts or cache invalidation');
        freshRequests.forEach(r => {
            console.log(`   Fresh request ${r.test}: ${r.timestamp ? new Date(r.timestamp).toLocaleTimeString() : 'N/A'}`);
        });
    } else {
        console.log('\n✅ Cache appears to persist across time periods');
    }
}

async function makeRequest(testNumber, forceRefresh = false) {
    const url = forceRefresh ? `${API_URL}?force=true` : API_URL;
    const startTime = Date.now();

    try {
        const response = await fetch(url);
        const data = await response.json();
        const endTime = Date.now();
        const duration = endTime - startTime;

        const result = {
            test: testNumber,
            cached: data.cached,
            duration: duration,
            date: data.date,
            baziPillar: data.baziPillar,
            timestamp: new Date().toISOString(),
            forceRefresh: forceRefresh
        };

        console.log(`   ✅ Cached: ${data.cached}, Duration: ${duration}ms, Date: ${data.date}`);

        return result;

    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return {
            test: testNumber,
            error: error.message,
            timestamp: new Date().toISOString(),
            forceRefresh: forceRefresh
        };
    }
}

// Run the extended test
testExtendedCaching().catch(console.error); 