import { VercelRequest, VercelResponse } from '@vercel/node';

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
        const today = new Date().toISOString().split('T')[0];

        // Import the cache from the daily-bazi module
        // Note: This is a simplified approach for monitoring
        const status = {
            date: today,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            message: 'Daily Bazi Forecast API is running',
            note: 'Cache status is internal to the daily-bazi endpoint'
        };

        res.status(200).json(status);
    } catch (error) {
        console.error('Error in daily-bazi-status API:', error);
        res.status(500).json({
            error: 'Failed to get status',
            timestamp: new Date().toISOString()
        });
    }
} 