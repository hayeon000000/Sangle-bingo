import React from 'react';
import { FiPlus, FiLogIn } from 'react-icons/fi'; 
import logoImg from '../assets/logo.png'; 

// 🌟 드디어 찾은 완벽한 경로! (contexts 에 s가 붙었습니다)
import { useGame } from '../contexts/GameContext'; 

function HomePage() {
  // 앱 전체를 조종하는 리모컨(dispatch) 가져오기
  const { dispatch } = useGame(); 

  return (
    <div className="h-screen w-screen bg-[#20232A] flex justify-center items-center p-6"
      style={{ boxShadow: 'inset 0 0 30px 5px rgba(0, 255, 255, 0.6)' }}
    >
      <div className="flex-grow flex flex-col justify-center items-center space-y-12 w-full max-w-sm">
        
        {/* 로고 */}
        <div className="flex flex-col items-center">
          <img src={logoImg} alt="Bingo S'ANGLE Logo" className="w-48 h-auto object-contain" />
        </div>

        {/* 버튼 */}
        <div className="w-full space-y-5">
          
          <button 
            // 🌟 방 만들기 화면으로 갈아끼우기!
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'create-room' })}
            className="w-full bg-cyan-400 text-white font-bold py-4 px-6 rounded-full flex items-center justify-center gap-3 text-lg transition-all active:scale-95 shadow-lg"
          >
            <FiPlus className="w-6 h-6" />
            방 만들기
          </button>

          <button 
            // 🌟 방 참여하기 화면으로 갈아끼우기!
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'join-room' })}
            className="w-full bg-[#313541] text-cyan-400 font-bold py-4 px-6 rounded-full flex items-center justify-center gap-3 text-lg transition-all active:scale-95 shadow-lg border border-cyan-900"
          >
            <FiLogIn className="w-6 h-6" />
            방 참여하기
          </button>
        
        </div>

        {/* 바닥글 */}
        <div className="absolute bottom-10">
          <p className="text-gray-500 text-sm tracking-widest">@sswu_s_angle</p>
        </div>

      </div>
    </div>
  );
}

export default HomePage;