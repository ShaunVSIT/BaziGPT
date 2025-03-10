import { format } from 'date-fns';

// Add development test type
declare global {
    interface Window {
        testApiMonitoring: () => Promise<void>;
    }
}

// Types
interface ApiMetrics {
    timestamp: number;
    endpoint: string;
    responseTime: number;
    inputTokens: number;
    outputTokens: number;
    model: string;
    success: boolean;
    error?: string;
    estimatedCost: number;
}

interface BaziReading {
    yearPillar: string;
    monthPillar: string;
    dayPillar: string;
    hourPillar: string;
    reading: string;
    shareableSummary: string;
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL_NAME = 'gpt-4o-mini';
const IS_DEV = import.meta.env.MODE === 'development';

// Test function for monitoring
export async function testApiMonitoring() {
    console.log('🧪 Starting API monitoring tests...');

    // Test 1: Normal reading
    try {
        console.log('Test 1: Getting a Bazi reading...');
        await getBaziReading(new Date(), '12:00');
        console.log('✅ Test 1 passed: Successfully got reading');
    } catch (error) {
        console.error('❌ Test 1 failed:', error);
    }

    // Test 2: Follow-up questions
    try {
        console.log('Test 2: Testing follow-up questions...');
        const questions = [
            'What about my career?',
            'What about my health?',
            'What about my relationships?'
        ];

        for (const question of questions) {
            console.log(`Testing question: ${question}`);
            await getFollowUpAnswer(new Date(), question);
        }
        console.log('✅ Test 2 passed: Successfully tested follow-ups');
    } catch (error) {
        console.error('❌ Test 2 failed:', error);
    }

    console.log('🏁 API monitoring tests completed');
    console.log('Check the logs above for detailed metrics of each call');
}

// Token counting helper (rough estimate)
function estimateTokens(text: string): number {
    return Math.ceil(text.split(/\s+/).length * 1.3);
}

// Cost estimation (in USD)
function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const rates: Record<string, { input: number; output: number }> = {
        'gpt-4o-mini': { input: 0.01 / 1000, output: 0.03 / 1000 },
        'gpt-4-turbo-preview': { input: 0.01 / 1000, output: 0.03 / 1000 },
        'gpt-4': { input: 0.03 / 1000, output: 0.06 / 1000 }
    };
    const rate = rates[model] || rates['gpt-4'];
    return (inputTokens * rate.input) + (outputTokens * rate.output);
}

// Log metrics to Vercel
async function logApiMetrics(metrics: ApiMetrics) {
    try {
        // Format for Vercel logs
        const vercelLog = {
            timestamp: new Date(metrics.timestamp).toISOString(),
            level: metrics.success ? 'info' : 'error',
            message: `API ${metrics.endpoint}`,
            data: {
                responseTime: `${Math.round(metrics.responseTime)}ms`,
                tokens: {
                    input: metrics.inputTokens,
                    output: metrics.outputTokens,
                    total: metrics.inputTokens + metrics.outputTokens
                },
                cost: `$${metrics.estimatedCost.toFixed(4)}`,
                model: metrics.model,
                success: metrics.success
            }
        };

        // Log in a format that Vercel can parse nicely
        console.log(JSON.stringify(vercelLog));
    } catch (error) {
        console.error('Error logging metrics:', error);
    }
}

// Expose test function to window object only in development
if (typeof window !== 'undefined' && IS_DEV) {
    window.testApiMonitoring = testApiMonitoring;
}

