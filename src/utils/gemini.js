// ─── Gemini API Utility ───────────────────────────────────────────────────
// Model: gemini-1.5-flash (free tier)
// Customize the prompt in analyzePhotos() as needed

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-1.5-flash'
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

/**
 * Build the analysis prompt from board data.
 * TODO: Customize this prompt to fit your needs!
 */
function buildAnalysisPrompt(board, participantName) {
  const completedTopics = board
    .filter(cell => cell.completed)
    .map(cell => cell.topic)

  // ── 프롬프트를 여기서 수정하세요 ──────────────────────────────────────────
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
  `.trim()
  // ─────────────────────────────────────────────────────────────────────────
}

/**
 * Analyze bingo photos using Gemini Vision API
 * @param {Array} board - The player's bingo board
 * @param {string} participantName - Player's nickname
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<string>} Analysis text
 */
export async function analyzePhotos(board, participantName, onProgress) {
  if (!GEMINI_API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.')
  }

  const completedCells = board.filter(cell => cell.completed && cell.photo)

  if (completedCells.length === 0) {
    throw new Error('분석할 사진이 없습니다.')
  }

  onProgress?.('사진을 분석 중...')

  // Build multimodal content with images
  const imageParts = completedCells.slice(0, 10).map(cell => {
    // Extract base64 data from data URL
    const base64Data = cell.photo.split(',')[1]
    const mimeType = cell.photo.split(';')[0].split(':')[1] || 'image/jpeg'

    return {
      inlineData: {
        mimeType,
        data: base64Data,
      }
    }
  })

  const prompt = buildAnalysisPrompt(board, participantName)

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          ...imageParts,
        ]
      }
    ],
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
    ]
  }

  onProgress?.('AI가 분석 중...')

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `API 오류: ${response.status}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    throw new Error('API에서 응답을 받지 못했습니다.')
  }

  return text
}
