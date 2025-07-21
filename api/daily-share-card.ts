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

    // Detect orientation based on viewport or default to landscape
    const isPortrait = typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : false;

    // Set dimensions based on orientation
    const width = isPortrait ? 800 : 1200;
    const height = isPortrait ? 1200 : 630;

    // Adjust positioning and sizing for portrait mode
    const titleY = isPortrait ? 120 : 120;
    const dateY = isPortrait ? 180 : 180;
    const pillarY = isPortrait ? 240 : 240;
    const forecastStartY = isPortrait ? 320 : 320;
    const footerY = isPortrait ? 1150 : 580;

    const titleSize = isPortrait ? 56 : 48;
    const dateSize = isPortrait ? 28 : 24;
    const pillarSize = isPortrait ? 36 : 32;
    const forecastSize = isPortrait ? 18 : 16;
    const footerSize = isPortrait ? 18 : 16;

    const maxLineLength = isPortrait ? 35 : 40;
    const lineHeight = isPortrait ? 24 : 20;
    const maxLines = isPortrait ? 16 : 10;

    return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="${isPortrait ? '0%' : '100%'}" y2="${isPortrait ? '100%' : '100%'}">
                <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#2d2d2d;stop-opacity:1" />
            </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="${width}" height="${height}" fill="url(#bg)"/>
        
        <!-- Decorative elements -->
        <circle cx="${isPortrait ? 120 : 100}" cy="${isPortrait ? 120 : 100}" r="${isPortrait ? 60 : 50}" fill="none" stroke="#ff9800" stroke-width="2" opacity="0.3"/>
        <circle cx="${isPortrait ? width - 120 : 1100}" cy="${isPortrait ? height - 120 : 530}" r="${isPortrait ? 70 : 80}" fill="none" stroke="#ff9800" stroke-width="2" opacity="0.2"/>
        
        <!-- Main content -->
        <g font-family="Microsoft YaHei, PingFang SC, Hiragino Sans GB, WenQuanYi Micro Hei, Noto Sans CJK SC, Source Han Sans SC, Arial, sans-serif">
            <!-- Title -->
            <text x="${width / 2}" y="${titleY}" text-anchor="middle" font-size="${titleSize}" font-weight="bold" fill="#ffffff">
                Daily Bazi Forecast
            </text>
            
            <!-- Date -->
            <text x="${width / 2}" y="${dateY}" text-anchor="middle" font-size="${dateSize}" fill="#ff9800">
                ${formattedDate}
            </text>
            
            <!-- Bazi Pillar -->
            <text x="${width / 2}" y="${pillarY}" text-anchor="middle" font-size="${pillarSize}" font-weight="bold" fill="#ffffff">
                ${baziPillar}
            </text>
            
            <!-- Forecast text -->
            ${(() => {
            const paragraphs = forecast.split('\n\n');
            let currentY = forecastStartY;
            let totalLines = 0;

            return paragraphs.map((paragraph) => {
                const words = paragraph.replace(/\n/g, ' ').split(' ');
                const lines: string[] = [];
                let currentLine = '';

                words.forEach(word => {
                    if ((currentLine + ' ' + word).length > maxLineLength) {
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
                    const extraSpaces = Math.floor((maxLineLength - line.length) / (words.length - 1));
                    const justifiedLine = words.join(' '.repeat(extraSpaces + 1));

                    return `
                        <text x="${width / 2}" y="${currentY + (lineIndex * lineHeight)}" text-anchor="middle" font-size="${forecastSize}" fill="#e0e0e0">
                            ${justifiedLine}
                        </text>
                    `;
                }).join('');
            }).join('');
        })()}
            
            <!-- Footer -->
            <text x="${width / 2}" y="${footerY}" text-anchor="middle" font-size="${footerSize}" fill="#888888">
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