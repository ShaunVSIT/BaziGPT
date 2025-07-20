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

// Generate HTML for portrait share card (optimized for Telegram and mobile)
function generatePortraitShareCardHTML(data: ShareCardData): string {
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
        <title>Daily Bazi Forecast - Portrait</title>
        <style>
            * {
                box-sizing: border-box;
            }
            
            body {
                margin: 0;
                padding: 0;
                width: 800px;
                height: 1200px;
                background: linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%);
                font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", "Noto Sans CJK SC", "Source Han Sans SC", Arial, sans-serif;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                align-items: center;
                color: white;
                position: relative;
                overflow: hidden;
            }
            
            .container {
                text-align: center;
                max-width: 700px;
                padding: 40px 30px;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                gap: 25px;
                position: relative;
                z-index: 2;
            }
            
            .header {
                margin-top: 20px;
                margin-bottom: 20px;
            }
            
            .title {
                font-size: 52px;
                font-weight: bold;
                margin-bottom: 15px;
                color: #ffffff;
                line-height: 1.1;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            
            .date {
                font-size: 26px;
                color: #ff9800;
                margin-bottom: 10px;
                font-weight: 500;
                text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            }
            
            .pillar {
                font-size: 36px;
                font-weight: bold;
                margin-bottom: 20px;
                color: #ffffff;
                line-height: 1.2;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                padding: 15px 25px;
                background: rgba(255, 152, 0, 0.1);
                border: 2px solid rgba(255, 152, 0, 0.3);
                border-radius: 12px;
                display: inline-block;
            }
            
            .forecast {
                font-size: 20px;
                line-height: 1.6;
                color: #e0e0e0;
                text-align: justify;
                max-width: 650px;
                margin: 0 auto;
                flex: 1;
                overflow: hidden;
                max-height: 600px;
                display: -webkit-box;
                -webkit-line-clamp: 20;
                -webkit-box-orient: vertical;
                overflow: hidden;
                padding: 20px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .footer {
                font-size: 18px;
                color: #888888;
                margin-top: 20px;
                margin-bottom: 30px;
                font-weight: 500;
                text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            }
            
            .decorative {
                position: absolute;
                border: 2px solid #ff9800;
                border-radius: 50%;
                opacity: 0.3;
                z-index: 1;
            }
            
            .decorative.top-left {
                top: 80px;
                left: 60px;
                width: 120px;
                height: 120px;
            }
            
            .decorative.bottom-right {
                bottom: 80px;
                right: 60px;
                width: 140px;
                height: 140px;
                opacity: 0.2;
            }
            
            .decorative.top-right {
                top: 100px;
                right: 80px;
                width: 80px;
                height: 80px;
                opacity: 0.15;
            }
            
            .decorative.bottom-left {
                bottom: 100px;
                left: 80px;
                width: 100px;
                height: 100px;
                opacity: 0.15;
            }
            
            /* Enhanced text styling for better readability */
            .forecast p {
                margin-bottom: 15px;
                text-indent: 0;
            }
            
            .forecast strong {
                color: #ff9800;
                font-weight: 600;
            }
            
            .forecast em {
                color: #ffffff;
                font-style: italic;
            }
            
            /* Responsive adjustments for very small screens */
            @media (max-width: 400px) {
                .title {
                    font-size: 44px;
                }
                
                .date {
                    font-size: 22px;
                }
                
                .pillar {
                    font-size: 30px;
                }
                
                .forecast {
                    font-size: 18px;
                }
            }
        </style>
    </head>
    <body>
        <div class="decorative top-left"></div>
        <div class="decorative top-right"></div>
        <div class="decorative bottom-left"></div>
        <div class="decorative bottom-right"></div>
        <div class="container">
            <div class="header">
                <div class="title">Daily Bazi Forecast</div>
                <div class="date">${formattedDate}</div>
                <div class="pillar">${baziPillar}</div>
            </div>
            <div class="forecast">${forecast}</div>
            <div class="footer">BaziGPT.xyz</div>
        </div>
    </body>
    </html>
    `;
}

// Fetch daily forecast from our API
async function fetchDailyForecast(): Promise<DailyBaziForecast> {
    console.log('🔄 Portrait share card: Fetching daily forecast from API...');

    // Call our own daily-bazi API (use cached content)
    const response = await fetch('https://bazigpt.xyz/api/daily-bazi');

    if (!response.ok) {
        throw new Error(`Failed to fetch daily forecast: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Portrait share card: Successfully fetched daily forecast:', data.date);
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

        console.log('📊 Portrait share card: Using forecast data:', {
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
        const htmlContent = generatePortraitShareCardHTML(shareCardData);

        // Set response headers for HTML (can be converted to PNG by external services)
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

        // Return HTML content
        res.status(200).send(htmlContent);

    } catch (error) {
        console.error('Error generating portrait share card:', error);

        // Return fallback HTML
        const fallbackData: ShareCardData = {
            date: new Date().toISOString().split('T')[0],
            baziPillar: "Yang Fire over Monkey",
            forecast: "Today brings the energy of Yang Fire over Monkey. This combination suggests a day of dynamic activity and clever problem-solving. The dynamic fire energy combined with the clever monkey element creates opportunities for innovative thinking and creative solutions. Embrace this energy to tackle challenges with both enthusiasm and intelligence."
        };

        const fallbackHTML = generatePortraitShareCardHTML(fallbackData);
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(fallbackHTML);
    }
} 