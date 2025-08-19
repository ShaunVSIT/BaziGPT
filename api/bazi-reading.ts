import type { VercelRequest, VercelResponse } from '@vercel/node';
import { format } from 'date-fns';
import { callOpenAI } from '../src/utils/openai-util.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const { birthDate, birthTime, language = 'en' } = req.body;
        const dateString = birthDate;
        const timeContext = birthTime ? `at ${birthTime}` : 'at an estimated time (noon)';
        
        // Language-specific prompts
        const prompts = {
            en: {
                systemPrompt: 'You are an expert in Chinese Four Pillars (Bazi) astrology, providing detailed and accurate readings based on birth dates. Your readings are comprehensive yet concise.',
                userPrompt: `Give me a chinese (Bazi) fortune reading for a user born on ${dateString} ${timeContext}.
                Format all section headings (e.g., "The Four Pillars", "Key Insights", "Conclusion", "Shareable Summary") in bold using Markdown (e.g., **Heading**:). Use bullet points for lists. Keep the rest of the text in plain Markdown.
                Include:\n    1. The four pillars (Year, Month, Day, Hour)\n    
                2. Key insights about:\n       - Core self\n       - Favorable and Unfavorable Elements\n       - Luck Cycle & Destiny\n       - Current Luck Pillar (运势 Yun Shi)\n    
                3. A conclusion summarizing the main themes and potential life path with what to focus on and what to improve;\n    
                4. A short, shareable summary (2-3 lines) highlighting the person's key strengths and potential. Make it personal and positive, starting with \"A/An [adjective] individual...\"\n    \n    
                
                Note: If no specific time is provided, use noon (12:00) as a reference point for the Hour Pillar. Also, make the reading address the user directly, as if you are talking to them. but no need for 'dear user' etc, just go straight to the reading.`
            },
            th: {
                systemPrompt: 'คุณเป็นผู้เชี่ยวชาญด้านโหราศาสตร์จีนสี่เสา (Bazi) ให้การอ่านดวงที่ละเอียดและแม่นยำตามวันเกิด การอ่านของคุณครอบคลุมแต่กระชับ',
                userPrompt: `ให้การอ่านดวงจีน (Bazi) สำหรับผู้ใช้ที่เกิดในวันที่ ${dateString} ${timeContext}
                จัดรูปแบบหัวข้อทั้งหมด (เช่น "เสาหลักทั้งสี่", "ข้อมูลเชิงลึกสำคัญ", "สรุป", "สรุปที่แชร์ได้") ให้เป็นตัวหนาโดยใช้ Markdown (เช่น **หัวข้อ**:) ใช้จุดสำหรับรายการ ให้ข้อความที่เหลือเป็น Markdown ธรรมดา
                รวม:\n    1. เสาหลักทั้งสี่ (ปี เดือน วัน ชั่วโมง)\n    
                2. ข้อมูลเชิงลึกสำคัญเกี่ยวกับ:\n       - ตัวตนหลัก\n       - ธาตุที่เอื้อและไม่เอื้อ\n       - วัฏจักรโชคและโชคชะตา\n       - เสาโชคปัจจุบัน (运势 Yun Shi)\n    
                3. สรุปสรุปธีมหลักและเส้นทางชีวิตที่อาจเป็นไปได้พร้อมสิ่งที่ควรเน้นและปรับปรุง;\n    
                4. สรุปสั้นๆ ที่แชร์ได้ (2-3 บรรทัด) ไฮไลท์จุดแข็งและศักยภาพหลักของบุคคล ทำให้เป็นส่วนตัวและบวก เริ่มต้นด้วย "บุคคลที่ [คำคุณศัพท์]..."\n    \n    
                
                หมายเหตุ: หากไม่ระบุเวลาที่เฉพาะเจาะจง ให้ใช้เที่ยงวัน (12:00) เป็นจุดอ้างอิงสำหรับเสาชั่วโมง และให้การอ่านพูดกับผู้ใช้โดยตรง ราวกับว่าคุณกำลังพูดกับพวกเขา แต่ไม่ต้องใช้ 'ผู้ใช้ที่รัก' เป็นต้น ไปที่การอ่านเลย`
            },
            zh: {
                systemPrompt: '您是中国四柱（八字）占星术专家，根据出生日期提供详细准确的解读。您的解读全面而简洁。',
                userPrompt: `请为出生于 ${dateString} ${timeContext} 的用户提供中国（八字）运势解读。
                将所有章节标题（如"四柱"、"关键洞察"、"结论"、"可分享摘要"）使用 Markdown 加粗格式（如 **标题**:）。使用项目符号表示列表。其余文本保持纯 Markdown 格式。
                包括：\n    1. 四柱（年、月、日、时）\n    
                2. 关于以下方面的关键洞察：\n       - 核心自我\n       - 有利和不利元素\n       - 运势周期与命运\n       - 当前运势柱（运势 Yun Shi）\n    
                3. 总结主要主题和潜在人生道路的结论，包括应该关注和改进的方面；\n    
                4. 突出个人关键优势和潜力的简短可分享摘要（2-3行）。使其个性化和积极，以"一个[形容词]的人..."开头\n    \n    
                
                注意：如果未提供具体时间，请使用中午（12:00）作为时柱的参考点。另外，让解读直接面向用户，就像您在直接与他们对话一样，但不需要"亲爱的用户"等，直接开始解读。`
            }
        };

        const { systemPrompt, userPrompt } = prompts[language as keyof typeof prompts] || prompts.en;
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