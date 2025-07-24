import type { VercelRequest, VercelResponse } from '@vercel/node';
import { callOpenAI } from './openai-util';

interface DailyBaziForecast {
    date: string;
    baziPillar: string;
    forecast: string;
    cached: boolean;
}

// Cache using a more robust approach for serverless environments
let globalCache: Map<string, DailyBaziForecast> | null = null;
let isGenerating = false;
let lastApiCallTime = 0;
const MIN_API_CALL_INTERVAL = 60000; // 1 minute minimum between API calls

function getCache(): Map<string, DailyBaziForecast> {
    if (!globalCache) {
        globalCache = new Map<string, DailyBaziForecast>();
    }
    return globalCache;
}

// Get today's date in YYYY-MM-DD format (UTC)
function getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Generate Bazi pillar for a given date
function getBaziPillarForDate(date: Date): string {
    // Simple Bazi calculation based on date
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Calculate Heavenly Stem (based on year and day)
    const heavenlyStems = ["Jia", "Yi", "Bing", "Ding", "Wu", "Ji", "Geng", "Xin", "Ren", "Gui"];
    const earthlyBranches = ["Zi", "Chou", "Yin", "Mao", "Chen", "Si", "Wu", "Wei", "Shen", "You", "Xu", "Hai"];

    // Simple calculation (this is a simplified version)
    const stemIndex = (year + day) % 10;
    const branchIndex = (month + day) % 12;

    const stem = heavenlyStems[stemIndex];
    const branch = earthlyBranches[branchIndex];

    // Add element based on stem
    const elementMap: { [key: string]: string } = {
        "Jia": "Yang Wood (甲)", "Yi": "Yin Wood (乙)",
        "Bing": "Yang Fire (丙)", "Ding": "Yin Fire (丁)",
        "Wu": "Yang Earth (戊)", "Ji": "Yin Earth (己)",
        "Geng": "Yang Metal (庚)", "Xin": "Yin Metal (辛)",
        "Ren": "Yang Water (壬)", "Gui": "Yin Water (癸)"
    };

    // Add Chinese characters for branches
    const branchMap: { [key: string]: string } = {
        "Zi": "Zi (子)", "Chou": "Chou (丑)", "Yin": "Yin (寅)", "Mao": "Mao (卯)",
        "Chen": "Chen (辰)", "Si": "Si (巳)", "Wu": "Wu (午)", "Wei": "Wei (未)",
        "Shen": "Shen (申)", "You": "You (酉)", "Xu": "Xu (戌)", "Hai": "Hai (亥)"
    };

    const element = elementMap[stem] || "Yang Fire (丙)";
    const branchWithChar = branchMap[branch] || branch;

    return `${element} over ${branchWithChar}`;
}

// Check if forecast is from today
function isForecastFromToday(forecast: DailyBaziForecast): boolean {
    return forecast.date === getTodayDate();
}

// Generate daily forecast using OpenAI
async function generateDailyForecast(baziPillar: string): Promise<string> {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = "You are a precise expert in Chinese Four Pillars (Bazi) astrology. Your job is to write a daily Bazi forecast based on the Day Stem and Branch, using clear and insightful language grounded in classical metaphysics.";

    const userPrompt = `Today's Bazi pillar is: ${baziPillar}

Write a concise daily Bazi forecast (4–6 sentences) for a general audience. Include:
- The energy of the day based on the Heavenly Stem and Earthly Branch
- How this day's energy may interact with common chart patterns
- Practical guidance or actions to take or avoid
- Optional: auspicious or inauspicious themes

End with a single-line affirmation or reflection like:
'Let the steady flow of Water guide your words today.'`;

    try {
        const data = await callOpenAI({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 300
        });
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error generating forecast:', error);
        throw new Error('Failed to generate daily forecast');
    }
}

// Use mock data only for true local development (not on Vercel)
const isLocalDev = !process.env.VERCEL;

