import type { VercelRequest, VercelResponse } from '@vercel/node';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

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

// File-based cache for persistence across serverless instances
const CACHE_FILE = '/tmp/daily-bazi-cache.json';

function getCache(): Map<string, DailyBaziForecast> {
    if (!globalCache) {
        globalCache = new Map<string, DailyBaziForecast>();

        // Load from file if exists
        try {
            if (existsSync(CACHE_FILE)) {
                const fileContent = readFileSync(CACHE_FILE, 'utf8');
                const cachedData = JSON.parse(fileContent);
                Object.entries(cachedData).forEach(([key, value]) => {
                    globalCache!.set(key, value as DailyBaziForecast);
                });
                console.log(`[${new Date().toISOString()}] Loaded cache from file with ${globalCache.size} entries`);
            }
        } catch (error) {
            console.log(`[${new Date().toISOString()}] No cache file found or error loading:`, error);
        }
    }
    return globalCache;
}

function saveCacheToFile(cache: Map<string, DailyBaziForecast>): void {
    try {
        const cacheObject: Record<string, DailyBaziForecast> = {};
        cache.forEach((value, key) => {
            cacheObject[key] = value;
        });
        writeFileSync(CACHE_FILE, JSON.stringify(cacheObject, null, 2));
        console.log(`[${new Date().toISOString()}] Saved cache to file with ${cache.size} entries`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error saving cache to file:`, error);
    }
}

// Get today's date in YYYY-MM-DD format (UTC)
function getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Generate Bazi pillar for a given date (simplified for now)
function getBaziPillarForDate(date: Date): string {
    // For now, using the fallback as specified in requirements
    // In a real implementation, this would calculate the actual Bazi pillar
    return "Yang Fire over Monkey";
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
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 300,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API call failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error generating forecast:', error);
        throw new Error('Failed to generate daily forecast');
    }
}

const handler = async (req: VercelRequest, res: VercelResponse) => {
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
        const today = getTodayDate();
        const cacheKey = `daily-bazi-${today}`;

        // Check if we have a cached forecast from today
        const cache = getCache();
        const cachedForecast = cache.get(cacheKey);

        if (cachedForecast && isForecastFromToday(cachedForecast)) {
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
            saveCacheToFile(cache);
            isGenerating = false;
            res.status(200).json(fallbackForecast);
            return;
        }

        lastApiCallTime = now;
        let dailyForecast: DailyBaziForecast;

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
            saveCacheToFile(cache); // Save cache to file
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
        saveCacheToFile(cache); // Save cache to file after cleanup

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