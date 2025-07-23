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
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
} 