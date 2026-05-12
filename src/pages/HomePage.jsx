import React from 'react';
import { PlusIcon, DoorIcon } from 'react-icons/fi'; // 아이콘 라이브러리 사용

function HomePage() {
  // 사용자가 PC에 저장한 로고 이미지 경로 (예: src/assets/logo.png)
  const logoPath = 'src/assets/logo.png'; // 실제 경로로 수정해 주세요.

  return (
    <div className="h-screen w-screen bg-[#20232A] flex justify-center items-center p-6 rounded-[40px] border-4 border-cyan-400"
      style={{
        boxShadow: '0 0 20px 5px rgba(0, 255, 255, 0.6)', // 네온 테두리 빛 효과
      }}
    >
      <div className="flex-grow flex flex-col justify-center items-center space-y-12 w-full max-w-sm">
        
        {/* 1. 로고 섹션 */}
        <div className="flex flex-col items-center">
          <img 
            src={logoPath} 
            alt="Bingo S'ANGLE Logo" 
            className="w-48 h-auto" // 로고 크기 조정
          />
        </div>

        {/* 2. 버튼 섹션 */}
        <div className="w-full space-y-4">
          
          {/* 방 만들기 버튼 */}
          <button className="w-full bg-cyan-400 text-white font-semibold py-4 px-6 rounded-full flex items-center justify-center gap-3 text-lg transition duration-300 hover:bg-cyan-500 hover:shadow-lg">
            <PlusIcon className="w-6 h-6 text-white" />
            방 만들기
          </button>

          {/* 방 참여하기 버튼 */}
          <button className="w-full bg-[#313541] text-cyan-400 font-semibold py-4 px-6 rounded-full flex items-center justify-center gap-3 text-lg transition duration-300 hover:bg-[#3f4553] hover:shadow-lg">
            <DoorIcon className="w-6 h-6 text-cyan-400" />
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