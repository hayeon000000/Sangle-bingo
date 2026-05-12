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

/**
 * AI 심사: 각 칸의 사진이 해당 미션에 맞는지 검증
 * @param {Array} board - 빙고 보드
 * @param {Function} onProgress - 진행 상황 콜백
 * @returns {Promise<Array>} [{index, passed, reason}]
 */
export async function verifyBoardPhotos(board, onProgress) {
  if (!GEMINI_API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY가 설정되지 않았습니다.')
  }

  const completedCells = board.filter(cell => cell.completed && cell.photo)
  if (completedCells.length === 0) return []

  onProgress?.('사진 분석 중...')

  // Build prompt for batch verification
  const cellDescriptions = completedCells
    .map((c, i) => `사진 ${i + 1}: 미션 주제 = "${c.topic}"`)
    .join('\n')

  const imageParts = completedCells.slice(0, 10).map(cell => {
    const base64Data = cell.photo.split(',')[1]
    const mimeType = cell.photo.split(';')[0].split(':')[1] || 'image/jpeg'
    return { inlineData: { mimeType, data: base64Data } }
  })

  const prompt = `
당신은 사진 빙고 게임의 심사위원입니다.
아래 각 사진이 해당 미션 주제에 맞는 사진인지 판단해주세요.

${cellDescriptions}

각 사진을 순서대로 심사하여 반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요:
[
  {"index": 0, "passed": true, "reason": "합격 이유 (5자 이내)"},
  {"index": 1, "passed": false, "reason": "탈락 이유 (5자 이내)"}
]

판단 기준:
- 주제와 관련 없는 아무 사진이나 찍었으면 false
- 대충이라도 주제와 연관성이 있으면 true
- 완전히 엉뚱한 사진 (빈 벽, 바닥만 찍은 것 등)은 false
  `.trim()

  const requestBody = {
    contents: [{ parts: [{ text: prompt }, ...imageParts] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
  }

  onProgress?.('AI 심사 중...')

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `API 오류: ${response.status}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]'

  try {
    const clean = text.replace(/```json|```/g, '').trim()
    const results = JSON.parse(clean)
    // Map back to original board indices
    return results.map((r, i) => ({
      index: completedCells[r.index ?? i]?.index ?? i,
      passed: r.passed,
      reason: r.reason,
    }))
  } catch {
    // If parsing fails, pass everyone
    return completedCells.map(c => ({ index: c.index, passed: true, reason: '확인됨' }))
  }
}
