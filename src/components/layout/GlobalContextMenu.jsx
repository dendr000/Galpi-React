import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GlobalContextMenu = () => {
  const [menu, setMenu] = useState({ isOpen: false, x: 0, y: 0, selectedText: '' });
  const [isSavePrevented, setIsSavePrevented] = useState(() => localStorage.getItem('galpi-prevent-save') !== 'false');
  const navigate = useNavigate();
  const location = useLocation();

  // Shift + 우클릭 글로벌 이벤트 낚아채기
  const handleContextMenu = useCallback((e) => {
    if (e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      
      const selection = window.getSelection().toString().trim();
      let posX = e.clientX;
      let posY = e.clientY;

      // 팝업이 화면 밖으로 나가는 것 방지
      const menuWidth = 220; 
      const menuHeight = 300;
      if (posX + menuWidth > window.innerWidth) posX = window.innerWidth - menuWidth - 10;
      if (posY + menuHeight > window.innerHeight) posY = window.innerHeight - menuHeight - 10;

      setMenu({ isOpen: true, x: posX, y: posY, selectedText: selection });
    }
  }, []);

  const handleClickOutside = useCallback(() => {
    if (menu.isOpen) setMenu(prev => ({ ...prev, isOpen: false }));
  }, [menu.isOpen]);

  useEffect(() => {
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleContextMenu, handleClickOutside]);

  // Ctrl + S (저장) 브라우저 기본 팝업 강제 무시 이벤트
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        if (isSavePrevented) {
          e.preventDefault();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSavePrevented]);

  const toggleSavePrevention = () => {
    const nextState = !isSavePrevented;
    setIsSavePrevented(nextState);
    localStorage.setItem('galpi-prevent-save', String(nextState));
    setMenu(prev => ({ ...prev, isOpen: false }));
  };

  const addSelectionToMemo = () => {
    const text = menu.selectedText;
    if (!text) return;
    
    let currentMemoData = [];
    try { currentMemoData = JSON.parse(localStorage.getItem('galpi-memos') || '[]'); } catch(e){}
    
    const newMemoId = Date.now();
    const shortTitle = text.length > 12 ? text.substring(0, 12) + "..." : text;
    currentMemoData.unshift({ 
      id: newMemoId, 
      folder: "설정 아이디어", 
      title: '📌 ' + shortTitle, 
      content: text, 
      updatedAt: newMemoId, 
      sortOrder: -1 
    });
    
    localStorage.setItem('galpi-memos', JSON.stringify(currentMemoData));
    try { window.getSelection().removeAllRanges(); } catch(e){}
    setMenu(prev => ({ ...prev, isOpen: false }));
    alert("📝 '설정 아이디어' 탭에 메모가 저장되었습니다!");
  };

  if (!menu.isOpen) return null;

  const isCategoryPage = location.pathname.includes('/category');

  return (
    <div style={{
      position: 'fixed', top: menu.y, left: menu.x, background: 'var(--surface-color)', border: '1px solid var(--border-color)', 
      boxShadow: '0 4px 15px rgba(0,0,0,0.15)', borderRadius: '8px', padding: '6px 0', zIndex: 999999, minWidth: '200px', display: 'flex', flexDirection: 'column'
    }}>
      <div className="context-item" onClick={() => { window.history.back(); setMenu(prev => ({...prev, isOpen: false})); }}>⬅️ 뒤로 가기</div>
      <div className="context-item" onClick={() => { window.history.forward(); setMenu(prev => ({...prev, isOpen: false})); }}>➡️ 앞으로 가기</div>
      <div className="context-item" onClick={() => { window.location.reload(); setMenu(prev => ({...prev, isOpen: false})); }}>🔄 페이지 새로고침</div>
      
      <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }}></div>
      
      <div className="context-item" onClick={() => { window.scrollTo({top:0, behavior:'smooth'}); setMenu(prev => ({...prev, isOpen: false})); }}>🔼 화면 최상단으로</div>
      <div className="context-item" onClick={() => { window.scrollTo({top:document.body.scrollHeight, behavior:'smooth'}); setMenu(prev => ({...prev, isOpen: false})); }}>🔽 화면 최하단으로</div>

      {menu.selectedText && (
        <>
          <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }}></div>
          <div className="context-item" onClick={addSelectionToMemo} style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>📝 선택 문구 새 메모로</div>
        </>
      )}

      <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }}></div>

      <div className="context-item" onClick={toggleSavePrevention}>
        {isSavePrevented ? '⛔ Ctrl+S 무시 켜짐 (끄기)' : '⚠️ Ctrl+S 무시 꺼짐 (켜기)'}
      </div>

      {/* 카테고리 화면에서만 나타나는 특수 메뉴 */}
      {isCategoryPage && (
        <>
          <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }}></div>
          <div className="context-item" style={{ color: '#e53e3e', background: 'rgba(229,62,62,0.05)', fontWeight: 900 }} onClick={() => {
            const hiddenCats = JSON.parse(localStorage.getItem('galpi-hidden-categories') || '[]');
            if (hiddenCats.length === 0) {
              alert("현재 메인 화면에서 숨김 처리된 분류가 없습니다.");
              setMenu(prev => ({...prev, isOpen: false}));
              return;
            }
            // CategoryPage 컴포넌트에 이벤트를 발송합니다.
            window.dispatchEvent(new Event('galpi-trigger-secret-mode'));
            setMenu(prev => ({...prev, isOpen: false}));
          }}>
            🕵️ 비밀 금고 열람 (필터링)
          </div>
        </>
      )}

      <style>{`
        .context-item { padding: 10px 16px; font-size: 13px; font-weight: bold; color: var(--text-primary); cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 8px; }
        .context-item:hover { background: var(--table-bg-alt); }
      `}</style>
    </div>
  );
};

export default GlobalContextMenu;