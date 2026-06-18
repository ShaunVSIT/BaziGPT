import type { VercelRequest, VercelResponse } from '@vercel/node';
import sql from '../../src/services/neondb.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const result = await sql`SELECT DISTINCT category FROM famous_bazi WHERE category IS NOT NULL AND category <> '' ORDER BY category ASC`;
        const categories = result.map((row: any) => row.category);
        // Categories almost never change — cache aggressively at the edge.
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
        res.status(200).json({ categories });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
} 