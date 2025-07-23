import type { VercelRequest, VercelResponse } from '@vercel/node';
import { format } from 'date-fns';

const API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL_NAME = 'gpt-3.5-turbo';

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
        const { person1BirthDate, person1BirthTime, person2BirthDate, person2BirthTime } = req.body;
        const person1FormattedDate = format(new Date(person1BirthDate), 'd MMM yyyy');
        const person2FormattedDate = format(new Date(person2BirthDate), 'd MMM yyyy');
        const person1TimeContext = person1BirthTime ? `at ${person1BirthTime}` : 'at an estimated time (noon)';
        const person2TimeContext = person2BirthTime ? `at ${person2BirthTime}` : 'at an estimated time (noon)';
        const systemPrompt = 'You are an expert in Chinese Four Pillars (Bazi) astrology, specializing in relationship compatibility analysis. Provide clear, structured compatibility insights based on two birth charts. Use grounded language and avoid vague generalizations.';
        const userPrompt = `Analyze the compatibility between two people using Chinese Bazi astrology:\n\nYou: ${person1FormattedDate} ${person1TimeContext}\nYour Partner: ${person2FormattedDate} ${person2TimeContext}\n\nPlease provide a structured compatibility analysis including:\n\n1. **Elemental Compatibility**: How your Five Elements (Wood, Fire, Earth, Metal, Water) support or weaken each other\n2. **Pillar-by-Pillar Analysis**: Year, Month, Day, and Hour pillar interactions between you both\n3. **Relationship Dynamics**: Your communication styles, emotional tendencies, and potential friction points\n4. **Strengths & Challenges**: Key alignments vs areas needing effort in your relationship\n5. **Practical Advice**: Specific, actionable suggestions to improve harmony or address imbalances\n\nFormat your response with clear section headings and bullet points where helpful. Use \"you\" and \"your partner\" throughout the analysis to make it more personal and relatable.\n\nInclude 2-3 key bullet points that would be perfect for sharing, starting with \"•\" and focusing on the most interesting compatibility insights. These should be specific to this couple's birth charts and focus on relationship dynamics, communication styles, and practical advice rather than technical elemental jargon.\n\nAt the end, include a concise, shareable summary (2–3 lines) starting with **\"You and your partner show...\"** or **\"Your relationship demonstrates...\"**. Make it personal and specific to the couple, avoiding generic statements. Keep the tone balanced and insightful.\n\nNote: If exact time of birth is missing for either person, use **12:00 PM** as the default Hour Pillar reference.`;
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
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
} 