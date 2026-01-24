import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './styles/theme';
import GlobalStyle from './styles/GlobalStyle';
import { UserProvider } from './context/UserContext';

import Layout from "./components/Layout";
import NewsPage from "./pages/NewsPage";
import BoardPage from "./pages/BoardPage";
import FeedPage from "./pages/FeedPage";
import MyPage from "./pages/MyPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import BoardWritePage from "./pages/BoardWritePage";
import BoardDetailPage from "./pages/BoardDetailPage";
import BoardEditPage from "./pages/BoardEditPage";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <UserProvider>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <GlobalStyle />
        <BrowserRouter>
          <Routes>
            {/* 1. 헤더+사이드바가 보이는 메인 화면들 */}
            <Route element={<Layout isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}>
               <Route path="/" element={<NewsPage />} />
               
               {/* 게시판 관련 라우트들 */}
               <Route path="/board" element={<BoardPage />} />
               <Route path="/board/write" element={<BoardWritePage />} /> 
               <Route path="/board/:id" element={<BoardDetailPage />} />
               <Route path="/board/edit/:id" element={<BoardEditPage />} />

               <Route path="/feed" element={<FeedPage />} />
               <Route path="/mypage" element={<MyPage />} />
            </Route>

            {/* 2. 헤더 없이 꽉 찬 화면들 (로그인, 회원가입) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </UserProvider>
  );
}

export default App;