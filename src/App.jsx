import React, { useState, useEffect } from 'react';
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

import { useLocation } from 'react-router-dom'; // ★ 현재 경로 추적을 위한 훅 임포트 추가

function App() {
  console.log("[App] 최상위 애플리케이션 컴포넌트 렌더링 시작");

  const location = useLocation();
  const isBulkMode = location.pathname.startsWith('/bulk'); // ★ 일괄 수정 스튜디오 경로 진입 여부 판별

  // 브라우저 네이티브 트랙패드 스와이프 뒤로가기/앞으로가기 액션 강력 차단 (html 태그까지 확장)
  useEffect(() => {
    console.log("[App] 오버스크롤 스와이프 네비게이션 방지 CSS 전역 주입 가동");
    document.documentElement.style.overscrollBehaviorX = 'none';
    document.body.style.overscrollBehaviorX = 'none';
    return () => {
      document.documentElement.style.overscrollBehaviorX = 'auto';
      document.body.style.overscrollBehaviorX = 'auto';
    };
  }, []);

  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const { fontSize, layoutWidth, fontFamily } = useSettingStore();
  
  useBossKey();
  useHorizontalScroll();

  return (
    <div 
      className="galpi-app"
      style={{ 
        '--markdown-font-size': `${fontSize}px`, 
        '--markdown-font-family': fontFamily === 'serif' ? "'Noto Serif KR', serif" : (fontFamily === 'monospace' ? "monospace" : "inherit"),
        // ★ 스튜디오 모드일 경우 글로벌 레이아웃 컨테이너의 제약을 해제하고 100% 점유
        maxWidth: isBulkMode ? '100%' : (layoutWidth === 'full' ? '100%' : '1200px'),
        margin: '0 auto',
        minHeight: '100vh',
        transition: 'max-width 0.3s ease',
        background: 'var(--bg-color)'
      }}
    >
      <SettingModal isOpen={isSettingOpen} onClose={() => setIsSettingOpen(false)} />
      <BossBlindLayer />
      <GlobalContextMenu /> 
      
      {/* ★ 스튜디오 모드가 아닐 때만 GNB와 FAB 버튼 렌더링 (레이아웃 격리) */}
      {!isBulkMode && <FabMenu />}
      {!isBulkMode && <Gnb setIsSettingOpen={setIsSettingOpen} />}     
      
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