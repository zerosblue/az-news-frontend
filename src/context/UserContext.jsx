import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios'; // 방금 만든 전화기 가져오기

// 1. 유저 정보를 담을 공간 생성
export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // 로그인한 유저 정보 (없으면 null)
  const [loading, setLoading] = useState(true); // 로딩 중인지 체크

  // 2. 앱 켜질 때마다 "나 로그인됐어?" 확인
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // 백엔드 /my-info 주소로 물어봄
        const response = await api.get('/my-info');
        setUser(response.data); // 정보 있으면 user에 저장
        console.log("로그인 확인됨:", response.data);
      } catch (error) {
        setUser(null); // 에러 나면 로그인 안 된 거임
        console.log("로그인 안 됨");
      } finally {
        setLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  // 3. 로그아웃 함수
  const logout = async () => {
    try {
      await api.post('/logout'); // 스프링 시큐리티 기본 로그아웃 주소
      setUser(null);
      window.location.href = '/'; // 홈으로 팅겨내기
    } catch (error) {
      console.error("로그아웃 실패", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, loading }}>
      {!loading && children} 
    </UserContext.Provider>
  );
};