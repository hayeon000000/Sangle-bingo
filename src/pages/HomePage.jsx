import React from 'react';
import { FiPlus, FiLogIn } from 'react-icons/fi'; 
import logoImg from '../assets/logo.png'; 
import { useGame } from '../contexts/GameContext'; // 경로 확인 완료!

function HomePage() {
  // 🌟 하연 님의 프로젝트 전용: setView 함수를 가져옵니다.
  const { setView } = useGame(); 

  return (
    <div className="h-screen w-screen bg-[#20232A] flex justify-center items-center p-6"
      /* 🌟 1. 안쪽으로 퍼지는 네온 효과 (inset) */
      style={{ boxShadow: 'inset 0 0 30px 5px rgba(0, 255, 255, 0.6)' }}
    >
      <div className="flex-grow flex flex-col justify-center items-center space-y-12 w-full max-w-sm">
        
        {/* 🌟 2. 로고 섹션 (크기: w-48 부분을 w-32~w-64 사이로 조절하세요) */}
        <div className="flex flex-col items-center">
          <img 
            src={logoImg} 
            alt="Bingo S'ANGLE Logo" 
            className="w-24 h-auto object-contain" 
          />
        </div>

        {/* 🌟 3. 버튼 섹션 */}
        <div className="w-full space-y-5">
          
          {/* 방 만들기 버튼 */}
          <button 
            // 🌟 하연 님의 Router 코드에 적힌 'create-room' 뷰로 변경!
            onClick={() => setView('create-room')} 
            /* 버튼 크기 조절: py-4(높이), text-lg(글자크기) 조절 가능 */
            className="w-64 bg-cyan-400 text-white font-bold py-2 px-4 rounded-full flex items-center justify-center gap-3 text-5 transition-all active:scale-95 shadow-lg"
          >
            <FiPlus className="w-6 h-6" />
            방 만들기
          </button>

          {/* 방 참여하기 버튼 */}
          <button 
            // 🌟 하연 님의 Router 코드에 적힌 'join-room' 뷰로 변경!
            onClick={() => setView('join-room')} 
            className="w-64 bg-[#313541] text-cyan-400 font-bold py-2 px-4 rounded-full flex items-center justify-center gap-3 text-5 transition-all active:scale-95 shadow-lg border border-cyan-900"
          >
            <FiLogIn className="w-6 h-6" />
            방 참여하기
          </button>
        
        </div>

        {/* 4. 바닥글 */}
        <div className="absolute bottom-10">
          <p className="text-gray-500 text-sm tracking-widest">@sswu_s_angle</p>
        </div>

      </div>
    </div>
  );
}

export default HomePage;