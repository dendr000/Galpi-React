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

// 실제 구현 완료된 페이지들
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import BulkStudioPage from './pages/BulkStudioPage';
import EditorPage from './pages/EditorPage'; 
import WorkDetailPage from './pages/WorkDetailPage'; // ★ 이번에 만들 위키 본체!

// ============================================================================
// [임시 껍데기 컴포넌트] (아직 JS 로직이 구현 안 된 것들만 남겨둠)
// ============================================================================
const MemoWorkspacePage = () => <div><h1>🌌 [무한 캔버스] 통합 메모 워크스페이스</h1></div>;
const NovelViewerPage = () => <div><h1>👁️ [소설 뷰어]</h1></div>;
const NotFoundPage = () => <div><h1>404 - 존재하지 않는 페이지입니다.</h1></div>;

function App() {
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  
  // Zustand 스토어 구독 (중복 선언 완전 제거)
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
        transition: 'max-width 0.3s ease'
      }}
    >
      <SettingModal isOpen={isSettingOpen} onClose={() => setIsSettingOpen(false)} />
      
      <button 
        onClick={() => setIsSettingOpen(true)}
        style={{
          position: 'fixed', bottom: '20px', right: '20px', zIndex: 9000, background: 'var(--surface-color)', border: '2px solid var(--primary-color)', fontSize: '24px', borderRadius: '50%', width: '50px', height: '50px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}
      >
        ⚙️
      </button>

      <BossBlindLayer />
      <Gnb />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/edit" element={<EditorPage />} />
        <Route path="/bulk" element={<BulkStudioPage />} />
        <Route path="/work/:workId" element={<WorkDetailPage />} />
        
        {/* 임시 라우트들 */}
        <Route path="/memo" element={<MemoWorkspacePage />} />
        <Route path="/viewer/:pageId" element={<NovelViewerPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;