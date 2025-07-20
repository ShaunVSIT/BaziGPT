import fetch from 'node-fetch';

async function debugPortraitEndpoint() {
    console.log('🔍 Debugging Portrait Endpoint...\n');

    const portraitUrl = 'http://localhost:3001/api/daily-share-card-portrait';

    try {
        const response = await fetch(portraitUrl);
        console.log(`Status: ${response.status}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);

        if (response.ok) {
            const html = await response.text();
            console.log(`HTML Length: ${html.length} characters`);

            // Check for key elements
            const hasTitle = html.includes('Daily Bazi Forecast');
            const hasDate = html.includes('formattedDate');
            const hasPillar = html.includes('baziPillar');
            const hasForecast = html.includes('forecast');
            const hasBody = html.includes('<body>');
            const hasContainer = html.includes('class="container"');
            const hasBackground = html.includes('background: linear-gradient');

            console.log(`Has Title: ${hasTitle}`);
            console.log(`Has Date: ${hasDate}`);
            console.log(`Has Pillar: ${hasPillar}`);
            console.log(`Has Forecast: ${hasForecast}`);
            console.log(`Has Body: ${hasBody}`);
            console.log(`Has Container: ${hasContainer}`);
            console.log(`Has Background: ${hasBackground}`);

            // Check for template variables that might not be replaced
            const hasTemplateVars = html.includes('${') || html.includes('formattedDate') || html.includes('baziPillar') || html.includes('forecast');
            console.log(`Has Template Variables: ${hasTemplateVars}`);

            if (hasTemplateVars) {
                console.log('\n❌ ISSUE FOUND: Template variables not replaced!');
                console.log('This means the data is not being passed correctly to the template.');
            }

            // Show first 500 characters
            console.log('\n📄 First 500 characters:');
            console.log(html.substring(0, 500));

            // Show last 500 characters
            console.log('\n📄 Last 500 characters:');
            console.log(html.substring(html.length - 500));

        } else {
            console.log(`Error: ${response.statusText}`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

debugPortraitEndpoint(); 