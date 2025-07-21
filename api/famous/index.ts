import type { VercelRequest, VercelResponse } from '@vercel/node';
import sql from '../../src/services/neondb.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const result = await sql`SELECT * FROM famous_bazi ORDER BY name ASC`;
        return res.status(200).json(result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}