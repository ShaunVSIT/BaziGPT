import type { VercelRequest, VercelResponse } from '@vercel/node';
import { callOpenAI } from '../src/utils/openai-util.js';
import fs from 'fs';
import path from 'path';

// Language-specific prompts for daily forecast
const getLanguageSpecificPrompts = (baziPillar: string, language: string) => {
    const prompts = {
        en: {
            systemPrompt: "You are a precise expert in Chinese Four Pillars (Bazi) astrology. Your job is to write a daily Bazi forecast based on the Day Stem and Branch, using clear and insightful language grounded in classical metaphysics.",
            userPrompt: `Today's Bazi pillar is: ${baziPillar}

First, translate the pillar to English in this exact format (ONLY the pillar, no prefix): "Yang Fire (丙) over Monkey (戌)" (include Chinese characters)
Then write a concise daily Bazi forecast (4–6 sentences) for a general audience. Include:
- The energy of the day based on the Heavenly Stem and Earthly Branch
- How this day's energy may interact with common chart patterns
- Practical guidance or actions to take or avoid
- Optional: auspicious or inauspicious themes

End with a single-line affirmation or reflection like:
'Let the steady flow of Water guide your words today.'`
        },
        th: {
            systemPrompt: "คุณเป็นผู้เชี่ยวชาญที่แม่นยำในโหราศาสตร์จีนสี่เสา (Bazi) งานของคุณคือเขียนพยากรณ์ Bazi ประจำวันตามเสาและกิ่งของวัน โดยใช้ภาษาที่ชัดเจนและมีข้อมูลเชิงลึกที่อิงจากอภิปรัชญาแบบคลาสสิก",
            userPrompt: `เสา Bazi ของวันนี้คือ: ${baziPillar}

ก่อนอื่น ให้แปลเสาเป็นภาษาไทยในรูปแบบนี้ (เฉพาะเสาเท่านั้น ไม่มีคำนำ): "หยางไฟ (丙) เหนือ ลิง (戌)" (รวมอักษรจีน)
จากนั้นเขียนพยากรณ์ Bazi ประจำวันที่กระชับ (4-6 ประโยค) สำหรับผู้ชมทั่วไป รวม:
- พลังงานของวันตามเสาสวรรค์และกิ่งโลก
- พลังงานของวันนี้อาจมีปฏิสัมพันธ์กับรูปแบบแผนภูมิทั่วไปอย่างไร
- คำแนะนำหรือการกระทำที่ควรทำหรือหลีกเลี่ยง
- ตัวเลือก: ธีมที่มงคลหรือไม่มงคล

จบด้วยการยืนยันหรือการสะท้อนหนึ่งบรรทัด เช่น:
'ให้กระแสของน้ำที่มั่นคงนำทางคำพูดของคุณในวันนี้'`
        },
        zh: {
            systemPrompt: "您是中国四柱（八字）占星术的精确专家。您的工作是根据日干和日支编写每日八字预测，使用清晰而有洞察力的语言，基于古典形而上学。",
            userPrompt: `今天的八字柱是: ${baziPillar}

首先，将柱子翻译成中文，格式如下（仅柱子，无前缀）："阳火 (丙) 在 猴 (戌)" (包含中文字符)
然后为普通观众写一份简洁的每日八字预测（4-6句话）。包括：
- 基于天干地支的当日能量
- 这种日能量如何与常见图表模式相互作用
- 实用指导或应采取或避免的行动
- 可选：吉祥或不吉祥的主题

以单行肯定或反思结束，例如：
'让水的稳定流动引导你今天的话语。'`
        }
    };

    return prompts[language as keyof typeof prompts] || prompts.en;
};

interface DailyBaziForecast {
    date: string;
    baziPillar: string;
    forecast: string;
}



// Get today's date in YYYY-MM-DD format (UTC)
function getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// File-based cache for development (vercel dev resets in-memory state)
const DEV_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_FILE = path.join(process.cwd(), '.vercel', 'cache', 'daily-bazi-cache.json');

function getDevCache(key: string): any | null {
    try {
        if (!fs.existsSync(CACHE_FILE)) {
            return null;
        }

        const cacheData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
        const cached = cacheData[key];

        if (cached && Date.now() - cached.timestamp < DEV_CACHE_TTL) {
            return cached.data;
        }

        return null;
    } catch (error) {
        return null;
    }
}

