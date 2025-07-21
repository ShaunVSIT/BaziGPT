import type { VercelRequest, VercelResponse } from '@vercel/node';
import sql from '../../src/services/neondb.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { slug } = req.query;
    if (!slug || typeof slug !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid slug' });
    }
    try {
        const result = await sql`SELECT * FROM famous_bazi WHERE slug = ${slug} LIMIT 1`;
        if (result.length === 0) {
            return res.status(404).json({ error: 'Not found' });
        }
        return res.status(200).json(result[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 