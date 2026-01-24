import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios'; // 우리가 만든 전화기

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '', password: '', nickname: '', interests: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // 백엔드로 회원가입 요청 쏘기
      await axios.post('/api/auth/signup', formData);
      alert("가입 성공! 이제 로그인해주세요.");
      navigate('/login'); // 로그인 페이지로 이동
    } catch (error) {
      alert("가입 실패: " + (error.response?.data || "오류 발생"));
    }
  };

  return (
    <Container>
      <Title>회원가입</Title>
      <Form onSubmit={handleSignup}>
        <Input name="email" type="email" placeholder="이메일 (아이디)" onChange={handleChange} required />
        <Input name="password" type="password" placeholder="비밀번호" onChange={handleChange} required />
        <Input name="nickname" type="text" placeholder="닉네임 (활동명)" onChange={handleChange} required />
        <Input name="interests" type="text" placeholder="관심사 (예: 주식, 골프)" onChange={handleChange} />
        <SubmitButton type="submit">가입완료</SubmitButton>
      </Form>
      <BackButton onClick={() => navigate('/login')}>&larr; 로그인으로 돌아가기</BackButton>
    </Container>
  );
};

export default SignupPage;

// --- 스타일 (로그인 페이지랑 비슷함) ---
const Container = styled.div`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100vh; background-color: #121212; color: white;
`;
const Title = styled.h2` font-size: 24px; color: #ffc107; margin-bottom: 30px; `;
const Form = styled.form` display: flex; flex-direction: column; width: 300px; gap: 10px; `;
const Input = styled.input`
  padding: 12px; border-radius: 8px; border: 1px solid #333; background: #1e1e1e; color: white;
  &:focus { outline: none; border-color: #ffc107; }
`;
const SubmitButton = styled.button`
  padding: 12px; border-radius: 8px; border: none; background: #ffc107; font-weight: bold; cursor: pointer; margin-top: 10px;
`;
const BackButton = styled.button`
  margin-top: 20px; background: none; border: none; color: #888; cursor: pointer;
  &:hover { color: white; }
`;