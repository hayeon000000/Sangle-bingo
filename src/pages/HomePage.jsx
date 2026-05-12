import React from 'react';
import { FiPlus, FiLogIn } from 'react-icons/fi'; 
import { useNavigate } from 'react-router-dom'; // 🌟 1. 페이지 이동을 위한 마법의 지팡이 불러오기!
import logoImg from '../assets/logo.png'; 

function HomePage() {
  const navigate = useNavigate(); // 🌟 2. 지팡이(navigate) 장착!

  return (
    <div className="h-screen w-screen bg-[#20232A] flex justify-center items-center p-6 rounded-[40px] border-4 border-cyan-400"
      style={{
        boxShadow: '0 0 20px 5px rgba(0, 255, 255, 0.6)', 
      }}
    >
      <div className="flex-grow flex flex-col justify-center items-center space-y-12 w-full max-w-sm">
        
        {/* 1. 로고 섹션 */}
        <div className="flex flex-col items-center">
          <img 
            src={logoImg} 
            alt="Bingo S'ANGLE Logo" 
            className="w-48 h-auto" 
          />
        </div>

        {/* 2. 버튼 섹션 */}
        <div className="w-full space-y-4">
          
          {/* 🌟 3. 방 만들기 버튼: 클릭하면 '/create' 주소로 이동! */}
          <button 
            onClick={() => navigate('/create')} 
            className="w-full bg-cyan-400 text-white font-semibold py-4 px-6 rounded-full flex items-center justify-center gap-3 text-lg transition duration-300 hover:bg-cyan-500 hover:shadow-lg"
          >
            <FiPlus className="w-6 h-6 text-white" />
            방 만들기
          </button>

          {/* 🌟 4. 방 참여하기 버튼: 클릭하면 '/join' 주소로 이동! */}
          <button 
            onClick={() => navigate('/join')} 
            className="w-full bg-[#313541] text-cyan-400 font-semibold py-4 px-6 rounded-full flex items-center justify-center gap-3 text-lg transition duration-300 hover:bg-[#3f4553] hover:shadow-lg"
          >
            <FiLogIn className="w-6 h-6 text-cyan-400" />
            방 참여하기
          </button>
        
        </div>

        {/* 3. 바닥글 섹션 */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center">
          <p className="text-gray-500 text-sm">@sswu_s_angle</p>
        </div>

      </div>
    </div>
  );
}

export default HomePage;