import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8080', // 백엔드 주소
  withCredentials: true, // ★ 중요: 쿠키(세션)를 주고받으려면 이게 필수야!
});

export default instance;