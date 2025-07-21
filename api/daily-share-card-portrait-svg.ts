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

// Generate SVG for portrait share card (optimized for Telegram and mobile)
function generatePortraitShareCardSVG(data: ShareCardData): string {
    const { date, baziPillar, forecast } = data;

    // Format date nicely
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Split forecast into paragraphs for better formatting
    const paragraphs = forecast.split('\n\n').filter(p => p.trim().length > 0);

    // Portrait dimensions optimized for mobile/Telegram
    const width = 800;
    const height = 1200;

    // Positioning for portrait layout
    const titleY = 120;
    const dateY = 180;
    const pillarY = 260;
    const forecastStartY = 350;
    const footerY = 1150;

    // Font sizes optimized for portrait
    const titleSize = 48;
    const dateSize = 24;
    const pillarSize = 32;
    const forecastSize = 18;
    const footerSize = 16;

    const maxLineLength = 35;
    const lineHeight = 24;
    const maxLines = 25;
    const paragraphGap = 20;
    const forecastHeight = 650;

    return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#2d2d2d;stop-opacity:1" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
            </filter>
        </defs>
        
        <!-- Background -->
        <rect width="${width}" height="${height}" fill="url(#bg)"/>
        
        <!-- Decorative elements -->
        <circle cx="100" cy="100" r="50" fill="none" stroke="#ff9800" stroke-width="2" opacity="0.3"/>
        <circle cx="${width - 100}" cy="${height - 100}" r="60" fill="none" stroke="#ff9800" stroke-width="2" opacity="0.2"/>
        <circle cx="${width - 80}" cy="120" r="35" fill="none" stroke="#ff9800" stroke-width="2" opacity="0.15"/>
        <circle cx="120" cy="${height - 120}" r="45" fill="none" stroke="#ff9800" stroke-width="2" opacity="0.15"/>
        
        <!-- Main content -->
        <g font-family="Microsoft YaHei, PingFang SC, Hiragino Sans GB, WenQuanYi Micro Hei, Noto Sans CJK SC, Source Han Sans SC, Arial, sans-serif">
            <!-- Title -->
            <text x="${width / 2}" y="${titleY}" text-anchor="middle" font-size="${titleSize}" font-weight="bold" fill="#ffffff" filter="url(#shadow)">
                Daily Bazi Forecast
            </text>
            
            <!-- Date -->
            <text x="${width / 2}" y="${dateY}" text-anchor="middle" font-size="${dateSize}" fill="#ff9800" filter="url(#shadow)">
                ${formattedDate}
            </text>
            
            <!-- Bazi Pillar with background -->
            <rect x="${width / 2 - 140}" y="${pillarY - 25}" width="280" height="50" rx="10" fill="rgba(255,152,0,0.1)" stroke="rgba(255,152,0,0.3)" stroke-width="2"/>
            <text x="${width / 2}" y="${pillarY + 5}" text-anchor="middle" font-size="${pillarSize}" font-weight="bold" fill="#ffffff" filter="url(#shadow)">
                ${baziPillar}
            </text>
            
            <!-- Forecast text with background -->
            <rect x="50" y="${forecastStartY - 20}" width="${width - 100}" height="${forecastHeight}" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
            
            <!-- Forecast text with paragraphs -->
            ${(() => {
            let currentY = forecastStartY;
            let totalLines = 0;
            const availableHeight = forecastHeight - 40; // Account for padding
            const totalParagraphs = paragraphs.length;

            return paragraphs.map((paragraph, paragraphIndex) => {
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

                // Calculate vertical spacing to distribute content evenly
                const remainingParagraphs = totalParagraphs - paragraphIndex;
                const remainingHeight = availableHeight - (currentY - forecastStartY);
                const spacingPerParagraph = remainingHeight / remainingParagraphs;

                // Add paragraph gap if not first paragraph
                if (paragraphIndex > 0 && linesToShow.length > 0) {
                    currentY += paragraphGap;
                }

                const paragraphText = linesToShow.map((line, lineIndex) => {
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

                currentY += linesToShow.length * lineHeight;

                // Add extra spacing to distribute content evenly
                if (remainingParagraphs > 1 && linesToShow.length > 0) {
                    currentY += Math.max(0, spacingPerParagraph - (linesToShow.length * lineHeight));
                }

                return paragraphText;
            }).join('');
        })()}
            
            <!-- Footer -->
            <text x="${width / 2}" y="${footerY}" text-anchor="middle" font-size="${footerSize}" fill="#888888" filter="url(#shadow)">
                BaziGPT.xyz
            </text>
        </g>
    </svg>
    `;
}

// Fetch daily forecast from our API
async function fetchDailyForecast(): Promise<DailyBaziForecast> {
    console.log('🔄 Portrait SVG share card: Fetching daily forecast from API...');

    // Call our own daily-bazi API (use cached content)
    const response = await fetch('https://bazigpt.xyz/api/daily-bazi');

    if (!response.ok) {
        throw new Error(`Failed to fetch daily forecast: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Portrait SVG share card: Successfully fetched daily forecast:', data.date);
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

        console.log('📊 Portrait SVG share card: Using forecast data:', {
            date: forecast.date,
            baziPillar: forecast.baziPillar,
            forecastLength: forecast.forecast.length
        });

        // Generate share card data
        const shareCardData: ShareCardData = {
            date: forecast.date,
            baziPillar: forecast.baziPillar,
            forecast: forecast.forecast
        };

        // Generate SVG
        const svgContent = generatePortraitShareCardSVG(shareCardData);

        // Set response headers for image
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        res.setHeader('Content-Disposition', `inline; filename="daily-bazi-portrait-${forecast.date}.svg"`);

        // Return SVG content
        res.status(200).send(svgContent);

    } catch (error) {
        console.error('Error generating portrait SVG share card:', error);

        // Return fallback SVG
        const fallbackData: ShareCardData = {
            date: new Date().toISOString().split('T')[0],
            baziPillar: "Yang Fire over Monkey",
            forecast: "Today brings the energy of Yang Fire over Monkey. This combination suggests a day of dynamic activity and clever problem-solving. The dynamic fire energy combined with the clever monkey element creates opportunities for innovative thinking and creative solutions. Embrace this energy to tackle challenges with both enthusiasm and intelligence."
        };

        const fallbackSVG = generatePortraitShareCardSVG(fallbackData);
        res.setHeader('Content-Type', 'image/svg+xml');
        res.status(200).send(fallbackSVG);
    }
} 