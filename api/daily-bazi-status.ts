import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    try {
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            message: 'Daily Bazi API is running',
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        console.error('Status endpoint error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
} 