export async function getBaziReading(birthDate: Date, birthTime?: string): Promise<BaziReading> {
    const startTime = performance.now();
    const formattedDate = format(birthDate, 'd MMM yyyy');
    const timeContext = birthTime
        ? `at ${birthTime}`
        : "at an estimated time (noon)";

    const systemPrompt = 'You are an expert in Chinese Four Pillars (Bazi) astrology, providing detailed and accurate readings based on birth dates. Your readings are comprehensive yet concise.';
    const userPrompt = `Give me a chinese (Bazi) fortune reading for ${formattedDate} ${timeContext}. Include:
    1. The four pillars (Year, Month, Day, Hour)
    2. Key insights about:
       - Core self
       - Favorable and Unfavorable Elements
       - Luck Cycle & Destiny
       - Current Luck Pillar (运势 Yun Shi)
    3. A conclusion summarizing the main themes and potential life path with what to focus on and what to improve;
    4. A short, shareable summary (2-3 lines) highlighting the person's key strengths and potential. Make it personal and positive, starting with "A/An [adjective] individual..."
    
    Note: If no specific time is provided, use noon (12:00) as a reference point for the Hour Pillar.`;

    const model = MODEL_NAME;
    const inputTokens = estimateTokens(systemPrompt + userPrompt);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }

        const data = await response.json();
        const reading = data.choices[0].message.content;

        // Extract the shareable summary (last paragraph)
        const paragraphs = reading.split('\n\n');
        const shareableSummary = paragraphs[paragraphs.length - 1].startsWith('A') || paragraphs[paragraphs.length - 1].startsWith('An')
            ? paragraphs[paragraphs.length - 1]
            : "A balanced individual with natural leadership qualities, combining wisdom with adaptability.";

        // Remove the shareable summary from the main reading if it exists
        const mainReading = paragraphs.slice(0, -1).join('\n\n');

        const outputTokens = estimateTokens(reading);
        const responseTime = performance.now() - startTime;

        // Log metrics
        await logApiMetrics({
            timestamp: Date.now(),
            endpoint: 'getBaziReading',
            responseTime,
            inputTokens,
            outputTokens,
            model,
            success: true,
            estimatedCost: calculateCost(model, inputTokens, outputTokens)
        });

        // Parse the reading to extract the pillars
        const yearPillar = mainReading.match(/Year Pillar: (.*?)(?:\n|$)/)?.[1] || 'Not specified';
        const monthPillar = mainReading.match(/Month Pillar: (.*?)(?:\n|$)/)?.[1] || 'Not specified';
        const dayPillar = mainReading.match(/Day Pillar: (.*?)(?:\n|$)/)?.[1] || 'Not specified';
        const hourPillar = mainReading.match(/Hour Pillar: (.*?)(?:\n|$)/)?.[1] || 'Not specified';

        return {
            yearPillar,
            monthPillar,
            dayPillar,
            hourPillar,
            reading: mainReading,
            shareableSummary
        };
    } catch (error) {
        const responseTime = performance.now() - startTime;

        // Log error metrics
        await logApiMetrics({
            timestamp: Date.now(),
            endpoint: 'getBaziReading',
            responseTime,
            inputTokens,
            outputTokens: 0,
            model,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            estimatedCost: calculateCost(model, inputTokens, 0)
        });

        console.error('Error getting Bazi reading:', error);
        throw new Error('Failed to generate Bazi reading. Please try again later.');
    }
}

export async function getFollowUpAnswer(birthDate: Date, question: string): Promise<string> {
    const startTime = performance.now();
    const formattedDate = format(birthDate, 'd MMM yyyy');
    const aspect = question.match(/my\s+(\w+)(?:\s+life)?/)?.[1] || '';

    const systemPrompt = 'You are a precise Bazi expert. Provide only the essential insights in bullet points, without any preamble or unnecessary context. Focus on actionable guidance.';
    const userPrompt = `Based on the Bazi reading for ${formattedDate}, provide a concise analysis of the person's ${aspect}.
    Format your response in 3-4 short bullet points, focusing ONLY on:
    - Key strengths/challenges in their ${aspect}
    - Specific opportunities or areas to focus on
    - Practical advice or recommendations
    
    Keep each point brief and actionable. Do not include any introductory text or conclusions.
    Use ** for emphasis of important terms.`;

    const model = MODEL_NAME;
    const inputTokens = estimateTokens(systemPrompt + userPrompt);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 300,
            }),
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        const outputTokens = estimateTokens(content);
        const responseTime = performance.now() - startTime;

        // Log metrics
        await logApiMetrics({
            timestamp: Date.now(),
            endpoint: 'getFollowUpAnswer',
            responseTime,
            inputTokens,
            outputTokens,
            model,
            success: true,
            estimatedCost: calculateCost(model, inputTokens, outputTokens)
        });

        return content;
    } catch (error) {
        const responseTime = performance.now() - startTime;

        // Log error metrics
        await logApiMetrics({
            timestamp: Date.now(),
            endpoint: 'getFollowUpAnswer',
            responseTime,
            inputTokens,
            outputTokens: 0,
            model,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            estimatedCost: calculateCost(model, inputTokens, 0)
        });

        console.error('Error getting follow-up answer:', error);
        throw new Error('Failed to generate follow-up answer. Please try again later.');
    }
} 