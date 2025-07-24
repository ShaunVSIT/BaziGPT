import type { VercelRequest, VercelResponse } from '@vercel/node';
import { format } from 'date-fns';
import { callOpenAI } from '../src/utils/openai-util.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const { birthDate, birthTime } = req.body;
        const dateString = birthDate;
        const timeContext = birthTime ? `at ${birthTime}` : 'at an estimated time (noon)';
        const systemPrompt = 'You are an expert in Chinese Four Pillars (Bazi) astrology, providing detailed and accurate readings based on birth dates. Your readings are comprehensive yet concise.';
        const userPrompt = `Give me a chinese (Bazi) fortune reading for a user born on ${dateString} ${timeContext}.
        Format all section headings (e.g., "The Four Pillars", "Key Insights", "Conclusion", "Shareable Summary") in bold using Markdown (e.g., **Heading**:). Use bullet points for lists. Keep the rest of the text in plain Markdown.
        Include:\n    1. The four pillars (Year, Month, Day, Hour)\n    
        2. Key insights about:\n       - Core self\n       - Favorable and Unfavorable Elements\n       - Luck Cycle & Destiny\n       - Current Luck Pillar (运势 Yun Shi)\n    
        3. A conclusion summarizing the main themes and potential life path with what to focus on and what to improve;\n    
        4. A short, shareable summary (2-3 lines) highlighting the person's key strengths and potential. Make it personal and positive, starting with \"A/An [adjective] individual...\"\n    \n    
        
        Note: If no specific time is provided, use noon (12:00) as a reference point for the Hour Pillar. Also, make the reading address the user directly, as if you are talking to them. but no need for 'dear user' etc, just go straight to the reading.`;
        const data = await callOpenAI({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 1000,
            model: 'gpt-3.5-turbo'
        });

        const reading = data.choices[0].message.content;
        // Try to extract the shareable summary using a regex (handles both same-line and next-line cases)
        let shareableSummary = "A balanced individual with natural leadership qualities, combining wisdom with adaptability.";
        let mainReading = reading;

        const summaryMatch = reading.match(/\*\*Shareable Summary\*\*:?\s*([\s\S]*?)(?:\n{2,}|$)/i);
        if (summaryMatch && summaryMatch[1]) {
            shareableSummary = summaryMatch[1].trim();
            // Remove the shareable summary section (heading and content) from the main reading
            mainReading = reading.replace(summaryMatch[0], '').trim();
        } else {
            // Fallback: try to find a paragraph that starts with "A" or "An"
            const paragraphs = reading.split(/\n{2,}/g).map(p => p.trim()).filter(Boolean);
            for (let i = 0; i < paragraphs.length; i++) {
                if (/^(A|An) /i.test(paragraphs[i])) {
                    shareableSummary = paragraphs[i].trim();
                    break;
                }
            }
            mainReading = paragraphs.filter(p => p.trim() !== shareableSummary).join('\n\n');
        }
        if (!mainReading.trim()) {
            mainReading = reading.replace(shareableSummary, '').trim();
        }
        const yearPillar = mainReading.match(/Year Pillar: (.*?)(?:\n|$)/)?.[1] || 'Not specified';
        const monthPillar = mainReading.match(/Month Pillar: (.*?)(?:\n|$)/)?.[1] || 'Not specified';
        const dayPillar = mainReading.match(/Day Pillar: (.*?)(?:\n|$)/)?.[1] || 'Not specified';
        const hourPillar = mainReading.match(/Hour Pillar: (.*?)(?:\n|$)/)?.[1] || 'Not specified';
        res.status(200).json({ yearPillar, monthPillar, dayPillar, hourPillar, reading: mainReading, shareableSummary });
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
} 