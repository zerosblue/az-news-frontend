import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  /* 1. 기본 브라우저 스타일 초기화 (여백 없애기) */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* 2. 전체 배경색 및 글자색 설정 (테마에 따라 자동 변경) */
  body {
    background-color: ${props => props.theme.bg};
    color: ${props => props.theme.text};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    transition: background-color 0.2s, color 0.2s; /* 부드럽게 색상 변경 */
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  ul, li {
    list-style: none;
  }
`;

export default GlobalStyle;