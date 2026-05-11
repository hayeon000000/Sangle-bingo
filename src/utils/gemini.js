// ─── Gemini API Utility ───────────────────────────────────────────────────
// Model: gemini-1.5-flash (free tier)

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

// 🌟 주소 뒤에 아예 키를 단단히 고정시켜서 404 에러 원천 차단!
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Build the analysis prompt from board data.
 */
export function buildAnalysisPrompt(board, participantName) {
  const completedTopics = board
    .filter(cell => cell.completed)
    .map(cell => cell.topic);

  return `
당신은 사진 취미 분석 전문가입니다.
참여자 "${participantName}"의 사진 빙고 게임 결과를 분석해주세요.

완료한 미션 주제들:
${completedTopics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

총 ${completedTopics.length}개의 미션을 완료했습니다.

첨부된 사진들을 바탕으로 다음을 분석해주세요:
1. 📸 촬영 스타일 분석 (2-3문장)
2. 🎨 선호하는 구도/색감 패턴
3. ✨ 가장 인상적인 선택
4. 💡 사진 실력 향상을 위한 맞춤 조언

마지막에 이 사진가의 "포토그래퍼 유형"을 재미있게 한 줄로 표현해주세요. (예: "감성 낭만파 포토그래퍼" 등)
한국어로 답변해주세요. 친근하고 격려하는 톤으로 작성해주세요.
  `.trim();
}

/**
 * Analyze bingo photos using Gemini Vision API (결과 페이지용)
 */
export async function analyzePhotos(board, participantName, onProgress) {
  if (!GEMINI_API_KEY) {
    throw new Error('API 키가 설정되지 않았습니다.');
  }

  const completedCells = board.filter(cell => cell.completed && cell.photo);
  if (completedCells.length === 0) {
    throw new Error('분석할 사진이 없습니다.');
  }

  onProgress?.('사진을 분석 중...');

  const imageParts = completedCells.slice(0, 10).map(cell => {
    const base64Data = cell.photo.split(',')[1];
    const mimeType = cell.photo.split(';')[0].split(':')[1] || 'image/jpeg';
    return { inlineData: { mimeType, data: base64Data } };
  });

  const prompt = buildAnalysisPrompt(board, participantName);

  const requestBody = {
    contents: [{ parts: [{ text: prompt }, ...imageParts] }],
    generationConfig: { temperature: 0.8, maxOutputTokens: 1024 }
  };

  onProgress?.('AI가 분석 중...');

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) throw new Error('API 오류가 발생했습니다.');

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error('API에서 응답을 받지 못했습니다.');
  return text;
}

/**
 * 게임 종료 후 사진의 진위 여부를 엄격하게 판독합니다. (심사 버튼용)
 */
export async function verifyBoardPhotos(board, onProgress) {
  if (!GEMINI_API_KEY) throw new Error('API 키가 없습니다.');

  // 심사할 사진 필터링
  const cellsToVerify = board.filter(cell => cell.completed && cell.photo);
  if (cellsToVerify.length === 0) return [];

  onProgress?.('AI가 사진을 꼼꼼히 검사 중입니다 🕵️...');

  const imageParts = cellsToVerify.map(cell => {
    const base64Data = cell.photo.split(',')[1];
    const mimeType = cell.photo.split(';')[0].split(':')[1] || 'image/jpeg';
    return { inlineData: { mimeType, data: base64Data } };
  });

  const topicsMap = cellsToVerify.map((cell, idx) => 
    `[이미지 ${idx + 1}] 인덱스: ${cell.index}, 미션 주제: "${cell.topic}"`
  ).join('\n');

  const prompt = `
  너는 아주 엄격하고 단호한 사진 대회 심사위원이야.
  내가 ${cellsToVerify.length}장의 사진을 보냈어. 각 사진의 미션 주제는 아래와 같아:
  ${topicsMap}

  각 이미지가 할당된 미션 주제를 제대로 포함하고 있거나 잘 표현했는지 '매우 엄격하게' 판독해. 

  응답은 반드시 아래 형식의 순수 JSON 배열(Array)로만 해줘. 마크다운(\`\`\`json)이나 다른 설명은 절대 넣지 마.
  [
    {
      "index": (위에서 알려준 인덱스 번호),
      "passed": true 혹은 false,
      "reason": "통과 또는 탈락한 이유를 한국어로 짧게 (20자 이내)"
    }
  ]
  `.trim();

  const requestBody = {
    contents: [{ parts: [{ text: prompt }, ...imageParts] }],
    generationConfig: {
      temperature: 0.1, 
      responseMimeType: "application/json",
    }
  };

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) throw new Error('AI 심사 중 오류가 발생했습니다.');

  const data = await response.json();
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) return [];

  // 🌟 AI가 말썽부려서 마크다운 백틱(```)을 붙여 보낼 경우를 대비한 찌꺼기 청소
  text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(text); 
  } catch (e) {
    console.error("JSON 파싱 에러! AI의 원본 응답:", text);
    throw new Error('AI가 결과를 엉뚱하게 줬어요. 다시 시도해 주세요!');
  }
}