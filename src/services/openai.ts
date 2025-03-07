import { format } from 'date-fns';

// Add Google Analytics types
declare global {
    interface Window {
        gtag: (command: string, action: string, params: any) => void;
    }
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

// Analytics interface
interface ApiMetrics {
    timestamp: number;
    endpoint: string;
    duration: number;
    success: boolean;
    error?: string;
}

// Simple in-memory metrics store (replace with proper analytics service in production)
const metrics: ApiMetrics[] = [];

async function trackApiCall(endpoint: string, operation: () => Promise<any>): Promise<any> {
    const start = performance.now();
    try {
        const result = await operation();
        const duration = performance.now() - start;

        // Log metrics
        metrics.push({
            timestamp: Date.now(),
            endpoint,
            duration,
            success: true
        });

        // Send to Google Analytics
        if (window.gtag) {
            window.gtag('event', 'api_call', {
                event_category: 'API',
                event_label: endpoint,
                value: Math.round(duration)
            });
        }

        return result;
    } catch (error) {
        const duration = performance.now() - start;

        // Log error metrics
        metrics.push({
            timestamp: Date.now(),
            endpoint,
            duration,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        // Send error to Google Analytics
        if (window.gtag) {
            window.gtag('event', 'api_error', {
                event_category: 'Error',
                event_label: endpoint,
                value: Math.round(duration)
            });
        }

        throw error;
    }
}

// Add rate limiting
const rateLimiter = {
    tokens: 50, // Adjust based on your OpenAI plan
    lastRefill: Date.now(),
    refillRate: 1000, // 1 token per second
    refillAmount: 1,

    async waitForToken(): Promise<boolean> {
        const now = Date.now();
        const timePassed = now - this.lastRefill;
        const tokensToAdd = Math.floor(timePassed / this.refillRate) * this.refillAmount;

        this.tokens = Math.min(50, this.tokens + tokensToAdd);
        this.lastRefill = now - (timePassed % this.refillRate);

        if (this.tokens < 1) {
            await new Promise(resolve => setTimeout(resolve, this.refillRate));
            return this.waitForToken();
        }

        this.tokens--;
        return true;
    }
};

interface BaziReading {
    yearPillar: string;
    monthPillar: string;
    dayPillar: string;
    hourPillar: string;
    reading: string;
}

export async function getBaziReading(birthDate: Date, birthTime?: string): Promise<BaziReading> {
    await rateLimiter.waitForToken();

    return trackApiCall('bazi_reading', async () => {
        const formattedDate = format(birthDate, 'd MMM yyyy');
        const timeContext = birthTime
            ? `at ${birthTime}`
            : "at an estimated time (noon)";

        const prompt = `Give me a chinese (Bazi) fortune reading for ${formattedDate} ${timeContext}. Include:
        1. The four pillars (Year, Month, Day, Hour)
        2. Key insights about:
           - Core self
           - Favorable and Unfavorable Elements
           - Luck Cycle & Destiny
           - Current Luck Pillar (运势 Yun Shi)
        3. A conclusion summarizing the main themes and potential life path with what to focus on and what to improve;
        
        Note: If no specific time is provided, use noon (12:00) as a reference point for the Hour Pillar.`;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert in Chinese Four Pillars (Bazi) astrology, providing detailed and accurate readings based on birth dates. Your readings are comprehensive yet concise.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
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

            // Parse the reading to extract the pillars
            const yearPillar = reading.match(/Year Pillar: (.*?)(?:\n|$)/)?.[1] || 'Not specified';
            const monthPillar = reading.match(/Month Pillar: (.*?)(?:\n|$)/)?.[1] || 'Not specified';
            const dayPillar = reading.match(/Day Pillar: (.*?)(?:\n|$)/)?.[1] || 'Not specified';
            const hourPillar = reading.match(/Hour Pillar: (.*?)(?:\n|$)/)?.[1] || 'Not specified';

            return {
                yearPillar,
                monthPillar,
                dayPillar,
                hourPillar,
                reading
            };
        } catch (error) {
            console.error('Error getting Bazi reading:', error);
            throw new Error('Failed to generate Bazi reading. Please try again later.');
        }
    });
}

export async function getFollowUpAnswer(birthDate: Date, question: string): Promise<string> {
    await rateLimiter.waitForToken();

    return trackApiCall('follow_up_answer', async () => {
        const formattedDate = format(birthDate, 'd MMM yyyy');
        const aspect = question.match(/my\s+(\w+)(?:\s+life)?/)?.[1] || '';

        const prompt = `Based on the Bazi reading for ${formattedDate}, provide a concise analysis of the person's ${aspect}.
        Format your response in 3-4 short bullet points, focusing ONLY on:
        - Key strengths/challenges in their ${aspect}
        - Specific opportunities or areas to focus on
        - Practical advice or recommendations
        
        Keep each point brief and actionable. Do not include any introductory text or conclusions.
        Use ** for emphasis of important terms.`;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4-turbo-preview',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a precise Bazi expert. Provide only the essential insights in bullet points, without any preamble or unnecessary context. Focus on actionable guidance.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 300,
                }),
            });

            if (!response.ok) {
                throw new Error(`API call failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error getting follow-up answer:', error);
            throw new Error('Failed to generate follow-up answer. Please try again later.');
        }
    });
}

// Export metrics for debugging/monitoring
export function getApiMetrics() {
    return {
        totalCalls: metrics.length,
        successRate: (metrics.filter(m => m.success).length / metrics.length) * 100,
        averageDuration: metrics.reduce((acc, m) => acc + m.duration, 0) / metrics.length,
        recentErrors: metrics.filter(m => !m.success).slice(-5),
        metrics: metrics.slice(-50) // Last 50 calls
    };
} 