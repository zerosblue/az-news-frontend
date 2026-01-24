import React from 'react';
import styled from 'styled-components';

const TermsPage = () => {
  return (
    <Container>
      <Title>이용약관</Title>
      <Content>
        <h3>제 1 조 (목적)</h3>
        <p>
          본 약관은 AZ News Azit(이하 "회사")가 제공하는 모든 서비스의 이용조건 및 절차, 
          이용자와 회사의 권리, 의무, 책임사항을 규정함을 목적으로 합니다.
        </p>
        <br />
        <h3>제 2 조 (약관의 효력)</h3>
        <p>
          본 약관은 서비스를 이용하고자 하는 모든 회원에게 효력이 발생합니다.
          (나중에 실제 약관 내용으로 채워주세요!)
        </p>
      </Content>
    </Container>
  );
};

export default TermsPage;

const Container = styled.div` max-width: 800px; margin: 0 auto; padding: 40px 20px; color: ${props => props.theme.text}; `;
const Title = styled.h2` font-size: 28px; margin-bottom: 30px; border-bottom: 2px solid ${props => props.theme.border}; padding-bottom: 15px; `;
const Content = styled.div` line-height: 1.6; color: ${props => props.theme.subText}; h3 { margin-bottom: 10px; color: ${props => props.theme.text}; } `;