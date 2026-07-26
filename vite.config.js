// 파일 위치: vite.config.js
// 버전: v1.0.2

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // ★ 올바른 패키지명 롤백 완료

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9691, // 로컬 개발 서버 포트를 9691로 강제 할당
    strictPort: true, // 9691 포트가 이미 사용 중일 경우 다른 포트로 넘어가지 않고 서버 실행 중단
    // 개발 서버 가동 인터페이스: 특정 포트로 유입되는 자원 파싱 경로를 분기 가로채기 합니다.
    proxy: {
      // /api로 시작하는 데이터 요청에 대한 백엔드 포트 포워딩 제어
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('[Vite Proxy Error] 데이터 API 서버 통신 실패 거부 오류:', err);
          });
        }
      },
      // /img로 시작하는 이미지 에셋 요청에 대한 외부 자원 가동용 백엔드 서버 포워딩 제어
      '/img': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('[Vite Proxy Error] 이미지 에셋 전송 서버 가로채기 실패 오류:', err);
          });
        }
      }
    }
  }
});