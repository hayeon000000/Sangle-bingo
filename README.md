# 📸 Photo Bingo

출사 모임을 위한 실시간 사진 빙고 웹 앱

## 🚀 빠른 시작

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일에서 VITE_GEMINI_API_KEY 값을 설정하세요

# 3. 개발 서버 실행
npm run dev

# 4. 프로덕션 빌드
npm run build
```

## ⚙️ 환경 변수

`.env` 파일을 만들고 다음 값을 설정하세요:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Google Gemini API 키 발급: https://aistudio.google.com/apikey

## 🌐 Netlify 배포

1. GitHub에 프로젝트 push
2. Netlify에서 새 프로젝트 연결
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Environment variables에서 `VITE_GEMINI_API_KEY` 설정
6. 배포!

> `netlify.toml` 파일이 이미 설정되어 있어 자동으로 SPA 라우팅이 적용됩니다.

## 📱 기능 목록

### 방 생성 (마스터)
- 비밀번호, 제한 시간, 우승자 수 설정
- 25개 미션 주제 커스터마이징
- 실시간 참여자 현황 대시보드
- 게임 시작 / 강제 종료

### 참여자
- 방 코드 + 비밀번호로 입장
- 닉네임 + 이모지 프로필
- 5x5 빙고판 (참여자별 랜덤 배치)
- 카메라 촬영 (1:1 정사각형, 줌 지원)
- 워터마크 자동 삽입
- 페이지 새로고침 후에도 진행 상황 유지 (localStorage)

### 게임 종료
- 타이머 종료 / 목표 우승자 달성 시 자동 종료
- 최종 순위표 (우승자 트로피 아이콘)
- AI 성향 분석 (Gemini 1.5 Flash)

## 🤖 AI 분석 프롬프트 수정

`src/utils/gemini.js`의 `buildAnalysisPrompt()` 함수에서
프롬프트를 자유롭게 수정하세요.

## 🏗️ 프로젝트 구조

```
src/
├── App.jsx              # 라우터
├── main.jsx             # 엔트리
├── index.css            # 글로벌 스타일
├── contexts/
│   └── GameContext.jsx  # 전역 상태 관리 (useReducer + localStorage)
├── hooks/
│   ├── useCamera.js     # 카메라 API 훅
│   └── useTimer.js      # 타이머 훅
├── pages/
│   ├── HomePage.jsx
│   ├── CreateRoomPage.jsx
│   ├── JoinRoomPage.jsx
│   ├── MasterLobbyPage.jsx
│   ├── GamePage.jsx
│   └── ResultsPage.jsx
├── components/
│   ├── BingoBoard.jsx   # 5x5 빙고판
│   ├── CameraView.jsx   # 카메라 UI
│   ├── PhotoModal.jsx   # 사진 뷰어
│   └── GameEndModal.jsx # 종료 모달
└── utils/
    └── gemini.js        # Gemini API 연동
```

## ⚠️ 주의 사항

- 현재 버전은 단일 기기 또는 공유 기기 방식으로 동작합니다
- 실제 멀티플레이어(여러 기기에서 실시간 동기화)를 위해서는 Supabase 등의 백엔드 연동이 필요합니다
- 카메라 기능은 HTTPS 환경에서만 동작합니다 (Netlify 배포 시 자동 적용)
