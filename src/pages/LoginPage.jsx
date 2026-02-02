import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate 추가
import axios from '../api/axios'; // axios 추가

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = () => {
      window.location.href = 'http://3.106.202.217.nip.io:8080/oauth2/authorization/google';
    };

  // ★ 진짜 로그인 함수
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("이메일과 비밀번호를 입력해주세요.");

    try {
      // 백엔드로 로그인 요청
      await axios.post('/api/auth/login', { email, password });
      
      // 성공하면 홈으로 이동 (UserContext가 자동으로 새로고침 될 때 로그인 정보 가져옴)
      // 확실하게 하기 위해 새로고침 한 번 해주거나, context update를 해야 함.
      // 여기서는 가장 간단하게 홈으로 이동 후 새로고침 효과를 줌.
      window.location.href = "/"; 
      
    } catch (err) {
      console.error(err);
      alert("로그인 실패! 아이디나 비밀번호를 확인해주세요.");
    }
  };

  return (
    <Container>
      <Title>AZ News Azit<br/>입장하기</Title>
      
      <GoogleButton onClick={handleGoogleLogin}>
        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" width="20" />
        구글 계정으로 1초 만에 시작하기
      </GoogleButton>

      <Divider>또는 이메일로 로그인</Divider>

      <Form onSubmit={handleLogin}>
        <Input 
          type="email" placeholder="이메일 주소" value={email} onChange={(e) => setEmail(e.target.value)} 
        />
        <Input 
          type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} 
        />
        <LoginButton type="submit">로그인</LoginButton>
      </Form>

      <SignupLink to="/signup">
        아직 회원이 아니신가요? <span>회원가입</span>
      </SignupLink>
    </Container>
  );
};

export default LoginPage;

// --- 스타일 (기존과 동일) ---
const Container = styled.div` display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; height: 100vh; background-color: #121212; color: white; `;
const Title = styled.h2` text-align: center; margin-bottom: 40px; font-size: 28px; color: #ffc107; line-height: 1.4; `;
const GoogleButton = styled.button` width: 100%; max-width: 300px; padding: 12px; border-radius: 8px; border: none; background-color: white; color: #333; font-weight: bold; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; margin-bottom: 20px; &:hover { background-color: #f1f1f1; } `;
const Divider = styled.div` font-size: 12px; color: #666; margin-bottom: 20px; `;
const Form = styled.form` display: flex; flex-direction: column; width: 100%; max-width: 300px; gap: 10px; `;
const Input = styled.input` padding: 12px; border-radius: 8px; border: 1px solid #333; background-color: #1e1e1e; color: white; font-size: 14px; &:focus { outline: none; border-color: #ffc107; } `;
const LoginButton = styled.button` padding: 12px; border-radius: 8px; border: none; background-color: #ffc107; color: #121212; font-weight: bold; cursor: pointer; margin-top: 10px; &:hover { background-color: #e0a800; } `;
const SignupLink = styled(Link)` margin-top: 20px; font-size: 14px; color: #888; text-decoration: none; span { color: #ffc107; font-weight: bold; margin-left: 5px; } &:hover span { text-decoration: underline; } `;