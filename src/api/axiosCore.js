import axios from 'axios';

const api = axios.create({
  // vite.config.js에서 프록시를 설정했으므로 baseURL은 빈 칸('/')으로 둡니다.
  baseURL: '/', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;