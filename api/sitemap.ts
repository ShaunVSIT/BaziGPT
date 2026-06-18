import type { VercelRequest, VercelResponse } from '@vercel/node';
import sql from '../src/services/neondb.js';

const ORIGIN = 'https://www.bazigpt.io';

// Static, crawlable routes. Dynamic /famous/:slug entries are appended from the DB
// so the sitemap stays in sync as celebrities are added — no manual edits needed.
const STATIC_ROUTES: Array<{ path: string; changefreq: string; priority: string }> = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/daily', changefreq: 'daily', priority: '0.8' },
    { path: '/famous', changefreq: 'weekly', priority: '0.7' },
    { path: '/about', changefreq: 'monthly', priority: '0.5' },
    { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
    { path: '/terms', changefreq: 'yearly', priority: '0.3' },
];

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: string) {
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
    const today = new Date().toISOString().slice(0, 10);

    const entries = STATIC_ROUTES.map((r) =>
        urlEntry(`${ORIGIN}${r.path}`, today, r.changefreq, r.priority)
    );

    try {
        const rows = (await sql`
            SELECT slug FROM famous_bazi
            WHERE slug IS NOT NULL
            ORDER BY name ASC
        `) as Array<{ slug: string }>;

        for (const row of rows) {
            entries.push(
                urlEntry(`${ORIGIN}/famous/${row.slug}`, today, 'monthly', '0.6')
            );
        }
    } catch (err) {
        // If the DB is unreachable, still serve a valid sitemap of static routes
        // rather than a 500 that search engines would treat as a fetch error.
        console.error('sitemap: failed to load famous slugs', err);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(xml);
}
