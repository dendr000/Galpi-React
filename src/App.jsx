// 파일 위치: src/App.jsx
// 기능 요약: 애플리케이션 최상위 라우팅 및 에디터/스튜디오 모드 진입 시 전역 레이아웃 100% 확장 처리
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import { useBossKey } from './hooks/useBossKey';
import { useHorizontalScroll } from './hooks/useHorizontalScroll';
import useSettingStore from './store/useSettingStore';

import Gnb from './components/layout/Gnb';
import BossBlindLayer from './components/common/BossBlindLayer';
import SettingModal from './components/common/SettingModal';
import SafeDeleteModal from './components/common/SafeDeleteModal'; // 커스텀 보안 삭제 모달 임포트
import FabMenu from './components/layout/FabMenu';
import GlobalContextMenu from './components/layout/GlobalContextMenu';
import Footer from './components/layout/footer/Footer';

import Home from './pages/Home/HomePage';
import CategoryPage from './pages/Category/CategoryPage';
import BulkStudioPage from './pages/BulkStudio/BulkStudioPage';
import EditorPage from './pages/Editor/EditorPage'; 
import WorkDetailPage from './pages/WorkDetail/WorkDetailPage'; 

import PageMemoMain from './domains/memo/page/PageMemoMain';
import NovelViewerPage from './pages/NovelViewer/NovelViewerPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';

import { useLocation } from 'react-router-dom'; 

function App() {
  console.log("[App] 최상위 애플리케이션 컴포넌트 렌더링 시작");

  const location = useLocation();
  const isBulkMode = location.pathname.startsWith('/bulk');
  const isEditorMode = location.pathname.startsWith('/edit');
  const isMemoMode = location.pathname.startsWith('/memo');

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
        // ★ 에디터 모드(isEditorMode) 감지 시 1200px 제약을 해제하고 브라우저 100% 점유
        maxWidth: (isBulkMode || isEditorMode || isMemoMode) ? '100%' : (layoutWidth === 'full' ? '100%' : '1200px'),
        margin: '0 auto',
        minHeight: '100vh',
        paddingBottom: isBulkMode ? '0' : '48px',
        transition: 'max-width 0.3s ease',
        background: 'var(--bg-color)'
      }}
    >
      <SettingModal isOpen={isSettingOpen} onClose={() => setIsSettingOpen(false)} />
      <SafeDeleteModal /> {/* 전역 안전 삭제 모달 렌더링 인젝션 */}
      <BossBlindLayer />
      <GlobalContextMenu /> 
      
      {!isBulkMode && <FabMenu />}
      {!isBulkMode && !isEditorMode && !isMemoMode && <Gnb setIsSettingOpen={setIsSettingOpen} />}     
      {!isBulkMode && <Footer />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/edit" element={<EditorPage />} />
        <Route path="/bulk" element={<BulkStudioPage />} />
        <Route path="/work/:workId" element={<WorkDetailPage />} />
        <Route path="/viewer/:pageId" element={<NovelViewerPage />} />
        <Route path="/memo" element={<PageMemoMain />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;