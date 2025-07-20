import fetch from 'node-fetch';

async function debugPortraitEndpoint() {
    console.log('🔍 Debugging Updated Portrait Endpoints...\n');

    const portraitPngUrl = 'http://localhost:3001/api/daily-share-card-portrait';
    const portraitSvgUrl = 'http://localhost:3001/api/daily-share-card-portrait-svg';

    try {
        // Test Portrait PNG endpoint
        console.log('📱 Testing Updated Portrait PNG...');
        const pngResponse = await fetch(portraitPngUrl);
        console.log(`PNG Status: ${pngResponse.status}`);
        console.log(`PNG Content-Type: ${pngResponse.headers.get('content-type')}`);

        if (pngResponse.ok) {
            const pngHtml = await pngResponse.text();
            console.log(`PNG HTML Length: ${pngHtml.length} characters`);

            // Check for improved features
            const hasParagraphs = pngHtml.includes('<p>') && pngHtml.includes('</p>');
            const hasBetterSpacing = pngHtml.includes('gap: 20px') && pngHtml.includes('gap: 15px');
            const hasImprovedTypography = pngHtml.includes('font-size: 18px') && pngHtml.includes('line-height: 1.5');
            const hasParagraphStyling = pngHtml.includes('.forecast p {') && pngHtml.includes('text-align: justify');
            const hasMaxHeight = pngHtml.includes('max-height: 700px');

            console.log(`PNG Has Paragraphs: ${hasParagraphs}`);
            console.log(`PNG Has Better Spacing: ${hasBetterSpacing}`);
            console.log(`PNG Has Improved Typography: ${hasImprovedTypography}`);
            console.log(`PNG Has Paragraph Styling: ${hasParagraphStyling}`);
            console.log(`PNG Has Max Height: ${hasMaxHeight}`);

            // Check for template variables
            const hasTemplateVars = pngHtml.includes('${') || pngHtml.includes('formattedDate') || pngHtml.includes('baziPillar') || pngHtml.includes('forecast');
            console.log(`PNG Has Template Variables: ${hasTemplateVars}`);

            if (hasTemplateVars) {
                console.log('\n❌ ISSUE: Template variables not replaced!');
            } else {
                console.log('\n✅ PNG looks good - no template variables found');
            }
        } else {
            console.log(`PNG Error: ${pngResponse.statusText}`);
        }

        console.log('\n');

        // Test Portrait SVG endpoint
        console.log('🎨 Testing Updated Portrait SVG...');
        const svgResponse = await fetch(portraitSvgUrl);
        console.log(`SVG Status: ${svgResponse.status}`);
        console.log(`SVG Content-Type: ${svgResponse.headers.get('content-type')}`);

        if (svgResponse.ok) {
            const svgContent = await svgResponse.text();
            console.log(`SVG Content Length: ${svgContent.length} characters`);

            // Check for improved SVG features
            const hasParagraphGap = svgContent.includes('paragraphGap = 15');
            const hasMaxLines = svgContent.includes('maxLines = 20');
            const hasImprovedFontSizes = svgContent.includes('font-size="48"') && svgContent.includes('font-size="18"');
            const hasParagraphLogic = svgContent.includes('paragraphIndex > 0') && svgContent.includes('paragraphGap');
            const hasBetterHeight = svgContent.includes('height="650"');

            console.log(`SVG Has Paragraph Gap: ${hasParagraphGap}`);
            console.log(`SVG Has Max Lines: ${hasMaxLines}`);
            console.log(`SVG Has Improved Font Sizes: ${hasImprovedFontSizes}`);
            console.log(`SVG Has Paragraph Logic: ${hasParagraphLogic}`);
            console.log(`SVG Has Better Height: ${hasBetterHeight}`);

            // Check for template variables
            const hasSvgTemplateVars = svgContent.includes('${') || svgContent.includes('formattedDate') || svgContent.includes('baziPillar') || svgContent.includes('forecast');
            console.log(`SVG Has Template Variables: ${hasSvgTemplateVars}`);

            if (hasSvgTemplateVars) {
                console.log('\n❌ ISSUE: SVG template variables not replaced!');
            } else {
                console.log('\n✅ SVG looks good - no template variables found');
            }
        } else {
            console.log(`SVG Error: ${svgResponse.statusText}`);
        }

        console.log('\n✅ Portrait endpoint debugging completed!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Make sure your local development server is running:');
        console.log('   npm run dev');
    }
}

debugPortraitEndpoint(); 