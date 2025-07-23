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
        if (req.url?.includes('/bazi-reading')) {
            const { birthDate, birthTime } = req.body;
            const formattedDate = format(new Date(birthDate), 'd MMM yyyy');
            const timeContext = birthTime ? `at ${birthTime}` : 'at an estimated time (noon)';
            const systemPrompt = 'You are an expert in Chinese Four Pillars (Bazi) astrology, providing detailed and accurate readings based on birth dates. Your readings are comprehensive yet concise.';
            const userPrompt = `Give me a chinese (Bazi) fortune reading for ${formattedDate} ${timeContext}. Include:\n    1. The four pillars (Year, Month, Day, Hour)\n    2. Key insights about:\n       - Core self\n       - Favorable and Unfavorable Elements\n       - Luck Cycle & Destiny\n       - Current Luck Pillar (运势 Yun Shi)\n    3. A conclusion summarizing the main themes and potential life path with what to focus on and what to improve;\n    4. A short, shareable summary (2-3 lines) highlighting the person's key strengths and potential. Make it personal and positive, starting with "A/An [adjective] individual..."\n    \n    Note: If no specific time is provided, use noon (12:00) as a reference point for the Hour Pillar.`;
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
            return;
        }
        if (req.url?.includes('/bazi-followup')) {
            const { birthDate, question } = req.body;
            const formattedDate = format(new Date(birthDate), 'd MMM yyyy');
            const aspect = question.match(/my\s+(\w+)(?:\s+life)?/)?.[1] || '';
            const systemPrompt = 'You are a precise Bazi expert. Provide only the essential insights in bullet points, without any preamble or unnecessary context. Focus on actionable guidance.';
            const userPrompt = `Based on the Bazi reading for ${formattedDate}, provide a concise analysis of the person's ${aspect}.\n    Format your response in 3-4 short bullet points, focusing ONLY on:\n    - Key strengths/challenges in their ${aspect}\n    - Specific opportunities or areas to focus on\n    - Practical advice or recommendations\n    \n    Keep each point brief and actionable. Do not include any introductory text or conclusions.\n    Use ** for emphasis of important terms.`;
            const data = await callOpenAI([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ], 300);
            const content = data.choices[0].message.content;
            res.status(200).json({ content });
            return;
        }
        if (req.url?.includes('/bazi-compatibility')) {
            const { person1BirthDate, person1BirthTime, person2BirthDate, person2BirthTime } = req.body;
            const person1FormattedDate = format(new Date(person1BirthDate), 'd MMM yyyy');
            const person2FormattedDate = format(new Date(person2BirthDate), 'd MMM yyyy');
            const person1TimeContext = person1BirthTime ? `at ${person1BirthTime}` : 'at an estimated time (noon)';
            const person2TimeContext = person2BirthTime ? `at ${person2BirthTime}` : 'at an estimated time (noon)';
            const systemPrompt = 'You are an expert in Chinese Four Pillars (Bazi) astrology, specializing in relationship compatibility analysis. Provide clear, structured compatibility insights based on two birth charts. Use grounded language and avoid vague generalizations.';
            const userPrompt = `Analyze the compatibility between two people using Chinese Bazi astrology:\n\nYou: ${person1FormattedDate} ${person1TimeContext}\nYour Partner: ${person2FormattedDate} ${person2TimeContext}\n\nPlease provide a structured compatibility analysis including:\n\n1. **Elemental Compatibility**: How your Five Elements (Wood, Fire, Earth, Metal, Water) support or weaken each other\n2. **Pillar-by-Pillar Analysis**: Year, Month, Day, and Hour pillar interactions between you both\n3. **Relationship Dynamics**: Your communication styles, emotional tendencies, and potential friction points\n4. **Strengths & Challenges**: Key alignments vs areas needing effort in your relationship\n5. **Practical Advice**: Specific, actionable suggestions to improve harmony or address imbalances\n\nFormat your response with clear section headings and bullet points where helpful. Use "you" and "your partner" throughout the analysis to make it more personal and relatable.\n\nInclude 2-3 key bullet points that would be perfect for sharing, starting with "•" and focusing on the most interesting compatibility insights. These should be specific to this couple's birth charts and focus on relationship dynamics, communication styles, and practical advice rather than technical elemental jargon.\n\nAt the end, include a concise, shareable summary (2–3 lines) starting with **"You and your partner show..."** or **"Your relationship demonstrates..."**. Make it personal and specific to the couple, avoiding generic statements. Keep the tone balanced and insightful.\n\nNote: If exact time of birth is missing for either person, use **12:00 PM** as the default Hour Pillar reference.`;
            const data = await callOpenAI([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ], 1200);
            const reading = data.choices[0].message.content;
            const paragraphs = reading.split('\n\n');
            const shareableSummary = paragraphs[paragraphs.length - 1].startsWith('You and your partner show') ||
                paragraphs[paragraphs.length - 1].startsWith('Your relationship demonstrates')
                ? paragraphs[paragraphs.length - 1]
                : "You and your partner show balanced compatibility with complementary strengths and areas for growth.";
            const mainReading = paragraphs.slice(0, -1).join('\n\n');
            res.status(200).json({ reading: mainReading, shareableSummary });
            return;
        }
        res.status(400).json({ error: 'Invalid endpoint' });
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
}
// Vercel will route /api/bazi-reading, /api/bazi-followup, /api/bazi-compatibility to this file 