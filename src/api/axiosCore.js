import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

const api = axios.create({
  // vite.config.js에서 프록시를 설정했으므로 baseURL은 빈 칸('/')으로 둡니다.
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 시크릿 게이트 로그인으로 받은 세션 토큰을 모든 요청에 자동으로 붙인다.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 토큰이 만료/무효화되면 서버가 401을 준다 — 그 순간 세션을 지우고 로그인 페이지로 돌려보낸다.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
