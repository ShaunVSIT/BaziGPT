export interface DailyBaziForecast {
    date: string;
    baziPillar: string;
    forecast: string;
    cached: boolean;
    error?: string;
}

export interface PersonalForecastRequest {
    birthDate: string;
    birthTime?: string;
}

export interface PersonalForecastResponse {
    todayPillar: string;
    personalForecast: string;
    cached: boolean;
    error?: string;
}

// Mock data for development
const mockForecast: DailyBaziForecast = {
    date: new Date().toISOString().split('T')[0],
    baziPillar: "Yang Fire over Monkey",
    forecast: "Today brings the energy of Yang Fire over Monkey. This combination suggests a day of dynamic activity and clever problem-solving. The Fire element provides warmth and enthusiasm, while the Monkey brings wit and adaptability. Focus on creative projects and social interactions today. Avoid rushing into decisions without careful consideration. Let the steady flow of Fire guide your actions today.",
    cached: false
};

const mockPersonalForecast: PersonalForecastResponse = {
    todayPillar: "Yang Fire over Monkey",
    personalForecast: "• Be mindful of your energy levels today - the Fire element may make you feel more active than usual\n• Focus on creative projects and social interactions\n• Avoid rushing into decisions without careful consideration",
    cached: false
};

export async function fetchDailyForecast(): Promise<DailyBaziForecast> {
    const isDevelopment = import.meta.env.MODE === 'development';

    if (isDevelopment) {
        // In development, return mock data with a small delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        return mockForecast;
    }

    // In production, call the actual API
    try {
        const response = await fetch('/api/daily-bazi');

        if (!response.ok) {
            throw new Error(`Failed to fetch forecast: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching daily forecast:', error);
        // Return fallback data if API fails
        return {
            date: new Date().toISOString().split('T')[0],
            baziPillar: "Yang Fire over Monkey",
            forecast: "Today brings the energy of Yang Fire over Monkey. This combination suggests a day of dynamic activity and clever problem-solving. The Fire element provides warmth and enthusiasm, while the Monkey brings wit and adaptability. Focus on creative projects and social interactions today. Avoid rushing into decisions without careful consideration. Let the steady flow of Fire guide your actions today.",
            cached: false,
            error: "Generated fallback forecast due to API error"
        };
    }
}

export async function fetchPersonalForecast(birthDate: string, birthTime?: string): Promise<PersonalForecastResponse> {
    const isDevelopment = import.meta.env.MODE === 'development';

    if (isDevelopment) {
        // In development, return mock data with a small delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        return mockPersonalForecast;
    }

    // In production, call the actual API
    try {
        const response = await fetch('/api/daily-personal-forecast', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                birthDate,
                birthTime
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch personal forecast: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching personal forecast:', error);
        // Return fallback data if API fails
        return {
            todayPillar: "Yang Fire over Monkey",
            personalForecast: "• Be mindful of your energy levels today - the Fire element may make you feel more active than usual\n• Focus on creative projects and social interactions\n• Avoid rushing into decisions without careful consideration",
            cached: false,
            error: "Generated fallback forecast due to API error"
        };
    }
} 