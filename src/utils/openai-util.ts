const API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';
const DEFAULT_TEMPERATURE = 0.7;

export async function callOpenAI({
    messages,
    max_tokens,
    model = DEFAULT_MODEL,
    temperature = DEFAULT_TEMPERATURE,
}: {
    messages: any[],
    max_tokens: number,
    model?: string,
    temperature?: number,
}): Promise<any> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API key not configured');

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens,
        }),
    });
    if (!response.ok) {
        throw new Error(`OpenAI API call failed: ${response.statusText}`);
    }
    return response.json();
} 