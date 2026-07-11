import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 💡 프록시(Proxy) 설정: 길 안내 표지판 역할
    proxy: {
      // 1. 데이터 API 통신용 우회 경로
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // 2. 백엔드에 저장된 이미지 표출용 우회 경로
      '/img': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})