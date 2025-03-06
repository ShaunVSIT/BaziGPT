import { format } from 'date-fns';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

interface BaziReading {
    yearPillar: string;
    monthPillar: string;
    dayPillar: string;
    hourPillar: string;
    reading: string;
}

export async function getBaziReading(birthDate: Date): Promise<BaziReading> {
    const formattedDate = format(birthDate, 'yyyy-MM-dd');

    const prompt = `As a Bazi (Chinese Four Pillars) expert, please provide a detailed reading for someone born on ${formattedDate}. 
  Include:
  1. The four pillars (Year, Month, Day, Hour)
  2. A comprehensive reading that includes:
     - Personality traits
     - Career tendencies
     - Relationship patterns
     - Health considerations
     - Life path guidance
  Please format the response in a clear, structured way.`;

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
                        content: 'You are an expert in Chinese Four Pillars (Bazi) astrology, providing detailed and accurate readings based on birth dates.'
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

        // Parse the reading to extract the pillars (this is a simplified version)
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
} 