import React from 'react';
import { FiPlus, FiLogIn } from 'react-icons/fi'; 
import logoImg from '../assets/logo.png'; 

// 🌟 내 프로젝트에 있는 useGame 훅을 불러옵니다. (경로는 프로젝트에 맞게 수정 필요!)
// 보통 '../context/GameContext' 나 '../App' 등에 있을 확률이 높습니다.
import { useGame } from '../context/GameContext'; 

function HomePage() {
  // 🌟 라우터가 아니라, 앱 자체의 상태 변경 함수(dispatch)를 가져옵니다.
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
            // 🌟 주소를 바꾸는 게 아니라, state의 view를 'create-room'으로 변경!
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'create-room' })}
            className="w-full bg-cyan-400 text-white font-bold py-4 px-6 rounded-full flex items-center justify-center gap-3 text-lg transition-all active:scale-95 shadow-lg"
          >
            <FiPlus className="w-6 h-6" />
            방 만들기
          </button>

          <button 
            // 🌟 state의 view를 'join-room'으로 변경!
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