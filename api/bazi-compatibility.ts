import type { VercelRequest, VercelResponse } from '@vercel/node';
import { format } from 'date-fns';
import { callOpenAI } from '../src/utils/openai-util.js';

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
        const userPrompt = `Analyze the compatibility between two people using Chinese Bazi astrology.

        Format all section headings (e.g., "Elemental Compatibility", "Relationship Dynamics", "Strengths and Challenges", "Practical Tips") in bold using Markdown (e.g., **Heading**:). For the shareable summary, always use the exact heading **Shareable Summary**: (in bold Markdown) before the summary text. Use bullet points for lists. Keep the rest of the text in plain Markdown.

        Write the reading in a personal, direct style—address the couple as "you and your partner" throughout.

        You: ${person1FormattedDate} ${person1TimeContext}
        Your Partner: ${person2FormattedDate} ${person2TimeContext}

        Please provide:
        1. A brief summary of elemental compatibility (Five Elements).
        2. Key relationship dynamics and potential friction points.
        3. Main strengths and challenges in the relationship.
        4. 2–3 practical tips for improving harmony.

        At the end, include a concise, shareable summary (2–3 lines) starting with "You and your partner..." or "Your relationship demonstrates...". Make the analysis personal and specific, avoiding generic statements.

        If birth time is missing, use 12:00 PM as the default.`;

        const start = Date.now();
        const data = await callOpenAI({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 1200,
            model: 'gpt-3.5-turbo'
        });
        const durationMs = Date.now() - start;
        console.log(`[DEBUG] OpenAI bazi-compatibility duration: ${durationMs}ms`);

        const reading = data.choices[0].message.content;
        console.log('[DEBUG] Full raw compatibility reading:', reading);

        const paragraphs = reading.split('\n\n');
        let shareableSummary = "You and your partner show balanced compatibility with complementary strengths and areas for growth.";
        let mainReading = '';
        // Find the index of the '**Summary**:' heading
        const summaryHeadingIdx = paragraphs.findIndex(p => /\*\*Summary\*\*:/i.test(p.trim()));
        if (summaryHeadingIdx !== -1 && paragraphs[summaryHeadingIdx + 1]) {
            shareableSummary = paragraphs[summaryHeadingIdx + 1].trim();
            // Exclude the heading and summary from the main reading
            mainReading = paragraphs
                .filter((_, idx) => idx !== summaryHeadingIdx && idx !== summaryHeadingIdx + 1)
                .join('\n\n');
        } else {
            // Fallback to previous logic
            if (
                paragraphs[paragraphs.length - 1].startsWith('You and your partner show') ||
                paragraphs[paragraphs.length - 1].startsWith('Your relationship demonstrates')
            ) {
                shareableSummary = paragraphs[paragraphs.length - 1];
            }
            mainReading = paragraphs.slice(0, -1).join('\n\n');
        }
        res.status(200).json({ reading: mainReading, shareableSummary });
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
} 