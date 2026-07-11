import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

// 훅 및 상태 스토어
import { useBossKey } from './hooks/useBossKey';
import { useHorizontalScroll } from './hooks/useHorizontalScroll';
import useSettingStore from './store/useSettingStore';

// 공통 컴포넌트
import Gnb from './components/layout/Gnb';
import BossBlindLayer from './components/common/BossBlindLayer';
import SettingModal from './components/common/SettingModal';
import FabMenu from './components/layout/FabMenu';

// 실제 구현 완료된 페이지들
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import BulkStudioPage from './pages/BulkStudioPage';
import EditorPage from './pages/EditorPage'; 
import WorkDetailPage from './pages/WorkDetailPage'; 

// ============================================================================
// [임시 껍데기 컴포넌트] (아직 JS 로직이 구현 안 된 것들만 남겨둠)
// ============================================================================
const MemoWorkspacePage = () => <div style={{padding:'50px', textAlign:'center'}}><h1>🌌 [무한 캔버스] 통합 메모 워크스페이스</h1></div>;
const NovelViewerPage = () => <div style={{padding:'50px', textAlign:'center'}}><h1>👁️ [소설 뷰어]</h1></div>;
const NotFoundPage = () => <div style={{padding:'50px', textAlign:'center', color:'#e53e3e'}}><h1>404 - 존재하지 않는 페이지입니다.</h1></div>;

function App() {
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  
  // Zustand 스토어 구독
  const { fontSize, layoutWidth, fontFamily } = useSettingStore();
  
  useBossKey();
  useHorizontalScroll();

  return (
    <div 
      className="galpi-app"
      style={{ 
        '--markdown-font-size': `${fontSize}px`, 
        '--markdown-font-family': fontFamily === 'serif' ? "'Noto Serif KR', serif" : (fontFamily === 'monospace' ? "monospace" : "inherit"),
        maxWidth: layoutWidth === 'full' ? '100%' : '1200px',
        margin: '0 auto',
        minHeight: '100vh',
        transition: 'max-width 0.3s ease',
        background: 'var(--bg-color)'
      }}
    >
      <SettingModal isOpen={isSettingOpen} onClose={() => setIsSettingOpen(false)} />
      <BossBlindLayer />
      <FabMenu />
      
      {/* ★ Gnb에 설정창 열기 함수 전달 */}
      <Gnb setIsSettingOpen={setIsSettingOpen} />     
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/edit" element={<EditorPage />} />
        <Route path="/bulk" element={<BulkStudioPage />} />
        <Route path="/work/:workId" element={<WorkDetailPage />} />
        
        {/* 아직 미구현인 라우트들 */}
        <Route path="/viewer/:pageId" element={<NovelViewerPage />} />
        <Route path="/memo" element={<MemoWorkspacePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;