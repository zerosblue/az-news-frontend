import React from 'react';
import styled from 'styled-components';

const PrivacyPage = () => {
  return (
    <Container>
      <Title>개인정보처리방침</Title>
      <Content>
        <h3>1. 개인정보의 처리 목적</h3>
        <p>
          AZ News Azit는(은) 다음의 목적을 위하여 개인정보를 처리합니다. 
          처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않습니다.
        </p>
        <ul>
          <li>- 회원 가입 및 관리</li>
          <li>- 서비스 제공 및 알림 전송</li>
        </ul>
        <br />
        <h3>2. 수집하는 개인정보의 항목</h3>
        <p>이메일, 닉네임, 프로필 사진, 관심 키워드 등</p>
      </Content>
    </Container>
  );
};

export default PrivacyPage;

const Container = styled.div` max-width: 800px; margin: 0 auto; padding: 40px 20px; color: ${props => props.theme.text}; `;
const Title = styled.h2` font-size: 28px; margin-bottom: 30px; border-bottom: 2px solid ${props => props.theme.border}; padding-bottom: 15px; `;
const Content = styled.div` line-height: 1.6; color: ${props => props.theme.subText}; h3 { margin-bottom: 10px; color: ${props => props.theme.text}; } ul { padding-left: 20px; }`;