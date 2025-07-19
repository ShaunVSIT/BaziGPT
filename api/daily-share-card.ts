import type { VercelRequest, VercelResponse } from '@vercel/node';

interface DailyBaziForecast {
    date: string;
    baziPillar: string;
    forecast: string;
    cached: boolean;
}

interface ShareCardData {
    date: string;
    baziPillar: string;
    forecast: string;
}

// Generate SVG share card
function generateShareCardSVG(data: ShareCardData): string {
    const { date, baziPillar, forecast } = data;

    // Format date nicely
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#2d2d2d;stop-opacity:1" />
            </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="1200" height="630" fill="url(#bg)"/>
        
        <!-- Decorative elements -->
        <circle cx="100" cy="100" r="50" fill="none" stroke="#ff9800" stroke-width="2" opacity="0.3"/>
        <circle cx="1100" cy="530" r="80" fill="none" stroke="#ff9800" stroke-width="2" opacity="0.2"/>
        
        <!-- Main content -->
        <g font-family="Arial, sans-serif">
            <!-- Title -->
            <text x="600" y="120" text-anchor="middle" font-size="48" font-weight="bold" fill="#ffffff">
                Daily Bazi Forecast
            </text>
            
            <!-- Date -->
            <text x="600" y="180" text-anchor="middle" font-size="24" fill="#ff9800">
                ${formattedDate}
            </text>
            
            <!-- Bazi Pillar -->
            <text x="600" y="240" text-anchor="middle" font-size="32" font-weight="bold" fill="#ffffff">
                ${baziPillar}
            </text>
            
                                                <!-- Forecast text -->
            ${(() => {
            const paragraphs = forecast.split('\n\n');
            let currentY = 320;
            let totalLines = 0;
            const maxLines = 10;

            return paragraphs.map((paragraph, index) => {
                const words = paragraph.replace(/\n/g, ' ').split(' ');
                const lines: string[] = [];
                let currentLine = '';

                words.forEach(word => {
                    if ((currentLine + ' ' + word).length > 40) {
                        lines.push(currentLine.trim());
                        currentLine = word;
                    } else {
                        currentLine += (currentLine ? ' ' : '') + word;
                    }
                });
                if (currentLine) lines.push(currentLine.trim());

                // Only add lines if we haven't exceeded maxLines
                const linesToShow = lines.slice(0, maxLines - totalLines);
                totalLines += linesToShow.length;

                return linesToShow.map((line, lineIndex) => {
                    // Simple justification by adding extra spaces between words
                    const words = line.split(' ');
                    const extraSpaces = Math.floor((40 - line.length) / (words.length - 1));
                    const justifiedLine = words.join(' '.repeat(extraSpaces + 1));

                    return `
                        <text x="600" y="${currentY + (lineIndex * 20)}" text-anchor="middle" font-size="16" fill="#e0e0e0">
                            ${justifiedLine}
                        </text>
                    `;
                }).join('');
            }).join('');
        })()}
            
            <!-- Footer -->
            <text x="600" y="580" text-anchor="middle" font-size="16" fill="#888888">
                BaziGPT.xyz
            </text>
        </g>
    </svg>
    `;
}

// Fetch daily forecast from our API
async function fetchDailyForecast(): Promise<DailyBaziForecast> {
    console.log('🔄 Share card: Fetching daily forecast from API...');

    // Call our own daily-bazi API (use cached content)
    const response = await fetch('https://bazigpt.xyz/api/daily-bazi');

    if (!response.ok) {
        throw new Error(`Failed to fetch daily forecast: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Share card: Successfully fetched daily forecast:', data.date);
    return data;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        // Get today's forecast
        const forecast = await fetchDailyForecast();

        // Generate share card data
        const shareCardData: ShareCardData = {
            date: forecast.date,
            baziPillar: forecast.baziPillar,
            forecast: forecast.forecast
        };

        // Generate SVG
        const svgContent = generateShareCardSVG(shareCardData);

        // Set response headers for image
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        res.setHeader('Content-Disposition', `inline; filename="daily-bazi-${forecast.date}.svg"`);

        // Return SVG content
        res.status(200).send(svgContent);

    } catch (error) {
        console.error('Error generating share card:', error);

        // Return fallback SVG
        const fallbackData: ShareCardData = {
            date: new Date().toISOString().split('T')[0],
            baziPillar: "Yang Fire over Monkey",
            forecast: "Today brings the energy of Yang Fire over Monkey. This combination suggests a day of dynamic activity and clever problem-solving."
        };

        const fallbackSVG = generateShareCardSVG(fallbackData);
        res.setHeader('Content-Type', 'image/svg+xml');
        res.status(200).send(fallbackSVG);
    }
} 