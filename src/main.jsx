import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // 테일윈드나 기본 CSS 설정
import { BrowserRouter } from 'react-router-dom'; // 🌟 무대(라우터) 불러오기!

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 🌟 App 전체를 BrowserRouter 무대로 감싸줍니다! */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);