function setDevCache(key: string, data: any): void {
    try {
        // Ensure cache directory exists
        const cacheDir = path.dirname(CACHE_FILE);
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }

        // Read existing cache or create new
        let cacheData = {};
        if (fs.existsSync(CACHE_FILE)) {
            cacheData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
        }

        // Set new cache entry
        cacheData[key] = {
            data,
            timestamp: Date.now()
        };

        // Write back to file
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2));
    } catch (error) {
        // Silent fail in production
    }
}

function clearDevCache(key: string): void {
    try {
        if (!fs.existsSync(CACHE_FILE)) {
            return;
        }

        const cacheData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
        delete cacheData[key];
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2));
    } catch (error) {
        // Silent fail in production
    }
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



// Generate daily forecast using OpenAI with language-specific prompts
async function generateDailyForecast(baziPillar: string, language: string = 'en'): Promise<{ forecast: string, translatedPillar: string }> {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
    }

    const { systemPrompt, userPrompt } = getLanguageSpecificPrompts(baziPillar, language);

    try {
        const data = await callOpenAI({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 400
        });

        const response = data.choices[0].message.content;

        // Parse the response to extract pillar and forecast
        const lines = response.split('\n');
        let translatedPillar = lines[0] || baziPillar; // First line is the pillar

        // Clean up any prefix if AI still includes it
        const prefixPatterns = [
            /^Today's Bazi pillar is:\s*/i,
            /^เสา Bazi ของวันนี้คือ:\s*/i,
            /^今天的八字柱是:\s*/i,
            /^Today's pillar is:\s*/i,
            /^Pillar:\s*/i
        ];

        for (const pattern of prefixPatterns) {
            translatedPillar = translatedPillar.replace(pattern, '');
        }

        const forecast = lines.slice(1).join('\n').trim(); // Rest is the forecast

        return { forecast, translatedPillar };
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

    // Set CDN cache header to expire at midnight UTC
    const today = getTodayDate();
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    const secondsUntilMidnight = Math.floor((tomorrow.getTime() - Date.now()) / 1000);

    const cacheKey = `daily-bazi-${req.query.lang || 'en'}-${req.query.date || today}`;
    res.setHeader('Vercel-CDN-Cache-Control', `max-age=${secondsUntilMidnight}, stale-while-revalidate=300`);
    res.setHeader('Cache-Control', `public, max-age=0, s-maxage=${secondsUntilMidnight}, stale-while-revalidate=300`);
    res.setHeader('CDN-Cache-Control', `max-age=${secondsUntilMidnight}, stale-while-revalidate=300`);
    res.setHeader('Vercel-Cache-Tag', cacheKey);



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
        // Check for force refresh parameter and language
        const forceRefresh = req.query.force === 'true';
        const testDate = req.query.date as string;
        const language = req.query.lang as string || 'en';

        const today = testDate || getTodayDate();
        const cacheKey = `daily-bazi-${today}-${language}`;

        if (forceRefresh) {
            console.log(`[${new Date().toISOString()}] Force refresh requested - bypassing cache`);
        }

        if (testDate) {
            console.log(`[${new Date().toISOString()}] Test date requested: ${testDate}`);
        }

        // Check dev cache first (only works in vercel dev)
        const isDev = process.env.NODE_ENV === 'development' || !process.env.VERCEL;

        // Handle cache invalidation
        const invalidateCache = req.query.invalidate === 'true';
        if (invalidateCache && isDev) {
            clearDevCache(cacheKey);
        }

        if (isDev) {
            const cachedResponse = getDevCache(cacheKey);
            if (cachedResponse && !forceRefresh) {
                return res.status(200).json(cachedResponse);
            }
        }

        // Generate new forecast with language-specific prompt
        const englishPillar = getBaziPillarForDate(new Date());
        const { forecast, translatedPillar } = await generateDailyForecast(englishPillar, language);

        const dailyForecast: DailyBaziForecast = {
            date: today,
            baziPillar: translatedPillar,
            forecast
        };

        // Cache in dev
        if (isDev) {
            setDevCache(cacheKey, dailyForecast);
        }

        res.status(200).json(dailyForecast);
    } catch (error) {
        console.error('Error in daily-bazi API:', error);

        // Return fallback response
        res.status(500).json({
            date: getTodayDate(),
            baziPillar: "Yang Fire over Monkey",
            forecast: "Today brings the energy of Yang Fire over Monkey. This combination suggests a day of dynamic activity and clever problem-solving. The Fire element provides warmth and enthusiasm, while the Monkey brings wit and adaptability. Focus on creative projects and social interactions today. Avoid rushing into decisions without careful consideration. Let the steady flow of Fire guide your actions today.",
            error: "Generated fallback forecast due to API error"
        });
    }
};

export default handler; 