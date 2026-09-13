// 파일 위치: src/store/useAuthStore.js
// 기능 요약: 시크릿 게이트 로그인 세션(JWT) 보관. 토큰이 로컬스토리지에 남아있는 한 다시
// 로그인하지 않아도 되는 "자동 로그인"의 실체가 바로 이 persist 미들웨어다.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      login: (token) => set({ token }),
      logout: () => set({ token: null }),
    }),
    { name: 'galpi-auth' }
  )
);

export default useAuthStore;
