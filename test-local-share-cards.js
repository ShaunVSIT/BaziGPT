import fetch from 'node-fetch';

async function testLocalShareCards() {
    console.log('🧪 Testing Local Share Card APIs...\n');

    // Test URLs for local development
    const localPngUrl = 'http://localhost:3001/api/daily-share-card-png';
    const localSvgUrl = 'http://localhost:3001/api/daily-share-card';
    const localPortraitPngUrl = 'http://localhost:3001/api/daily-share-card-portrait';
    const localPortraitSvgUrl = 'http://localhost:3001/api/daily-share-card-portrait-svg';

    try {
        // Test original PNG endpoint
        console.log('📸 Testing Original PNG Share Card...');
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

        // Test original SVG endpoint
        console.log('🎨 Testing Original SVG Share Card...');
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

        console.log('\n');

        // Test dedicated Portrait PNG endpoint
        console.log('📱 Testing Dedicated Portrait PNG Share Card...');
        const portraitPngResponse = await fetch(localPortraitPngUrl);
        console.log(`Portrait PNG Status: ${portraitPngResponse.status}`);
        console.log(`Portrait PNG Content-Type: ${portraitPngResponse.headers.get('content-type')}`);

        if (portraitPngResponse.ok) {
            const portraitPngHtml = await portraitPngResponse.text();
            console.log(`Portrait PNG HTML Length: ${portraitPngHtml.length} characters`);

            // Check for portrait-specific features
            const hasPortraitDimensions = portraitPngHtml.includes('width: 800px') && portraitPngHtml.includes('height: 1200px');
            const hasPortraitLayout = portraitPngHtml.includes('justify-content: flex-start') && portraitPngHtml.includes('gap: 25px');
            const hasEnhancedTypography = portraitPngHtml.includes('font-size: 52px') && portraitPngHtml.includes('font-size: 20px');
            const hasTextShadows = portraitPngHtml.includes('text-shadow: 0 2px 4px rgba(0,0,0,0.3)');
            const hasBackgroundElements = portraitPngHtml.includes('background: rgba(255, 255, 255, 0.05)');

            console.log(`Portrait PNG Has Portrait Dimensions: ${hasPortraitDimensions}`);
            console.log(`Portrait PNG Has Portrait Layout: ${hasPortraitLayout}`);
            console.log(`Portrait PNG Has Enhanced Typography: ${hasEnhancedTypography}`);
            console.log(`Portrait PNG Has Text Shadows: ${hasTextShadows}`);
            console.log(`Portrait PNG Has Background Elements: ${hasBackgroundElements}`);
        } else {
            console.log(`❌ Portrait PNG Error: ${portraitPngResponse.statusText}`);
        }

        console.log('\n');

        // Test dedicated Portrait SVG endpoint
        console.log('🎨 Testing Dedicated Portrait SVG Share Card...');
        const portraitSvgResponse = await fetch(localPortraitSvgUrl);
        console.log(`Portrait SVG Status: ${portraitSvgResponse.status}`);
        console.log(`Portrait SVG Content-Type: ${portraitSvgResponse.headers.get('content-type')}`);

        if (portraitSvgResponse.ok) {
            const portraitSvgContent = await portraitSvgResponse.text();
            console.log(`Portrait SVG Content Length: ${portraitSvgContent.length} characters`);

            // Check for portrait-specific SVG features
            const hasPortraitDimensions = portraitSvgContent.includes('width="800"') && portraitSvgContent.includes('height="1200"');
            const hasEnhancedStyling = portraitSvgContent.includes('filter="url(#shadow)"');
            const hasBackgroundRect = portraitSvgContent.includes('fill="rgba(255,152,0,0.1)"');
            const hasForecastBackground = portraitSvgContent.includes('fill="rgba(255,255,255,0.05)"');
            const hasOptimizedText = portraitSvgContent.includes('font-size="56"') && portraitSvgContent.includes('font-size="20"');

            console.log(`Portrait SVG Has Portrait Dimensions: ${hasPortraitDimensions}`);
            console.log(`Portrait SVG Has Enhanced Styling: ${hasEnhancedStyling}`);
            console.log(`Portrait SVG Has Background Elements: ${hasBackgroundRect}`);
            console.log(`Portrait SVG Has Forecast Background: ${hasForecastBackground}`);
            console.log(`Portrait SVG Has Optimized Text: ${hasOptimizedText}`);
        } else {
            console.log(`❌ Portrait SVG Error: ${portraitSvgResponse.statusText}`);
        }

        console.log('\n✅ Local share card tests completed!');

        // Test with different User-Agent headers to simulate different devices
        console.log('\n📱 Testing with different device simulations...');

        // Test with mobile User-Agent (portrait)
        const mobileResponse = await fetch(localPortraitPngUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
            }
        });

        if (mobileResponse.ok) {
            const mobileHtml = await mobileResponse.text();
            const hasMobileOptimization = mobileHtml.includes('width: 800px') && mobileHtml.includes('height: 1200px');
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