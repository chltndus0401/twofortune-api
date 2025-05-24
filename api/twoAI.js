import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name1, birth1, name2, birth2 } = req.body;

  if (!name1 || !birth1 || !name2 || !birth2) {
    return res.status(400).json({
      error: "두 사람의 이름(name1, name2)과 생년월일(birth1, birth2)이 모두 필요합니다",
    });
  }

  try {
    const today = new Date().toISOString().slice(0, 10);
    const prompt = `
이름1: ${name1}
생년월일1: ${birth1}
이름2: ${name2}
생년월일2: ${birth2}
오늘 날짜: ${today}

이 두 사람의 궁합을 사주와 성격 위주로 100자 내외로 풀이해줘.  
연인, 친구, 동료로서 얼마나 잘 맞는지 알려줘.  
상세한 설명은 하지 말고 간단히 요약해줘.  
마지막 줄에는 "💘 궁합 점수: OO점 / 100점" 형태로 점수도 포함시켜줘.
`;

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }); // 최신으로
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    return res.status(200).json({ answer: text });
  } catch (err) {
    console.error("Gemini API 오류:", err);
    return res.status(500).json({ error: "Gemini API 오류 발생" });
  }
}
