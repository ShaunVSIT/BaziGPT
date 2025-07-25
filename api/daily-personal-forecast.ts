import type { VercelRequest, VercelResponse } from '@vercel/node';
import { callOpenAI } from '../src/utils/openai-util.js';

interface PersonalForecastRequest {
    birthDate: string;
    birthTime?: string;
}

interface PersonalForecastResponse {
    todayPillar: string;
    personalForecast: string;
    cached: boolean;
}

// Cache for personal forecasts
let personalCache: Map<string, PersonalForecastResponse> | null = null;
let isGeneratingPersonal = false;

function getPersonalCache(): Map<string, PersonalForecastResponse> {
    if (!personalCache) {
        personalCache = new Map<string, PersonalForecastResponse>();
    }
    return personalCache;
}

// Get today's date in YYYY-MM-DD format (UTC)
function getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Generate Bazi pillar for a given date (reused from daily-bazi.ts)
function getBaziPillarForDate(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const heavenlyStems = ["Jia", "Yi", "Bing", "Ding", "Wu", "Ji", "Geng", "Xin", "Ren", "Gui"];
    const earthlyBranches = ["Zi", "Chou", "Yin", "Mao", "Chen", "Si", "Wu", "Wei", "Shen", "You", "Xu", "Hai"];

    const stemIndex = (year + day) % 10;
    const branchIndex = (month + day) % 12;

    const stem = heavenlyStems[stemIndex];
    const branch = earthlyBranches[branchIndex];

    const elementMap: { [key: string]: string } = {
        "Jia": "Yang Wood (甲)", "Yi": "Yin Wood (乙)",
        "Bing": "Yang Fire (丙)", "Ding": "Yin Fire (丁)",
        "Wu": "Yang Earth (戊)", "Ji": "Yin Earth (己)",
        "Geng": "Yang Metal (庚)", "Xin": "Yin Metal (辛)",
        "Ren": "Yang Water (壬)", "Gui": "Yin Water (癸)"
    };

    const branchMap: { [key: string]: string } = {
        "Zi": "Zi (子)", "Chou": "Chou (丑)", "Yin": "Yin (寅)", "Mao": "Mao (卯)",
        "Chen": "Chen (辰)", "Si": "Si (巳)", "Wu": "Wu (午)", "Wei": "Wei (未)",
        "Shen": "Shen (申)", "You": "You (酉)", "Xu": "Xu (戌)", "Hai": "Hai (亥)"
    };

    const element = elementMap[stem] || "Yang Fire (丙)";
    const branchWithChar = branchMap[branch] || branch;

    return `${element} over ${branchWithChar}`;
}

// Generate personal forecast using OpenAI
async function generatePersonalForecast(todayPillar: string, birthDate: string, birthTime?: string): Promise<string> {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = "You are an expert Bazi practitioner. Compare a person's chart to today's pillar and generate a brief personal daily forecast.";

    const timeContext = birthTime ? ` — ${birthTime}` : "";
    const userPrompt = `Today's Pillar: ${todayPillar}
    Birthday: ${birthDate}${timeContext}

    What is the personal Bazi forecast for this individual?

    Format as 2–3 bullet points using only plain text (no markdown, no asterisks, no bold formatting):

    • What to be mindful of today
    • Emotional or strategic tone  
    • Actionable advice (e.g. avoid conflict, focus on collaboration)

    Use only bullet points (•) and plain text. Do not use any markdown formatting like **bold** or __italic__. Keep it concise and practical.`;

    try {
        const data = await callOpenAI({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 200
        });
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error generating personal forecast:', error);
        throw new Error('Failed to generate personal forecast');
    }
}

const handler = async (req: VercelRequest, res: VercelResponse) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { birthDate, birthTime }: PersonalForecastRequest = req.body;
        const dateString = birthDate;
        const timeString = birthTime || '';

        if (!birthDate) {
            res.status(400).json({ error: 'Birth date is required' });
            return;
        }

        const today = getTodayDate();
        const cacheKey = `personal-${birthDate}-${birthTime || 'noon'}-${today}`;

        // Check if we have a cached forecast from today
        const cache = getPersonalCache();
        const cachedForecast = cache.get(cacheKey);

        if (cachedForecast && !req.query.force) {
            console.log(`[${new Date().toISOString()}] Returning cached personal forecast for ${birthDate}`);
            res.status(200).json({
                ...cachedForecast,
                cached: true
            });
            return;
        }

        // Prevent multiple simultaneous API calls
        if (isGeneratingPersonal) {
            // Wait for the current generation to complete
            let attempts = 0;
            while (isGeneratingPersonal && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;

                // Check if cache was populated while waiting
                const updatedCache = cache.get(cacheKey);
                if (updatedCache) {
                    res.status(200).json({
                        ...updatedCache,
                        cached: true
                    });
                    return;
                }
            }
        }

        // Set generating flag to prevent race conditions
        isGeneratingPersonal = true;

        try {
            // Generate today's pillar
            const todayPillar = getBaziPillarForDate(new Date());

            // Generate personal forecast
            const personalForecast = await generatePersonalForecast(todayPillar, birthDate, birthTime);

            const forecastResponse: PersonalForecastResponse = {
                todayPillar,
                personalForecast,
                cached: false
            };

            // Cache the forecast
            cache.set(cacheKey, forecastResponse);
            console.log(`[${new Date().toISOString()}] Generated and cached personal forecast for ${birthDate}`);

            res.status(200).json(forecastResponse);
        } finally {
            // Always reset the generating flag
            isGeneratingPersonal = false;
        }

        // Clean up old cache entries (keep only last 3 days)
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];

        for (const [key] of cache.entries()) {
            const keyParts = key.split('-');
            const keyDate = keyParts[keyParts.length - 1];
            if (keyDate < threeDaysAgoStr) {
                cache.delete(key);
            }
        }

    } catch (error) {
        console.error('Error in daily-personal-forecast API:', error);

        // Return fallback response
        res.status(500).json({
            todayPillar: "Yang Fire over Monkey",
            personalForecast: "• Be mindful of your energy levels today - the Fire element may make you feel more active than usual\n• Focus on creative projects and social interactions\n• Avoid rushing into decisions without careful consideration",
            cached: false,
            error: "Generated fallback forecast due to API error"
        });
    }
};

export default handler; 