import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axiosCore';

const GlobalContextMenu = () => {
  const [menu, setMenu] = useState({ isOpen: false, x: 0, y: 0, selectedText: '' });
  const [isSavePrevented, setIsSavePrevented] = useState(() => localStorage.getItem('galpi-prevent-save') !== 'false');
  const navigate = useNavigate();
  const location = useLocation();

  const handleContextMenu = useCallback((e) => {
    if (e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      
      const selection = window.getSelection().toString().trim();
      let posX = e.clientX;
      let posY = e.clientY;

      const menuWidth = 220; 
      const menuHeight = 350;
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
      folder: "기타",
      title: '📌 ' + shortTitle, 
      content: text, 
      updatedAt: newMemoId, 
      sortOrder: -1 
    });
    
    localStorage.setItem('galpi-memos', JSON.stringify(currentMemoData));
    try { window.getSelection().removeAllRanges(); } catch(e){}
    setMenu(prev => ({ ...prev, isOpen: false }));
    alert("'기타' 탭에 메모가 안전하게 저장되었습니다!"); // ★ 알림 텍스트 수정
  };

  const workPathMatch = location.pathname.match(/^\/work\/(\d+)/);
  const isWorkDetailPage = !!workPathMatch;
  const currentWorkId = workPathMatch ? workPathMatch[1] : null;

  const handleSecretDeleteWork = async () => {
    if (!currentWorkId) return;
    setMenu(prev => ({ ...prev, isOpen: false }));

    const deleteKeyword = import.meta.env.VITE_DELETE_KEYWORD || 'delete';
    const userInput = prompt(`⚠️ 시크릿 파괴 경고: 현재 작품을 시스템에서 완전히 파기하시겠습니까?\n등장인물 정보는 보존되며 작품 원장만 타겟이 됩니다. 삭제를 승인하시려면 '${deleteKeyword}'를 정밀하게 입력하세요.`);

    if (userInput === deleteKeyword) {
      try {
        console.log(`[GlobalContextMenu] 작품 ID: ${currentWorkId} 원장 파괴 통신 개시.`);
        await api.delete(`/api/works/${currentWorkId}`);
        alert("작품 데이터가 안전하게 파기되었습니다.");
        navigate('/');
      } catch (err) {
        console.error("[GlobalContextMenu] 작품 파괴 중 통신 예외 발생:", err);
        alert("원장 삭제 중 통신 거부가 감지되었습니다 백엔드를 확인하십시오.");
      }
    } else if (userInput !== null) {
      alert("입력한 암호가 정확하지 않습니다. 삭제 프로세스를 긴급 중단합니다.");
    }
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
            window.dispatchEvent(new Event('galpi-trigger-secret-mode'));
            setMenu(prev => ({...prev, isOpen: false}));
          }}>
            🕵️ 비밀 금고 열람 (필터링)
          </div>
        </>
      )}

      {isWorkDetailPage && (
        <>
          <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }}></div>
          <div className="context-item secret-delete-item" style={{ color: '#e53e3e', fontWeight: 900 }} onClick={handleSecretDeleteWork}>
            🗑️ 현재 작품 영구 삭제
          </div>
        </>
      )}

      <style>{`
        .context-item { padding: 10px 16px; font-size: 13px; font-weight: bold; color: var(--text-primary); cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 8px; }
        .context-item:hover { background: var(--table-bg-alt); }
        .secret-delete-item:hover { background: rgba(229, 62, 62, 0.08) !important; }
      `}</style>
    </div>
  );
};

export default GlobalContextMenu;