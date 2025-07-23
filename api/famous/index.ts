import type { VercelRequest, VercelResponse } from '@vercel/node';
import sql from '../../src/services/neondb.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Parse limit, offset, search, and category from query params
        const search = (req.query.search || '').toString().trim();
        const category = (req.query.category || '').toString().trim();
        let limit = Math.min(Number(req.query.limit) || 20, 100);
        const offset = Number(req.query.offset) || 0;

        let result, countResult, total;

        if (search && category) {
            // Both search and category
            limit = Math.min(limit, 50);
            const like = `%${search}%`;
            countResult = await sql`
                SELECT COUNT(*)::int AS count FROM famous_bazi
                WHERE (name ILIKE ${like} OR bio ILIKE ${like} OR category ILIKE ${like})
                  AND category = ${category}
            `;
            total = countResult[0]?.count || 0;
            result = await sql`
                SELECT * FROM famous_bazi
                WHERE (name ILIKE ${like} OR bio ILIKE ${like} OR category ILIKE ${like})
                  AND category = ${category}
                ORDER BY name ASC
                LIMIT ${limit} OFFSET ${offset}
            `;
        } else if (search) {
            // Search only
            limit = Math.min(limit, 50);
            const like = `%${search}%`;
            countResult = await sql`
                SELECT COUNT(*)::int AS count FROM famous_bazi
                WHERE name ILIKE ${like} OR bio ILIKE ${like} OR category ILIKE ${like}
            `;
            total = countResult[0]?.count || 0;
            result = await sql`
                SELECT * FROM famous_bazi
                WHERE name ILIKE ${like} OR bio ILIKE ${like} OR category ILIKE ${like}
                ORDER BY name ASC
                LIMIT ${limit} OFFSET ${offset}
            `;
        } else if (category) {
            // Category only
            countResult = await sql`
                SELECT COUNT(*)::int AS count FROM famous_bazi
                WHERE category = ${category}
            `;
            total = countResult[0]?.count || 0;
            result = await sql`
                SELECT * FROM famous_bazi
                WHERE category = ${category}
                ORDER BY name ASC
                LIMIT ${limit} OFFSET ${offset}
            `;
        } else {
            // No filter
            countResult = await sql`
                SELECT COUNT(*)::int AS count FROM famous_bazi
            `;
            total = countResult[0]?.count || 0;
            result = await sql`
                SELECT * FROM famous_bazi
                ORDER BY name ASC
                LIMIT ${limit} OFFSET ${offset}
            `;
        }

        return res.status(200).json({
            data: result,
            total,
            limit,
            offset
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}