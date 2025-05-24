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

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction:
          `당신은 연애운과 인간관계를 잘 보는 고양이 점성가입니다. 
이모티콘과 함께 가볍고 따뜻한 말투로 궁합을 알려주세요. 
결과는 2줄 이내로 간결하게 전달하고 마지막 줄에 궁합 점수를 덧붙이세요.`,
      },
    });

    res.status(200).json({ answer: result.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Gemini API 오류 발생",
    });
  }
}