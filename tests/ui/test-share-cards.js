#!/usr/bin/env node

// Test script for the hidden share card endpoints
import fetch from 'node-fetch';

async function testShareCards() {
    console.log('🧪 Testing Share Card APIs...\n');

    // Test URLs
    const pngUrl = 'https://bazigpt.io/api/daily-share-card-png';
    const svgUrl = 'https://bazigpt.io/api/daily-share-card';

    try {
        // Test PNG endpoint
        console.log('📸 Testing PNG Share Card...');
        const pngResponse = await fetch(pngUrl);
        console.log(`PNG Status: ${pngResponse.status}`);
        console.log(`PNG Content-Type: ${pngResponse.headers.get('content-type')}`);

        if (pngResponse.ok) {
            const pngHtml = await pngResponse.text();
            console.log(`PNG HTML Length: ${pngHtml.length} characters`);

            // Check if responsive CSS is present
            const hasResponsiveCSS = pngHtml.includes('@media') && pngHtml.includes('aspect-ratio');
            console.log(`PNG Has Responsive CSS: ${hasResponsiveCSS}`);

            // Check if JavaScript orientation detection is present
            const hasOrientationJS = pngHtml.includes('detectOrientation') && pngHtml.includes('window.innerWidth');
            console.log(`PNG Has Orientation Detection: ${hasOrientationJS}`);
        }

        console.log('\n');

        // Test SVG endpoint
        console.log('🎨 Testing SVG Share Card...');
        const svgResponse = await fetch(svgUrl);
        console.log(`SVG Status: ${svgResponse.status}`);
        console.log(`SVG Content-Type: ${svgResponse.headers.get('content-type')}`);

        if (svgResponse.ok) {
            const svgContent = await svgResponse.text();
            console.log(`SVG Content Length: ${svgContent.length} characters`);

            // Check if SVG has responsive dimensions
            const hasResponsiveDimensions = svgContent.includes('width="${width}"') && svgContent.includes('height="${height}"');
            console.log(`SVG Has Responsive Dimensions: ${hasResponsiveDimensions}`);

            // Check if SVG has orientation detection
            const hasOrientationDetection = svgContent.includes('isPortrait') && svgContent.includes('window.innerHeight');
            console.log(`SVG Has Orientation Detection: ${hasOrientationDetection}`);
        }

        console.log('\n✅ Share card tests completed!');

        // Test with different viewport sizes
        console.log('\n📱 Testing with different viewport sizes...');

        // Test landscape viewport
        const landscapeResponse = await fetch(pngUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (landscapeResponse.ok) {
            const landscapeHtml = await landscapeResponse.text();
            const hasLandscapeStyles = landscapeHtml.includes('min-aspect-ratio: 1/1');
            console.log(`Landscape Styles Present: ${hasLandscapeStyles}`);
        }

    } catch (error) {
        console.error('❌ Error testing share cards:', error.message);
    }
}

// Run the test
testShareCards(); 