const handler = async (req: VercelRequest, res: VercelResponse) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Set CDN cache header for 24 hours
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

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
        // Check for force refresh parameter
        const forceRefresh = req.query.force === 'true';
        const testDate = req.query.date as string;

        const today = testDate || getTodayDate();
        const cacheKey = `daily-bazi-${today}`;

        if (forceRefresh) {
            console.log(`[${new Date().toISOString()}] Force refresh requested - bypassing cache`);
        }

        if (testDate) {
            console.log(`[${new Date().toISOString()}] Test date requested: ${testDate}`);
        }

        // Check if we have a cached forecast from today
        const cache = getCache();
        const cachedForecast = cache.get(cacheKey);

        if (cachedForecast && isForecastFromToday(cachedForecast) && !forceRefresh) {
            // Return cached forecast
            console.log(`[${new Date().toISOString()}] Returning cached forecast for ${today}`);
            res.status(200).json({
                ...cachedForecast,
                cached: true
            });
            return;
        }

        // Prevent multiple simultaneous API calls
        if (isGenerating) {
            // Wait for the current generation to complete
            let attempts = 0;
            while (isGenerating && attempts < 50) { // Wait up to 5 seconds
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;

                // Check if cache was populated while waiting
                const updatedCache = cache.get(cacheKey);
                if (updatedCache && isForecastFromToday(updatedCache)) {
                    res.status(200).json({
                        ...updatedCache,
                        cached: true
                    });
                    return;
                }
            }
        }

        // Set generating flag to prevent race conditions
        isGenerating = true;

        // Rate limiting: prevent too frequent API calls
        const now = Date.now();
        if (now - lastApiCallTime < MIN_API_CALL_INTERVAL) {
            console.log(`[${new Date().toISOString()}] Rate limiting: too soon since last API call`);
            // Return fallback instead of calling API
            const fallbackForecast: DailyBaziForecast = {
                date: today,
                baziPillar: "Yang Fire over Monkey",
                forecast: "Today brings the energy of Yang Fire over Monkey. This combination suggests a day of dynamic activity and clever problem-solving. The Fire element provides warmth and enthusiasm, while the Monkey brings wit and adaptability. Focus on creative projects and social interactions today. Avoid rushing into decisions without careful consideration. Let the steady flow of Fire guide your actions today.",
                cached: false
            };
            cache.set(cacheKey, fallbackForecast);
            isGenerating = false;
            res.status(200).json(fallbackForecast);
            return;
        }

        lastApiCallTime = now;
        let dailyForecast: DailyBaziForecast;

        if (isLocalDev) {
            // In local dev, return mock data with a small delay to simulate API call
            const mockForecast: DailyBaziForecast = {
                date: today,
                baziPillar: "Yang Fire over Monkey",
                forecast: "Today brings the energy of Yang Fire over Monkey. This combination suggests a day of dynamic activity and clever problem-solving. The Fire element provides warmth and enthusiasm, while the Monkey brings wit and adaptability. Focus on creative projects and social interactions today. Avoid rushing into decisions without careful consideration. Let the steady flow of Fire guide your actions today.",
                cached: false
            };
            await new Promise(resolve => setTimeout(resolve, 1000));
            res.status(200).json(mockForecast);
            return;
        }

        try {
            // Generate new forecast
            const baziPillar = getBaziPillarForDate(new Date());
            const forecast = await generateDailyForecast(baziPillar);

            dailyForecast = {
                date: today,
                baziPillar,
                forecast,
                cached: false
            };

            // Cache the forecast
            cache.set(cacheKey, dailyForecast);
            console.log(`[${new Date().toISOString()}] Generated and cached new forecast for ${today}`);
        } finally {
            // Always reset the generating flag
            isGenerating = false;
        }

        // Clean up old cache entries (keep only last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

        for (const [key] of cache.entries()) {
            const keyDate = key.replace('daily-bazi-', '');
            if (keyDate < sevenDaysAgoStr) {
                cache.delete(key);
            }
        }

        res.status(200).json(dailyForecast);
    } catch (error) {
        console.error('Error in daily-bazi API:', error);

        // Return fallback response
        res.status(500).json({
            date: getTodayDate(),
            baziPillar: "Yang Fire over Monkey",
            forecast: "Today brings the energy of Yang Fire over Monkey. This combination suggests a day of dynamic activity and clever problem-solving. The Fire element provides warmth and enthusiasm, while the Monkey brings wit and adaptability. Focus on creative projects and social interactions today. Avoid rushing into decisions without careful consideration. Let the steady flow of Fire guide your actions today.",
            cached: false,
            error: "Generated fallback forecast due to API error"
        });
    }
};

export default handler; 