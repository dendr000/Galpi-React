// 파일 위치: src/App.jsx
// 연결 파일: src/main.jsx 최상단 렌더러에서 호출되며, 전역 라우팅 및 레이아웃을 관장함
// 기능 요약: 애플리케이션의 최상위 컴포넌트로 라우터 설정, 전역 상태(글꼴, 테마) CSS 변수 주입, 공통 레이아웃 컴포넌트 배치를 담당합니다.
// 버전: v2.0.0

import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

// 전역 커스텀 훅 및 상태 스토어 임포트
import { useBossKey } from './hooks/useBossKey';
import { useHorizontalScroll } from './hooks/useHorizontalScroll';
import useSettingStore from './store/useSettingStore';

// 공통 UI 컴포넌트 레이아웃 그룹 임포트
import Gnb from './components/layout/Gnb';
import BossBlindLayer from './components/common/BossBlindLayer';
import SettingModal from './components/common/SettingModal';
import FabMenu from './components/layout/FabMenu';
import GlobalContextMenu from './components/layout/GlobalContextMenu'; // 전역 우클릭 메뉴 통제기

// ★ 도메인 주도형 아키텍처에 맞춘 개별 페이지 컴포넌트 라우트 임포트
import Home from './pages/Home/HomePage';
import CategoryPage from './pages/Category/CategoryPage';
import BulkStudioPage from './pages/BulkStudio/BulkStudioPage';
import EditorPage from './pages/Editor/EditorPage'; 
import WorkDetailPage from './pages/WorkDetail/WorkDetailPage'; 

// ★ 인라인 더미 뷰어들을 제거하고 실제 물리 파일 경로와 바인딩
import MemoWorkspacePage from './pages/MemoWorkspace/MemoWorkspacePage';
import NovelViewerPage from './pages/NovelViewer/NovelViewerPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';

function App() {
  // 앱 구동 시 최상단 렌더링 라이프사이클 콘솔 출력
  console.log("[App] 최상위 애플리케이션 컴포넌트 렌더링 시작");

  // 설정 모달 활성화 여부를 관장하는 로컬 상태
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  
  // Zustand 스토어에서 폰트 사이즈, 레이아웃 너비, 폰트 패밀리 전역 설정값 추출
  const { fontSize, layoutWidth, fontFamily } = useSettingStore();
  
  // 몰컴용 보스키 및 가로 스크롤 치환 전역 이벤트 훅 마운트
  useBossKey();
  useHorizontalScroll();

  return (
    <div 
      className="galpi-app"
      style={{ 
        // 전역 CSS 변수로 사용자 커스텀 환경설정 수치를 실시간으로 앱 전체에 주입
        '--markdown-font-size': `${fontSize}px`, 
        '--markdown-font-family': fontFamily === 'serif' ? "'Noto Serif KR', serif" : (fontFamily === 'monospace' ? "monospace" : "inherit"),
        maxWidth: layoutWidth === 'full' ? '100%' : '1200px',
        margin: '0 auto',
        minHeight: '100vh',
        transition: 'max-width 0.3s ease',
        background: 'var(--bg-color)'
      }}
    >
      {/* 1. 최상단 오버레이 및 모달 레이어 렌더링 구역 */}
      <SettingModal isOpen={isSettingOpen} onClose={() => { console.log("[App] 설정 모달 닫기 이벤트 발생"); setIsSettingOpen(false); }} />
      <BossBlindLayer />
      <FabMenu />
      
      {/* 2. 전역 이벤트 핸들러 부착 구역 */}
      <GlobalContextMenu /> 
      
      {/* 3. 상단 공통 네비게이션 바 (설정 오픈 함수 프랍스 전달) */}
      <Gnb setIsSettingOpen={setIsSettingOpen} />     
      
      {/* 4. 리액트 라우터 돔 URL 경로 매핑 구역 */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/edit" element={<EditorPage />} />
        <Route path="/bulk" element={<BulkStudioPage />} />
        <Route path="/work/:workId" element={<WorkDetailPage />} />
        
        {/* 새롭게 연동된 페이지 라우트 패스 */}
        <Route path="/viewer/:pageId" element={<NovelViewerPage />} />
        <Route path="/memo" element={<MemoWorkspacePage />} />
        
        {/* 모든 경로 지정에 실패했을 경우 404 폴백 페이지 렌더링 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;