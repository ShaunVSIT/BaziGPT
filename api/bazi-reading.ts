import type { VercelRequest, VercelResponse } from '@vercel/node';
import { format } from 'date-fns';

const API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL_NAME = 'gpt-4o-mini';

async function callOpenAI(messages: any[], max_tokens: number) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: MODEL_NAME,
            messages,
            temperature: 0.7,
            max_tokens,
        }),
    });
    if (!response.ok) {
        throw new Error(`OpenAI API call failed: ${response.statusText}`);
    }
    return response.json();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const { birthDate, birthTime } = req.body;
        const formattedDate = format(new Date(birthDate), 'd MMM yyyy');
        const timeContext = birthTime ? `at ${birthTime}` : 'at an estimated time (noon)';
        const systemPrompt = 'You are an expert in Chinese Four Pillars (Bazi) astrology, providing detailed and accurate readings based on birth dates. Your readings are comprehensive yet concise.';
        const userPrompt = `Give me a chinese (Bazi) fortune reading for ${formattedDate} ${timeContext}. Include:\n    1. The four pillars (Year, Month, Day, Hour)\n    2. Key insights about:\n       - Core self\n       - Favorable and Unfavorable Elements\n       - Luck Cycle & Destiny\n       - Current Luck Pillar (运势 Yun Shi)\n    3. A conclusion summarizing the main themes and potential life path with what to focus on and what to improve;\n    4. A short, shareable summary (2-3 lines) highlighting the person's key strengths and potential. Make it personal and positive, starting with \"A/An [adjective] individual...\"\n    \n    Note: If no specific time is provided, use noon (12:00) as a reference point for the Hour Pillar.`;
        const data = await callOpenAI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ], 1000);
        const reading = data.choices[0].message.content;
        const paragraphs = reading.split('\n\n');
        const shareableSummary = paragraphs[paragraphs.length - 1].startsWith('A') || paragraphs[paragraphs.length - 1].startsWith('An')
            ? paragraphs[paragraphs.length - 1]
            : "A balanced individual with natural leadership qualities, combining wisdom with adaptability.";
        const mainReading = paragraphs.slice(0, -1).join('\n\n');
        const yearPillar = mainReading.match(/Year Pillar: (.*?)(?:\n|$)/)?.[1] || 'Not specified';
        const monthPillar = mainReading.match(/Month Pillar: (.*?)(?:\n|$)/)?.[1] || 'Not specified';
        const dayPillar = mainReading.match(/Day Pillar: (.*?)(?:\n|$)/)?.[1] || 'Not specified';
        const hourPillar = mainReading.match(/Hour Pillar: (.*?)(?:\n|$)/)?.[1] || 'Not specified';
        res.status(200).json({ yearPillar, monthPillar, dayPillar, hourPillar, reading: mainReading, shareableSummary });
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
} 