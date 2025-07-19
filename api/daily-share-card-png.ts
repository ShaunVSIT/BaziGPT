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
                font-family: Arial, sans-serif;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                color: white;
            }
            .container {
                text-align: center;
                max-width: 1000px;
                padding: 40px;
            }
            .title {
                font-size: 48px;
                font-weight: bold;
                margin-bottom: 20px;
                color: #ffffff;
            }
            .date {
                font-size: 24px;
                color: #ff9800;
                margin-bottom: 30px;
            }
            .pillar {
                font-size: 32px;
                font-weight: bold;
                margin-bottom: 40px;
                color: #ffffff;
            }
            .forecast {
                font-size: 20px;
                line-height: 1.6;
                color: #e0e0e0;
                margin-bottom: 40px;
            }
            .footer {
                font-size: 16px;
                color: #888888;
                margin-top: 40px;
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
            <div class="footer">BaziGPT.com</div>
        </div>
    </body>
    </html>
    `;
}

// Generate daily forecast data (self-contained)
function generateDailyForecast(): DailyBaziForecast {
    const today = new Date().toISOString().split('T')[0];

    return {
        date: today,
        baziPillar: "Yang Fire over Monkey",
        forecast: "Today brings the energy of Yang Fire over Monkey. This combination suggests a day of dynamic activity and clever problem-solving. The Fire element provides warmth and enthusiasm, while the Monkey brings wit and adaptability. Focus on creative projects and social interactions today. Avoid rushing into decisions without careful consideration. Let the steady flow of Fire guide your actions today.",
        cached: false
    };
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
        const forecast = generateDailyForecast();

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