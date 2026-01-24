import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './styles/theme';
import GlobalStyle from './styles/GlobalStyle';
import { UserProvider } from './context/UserContext';
import { HelmetProvider } from 'react-helmet-async';

import Layout from "./components/Layout";
import NewsPage from "./pages/NewsPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import BoardPage from "./pages/BoardPage";
import BoardWritePage from "./pages/BoardWritePage";
import BoardDetailPage from "./pages/BoardDetailPage";
import BoardEditPage from "./pages/BoardEditPage";
import FeedPage from "./pages/FeedPage";
import MyPage from "./pages/MyPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

// ★ 법적 페이지 추가
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <UserProvider>
      <HelmetProvider>
        <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
          <GlobalStyle />
          <BrowserRouter>
            <Routes>
              {/* 헤더+사이드바가 보이는 메인 레이아웃 그룹 */}
              <Route element={<Layout isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}>
                <Route path="/" element={<NewsPage />} />
                <Route path="/news/:id" element={<NewsDetailPage />} />
                <Route path="/board" element={<BoardPage />} />
                <Route path="/board/write" element={<BoardWritePage />} />
                <Route path="/board/:id" element={<BoardDetailPage />} />
                <Route path="/board/edit/:id" element={<BoardEditPage />} />
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/mypage" element={<MyPage />} />
                
                {/* ★ 여기 주소가 있어야 클릭했을 때 화면이 나와! */}
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
              </Route>

              {/* 레이아웃 없는 페이지 */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </HelmetProvider>
    </UserProvider>
  );
}

export default App;