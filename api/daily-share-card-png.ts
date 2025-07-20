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

// Generate HTML for share card
function generateShareCardHTML(data: ShareCardData): string {
    const { date, baziPillar, forecast } = data;

    // Format date nicely
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Daily Bazi Forecast</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                width: 1200px;
                height: 630px;
                background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", "Noto Sans CJK SC", "Source Han Sans SC", Arial, sans-serif;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                color: white;
            }
            .container {
                text-align: center;
                max-width: 1000px;
                padding: 20px;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
            .title {
                font-size: 42px;
                font-weight: bold;
                margin-bottom: 15px;
                color: #ffffff;
            }
            .date {
                font-size: 20px;
                color: #ff9800;
                margin-bottom: 20px;
            }
            .pillar {
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 25px;
                color: #ffffff;
            }
            .forecast {
                font-size: 16px;
                line-height: 1.4;
                color: #e0e0e0;
                margin-bottom: 20px;
                white-space: pre-line;
                text-align: justify;
                max-width: 900px;
                margin-left: auto;
                margin-right: auto;
                flex: 1;
                overflow: hidden;
                max-height: 300px;
                display: -webkit-box;
                -webkit-line-clamp: 12;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            .footer {
                font-size: 14px;
                color: #888888;
                margin-top: 15px;
            }
            .decorative {
                position: absolute;
                border: 2px solid #ff9800;
                border-radius: 50%;
                opacity: 0.3;
            }
            .decorative.top-left {
                top: 50px;
                left: 50px;
                width: 100px;
                height: 100px;
            }
            .decorative.bottom-right {
                bottom: 50px;
                right: 50px;
                width: 160px;
                height: 160px;
                opacity: 0.2;
            }
        </style>
    </head>
    <body>
        <div class="decorative top-left"></div>
        <div class="decorative bottom-right"></div>
        <div class="container">
            <div class="title">Daily Bazi Forecast</div>
            <div class="date">${formattedDate}</div>
            <div class="pillar">${baziPillar}</div>
            <div class="forecast">${forecast}</div>
            <div class="footer">BaziGPT.xyz</div>
        </div>
    </body>
    </html>
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

        console.log('📊 Share card: Using forecast data:', {
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

        // Generate HTML
        const htmlContent = generateShareCardHTML(shareCardData);

        // Set response headers for HTML (can be converted to PNG by external services)
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

        // Return HTML content
        res.status(200).send(htmlContent);

    } catch (error) {
        console.error('Error generating share card:', error);

        // Return fallback HTML
        const fallbackData: ShareCardData = {
            date: new Date().toISOString().split('T')[0],
            baziPillar: "Yang Fire over Monkey",
            forecast: "Today brings the energy of Yang Fire over Monkey. This combination suggests a day of dynamic activity and clever problem-solving."
        };

        const fallbackHTML = generateShareCardHTML(fallbackData);
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(fallbackHTML);
    }
} 