export interface DailyBaziForecast {
    date: string;
    baziPillar: string;
    forecast: string;
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



export async function fetchDailyForecast(language: string = 'en'): Promise<DailyBaziForecast> {
    // Call the actual API with language parameter
    try {
        const params = new URLSearchParams();
        if (language !== 'en') {
            params.set('lang', language);
        }

        const response = await fetch(`/api/daily-bazi?${params.toString()}`);

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
            error: "Generated fallback forecast due to API error"
        };
    }
}

export async function fetchPersonalForecast(birthDate: string, birthTime?: string): Promise<PersonalForecastResponse> {
    // Call the actual API
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