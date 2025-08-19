import type { VercelRequest, VercelResponse } from '@vercel/node';
import { format } from 'date-fns';
import { callOpenAI } from '../src/utils/openai-util.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const { birthDate, question, language = 'en' } = req.body;
        const formattedDate = format(new Date(birthDate), 'd MMM yyyy');
        const aspect = question.match(/my\s+(\w+)(?:\s+life)?/)?.[1] || '';
        
        // Language-specific prompts
        const prompts = {
            en: {
                systemPrompt: 'You are a precise Bazi expert. Provide only the essential insights in bullet points, without any preamble or unnecessary context. Focus on actionable guidance.',
                userPrompt: `Based on the Bazi reading for ${formattedDate}, provide a concise analysis of the person's ${aspect}.\n    Format your response in 3-4 short bullet points, focusing ONLY on:\n    - Key strengths/challenges in their ${aspect}\n    - Specific opportunities or areas to focus on\n    - Practical advice or recommendations\n    \n    Keep each point brief and actionable. Do not include any introductory text or conclusions.\n    Use ** for emphasis of important terms.`
            },
            th: {
                systemPrompt: 'คุณเป็นผู้เชี่ยวชาญ Bazi ที่แม่นยำ ให้เฉพาะข้อมูลเชิงลึกที่จำเป็นในรูปแบบจุด โดยไม่มีคำนำหรือบริบทที่ไม่จำเป็น เน้นคำแนะนำที่ปฏิบัติได้',
                userPrompt: `จากข้อมูลการอ่านดวง Bazi สำหรับวันที่ ${formattedDate} ให้การวิเคราะห์ที่กระชับของ ${aspect} ของบุคคล\n    จัดรูปแบบคำตอบของคุณใน 3-4 จุดสั้นๆ เน้นเฉพาะ:\n    - จุดแข็ง/ความท้าทายหลักใน ${aspect} ของพวกเขา\n    - โอกาสเฉพาะหรือพื้นที่ที่ควรเน้น\n    - คำแนะนำหรือข้อเสนอแนะที่ปฏิบัติได้\n    \n    ให้แต่ละจุดสั้นและปฏิบัติได้ อย่ารวมข้อความนำหรือข้อสรุปใดๆ ใช้ ** สำหรับการเน้นคำสำคัญ`
            },
            zh: {
                systemPrompt: '您是一位精确的八字专家。仅以要点形式提供必要的洞察，无需前言或不必要的上下文。专注于可操作的指导。',
                userPrompt: `基于 ${formattedDate} 的八字解读，对该人的 ${aspect} 提供简洁分析。\n    以3-4个简短要点格式化您的回答，仅专注于：\n    - 他们 ${aspect} 的关键优势/挑战\n    - 具体机会或需要关注的领域\n    - 实用建议或推荐\n    \n    保持每个要点简短且可操作。不要包含任何介绍性文字或结论。使用 ** 强调重要术语。`
            }
        };

        const { systemPrompt, userPrompt } = prompts[language as keyof typeof prompts] || prompts.en;
        const data = await callOpenAI({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 300
        });
        const content = data.choices[0].message.content;
        res.status(200).json({ content });
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
} 