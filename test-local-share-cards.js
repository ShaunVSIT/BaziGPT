import fetch from 'node-fetch';

async function testLocalShareCards() {
    console.log('🧪 Testing Local Share Card APIs...\n');

    // Test URLs for local development
    const localPngUrl = 'http://localhost:3001/api/daily-share-card-png';
    const localSvgUrl = 'http://localhost:3001/api/daily-share-card';

    try {
        // Test PNG endpoint
        console.log('📸 Testing Local PNG Share Card...');
        const pngResponse = await fetch(localPngUrl);
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

            // Check for specific responsive features
            const hasPortraitStyles = pngHtml.includes('max-aspect-ratio: 1/1');
            const hasLandscapeStyles = pngHtml.includes('min-aspect-ratio: 1/1');
            console.log(`PNG Has Portrait Styles: ${hasPortraitStyles}`);
            console.log(`PNG Has Landscape Styles: ${hasLandscapeStyles}`);

            // Check for specific responsive dimensions
            const hasPortraitDimensions = pngHtml.includes('width: 800px') && pngHtml.includes('height: 1200px');
            const hasLandscapeDimensions = pngHtml.includes('width: 1200px') && pngHtml.includes('height: 630px');
            console.log(`PNG Has Portrait Dimensions: ${hasPortraitDimensions}`);
            console.log(`PNG Has Landscape Dimensions: ${hasLandscapeDimensions}`);
        } else {
            console.log(`❌ PNG Error: ${pngResponse.statusText}`);
        }

        console.log('\n');

        // Test SVG endpoint
        console.log('🎨 Testing Local SVG Share Card...');
        const svgResponse = await fetch(localSvgUrl);
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

            // Check for specific responsive features
            const hasPortraitWidth = svgContent.includes('width = isPortrait ? 800 : 1200');
            const hasPortraitHeight = svgContent.includes('height = isPortrait ? 1200 : 630');
            console.log(`SVG Has Portrait Width Logic: ${hasPortraitWidth}`);
            console.log(`SVG Has Portrait Height Logic: ${hasPortraitHeight}`);

            // Check for responsive text sizing
            const hasResponsiveText = svgContent.includes('titleSize = isPortrait ? 56 : 48');
            console.log(`SVG Has Responsive Text Sizing: ${hasResponsiveText}`);
        } else {
            console.log(`❌ SVG Error: ${svgResponse.statusText}`);
        }

        console.log('\n✅ Local share card tests completed!');

        // Test with different User-Agent headers to simulate different devices
        console.log('\n📱 Testing with different device simulations...');

        // Test with mobile User-Agent (portrait)
        const mobileResponse = await fetch(localPngUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
            }
        });

        if (mobileResponse.ok) {
            const mobileHtml = await mobileResponse.text();
            const hasMobileOptimization = mobileHtml.includes('max-aspect-ratio: 1/1');
            console.log(`Mobile Optimization Present: ${hasMobileOptimization}`);
        }

    } catch (error) {
        console.error('❌ Error testing local share cards:', error.message);
        console.log('\n💡 Make sure your local development server is running:');
        console.log('   npm run dev');
        console.log('   or');
        console.log('   yarn dev');
    }
}

// Run the test
testLocalShareCards(); 