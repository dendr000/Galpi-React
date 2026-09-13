// 파일 위치: src/domains/memo/fab/hooks/useFabMemoMenu.js
import { useState, useRef, useEffect } from 'react';
import api from '../../../../api/axiosCore';

export const useFabMemoMenu = ({ memoData, setMemoData, activeMemoId, setActiveMemoId }) => {
  const [menuData, setMenuData] = useState({ isOpen: false, x: 0, y: 0, memoId: null });
  const listContainerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuData.isOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuData({ isOpen: false, x: 0, y: 0, memoId: null });
      }
    };
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && menuData.isOpen) {
        setMenuData({ isOpen: false, x: 0, y: 0, memoId: null });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    
    const scrollArea = listContainerRef.current;
    const handleScroll = () => setMenuData({ isOpen: false, x: 0, y: 0, memoId: null });
    if (scrollArea) scrollArea.addEventListener('scroll', handleScroll);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
      if (scrollArea) scrollArea.removeEventListener('scroll', handleScroll);
    };
  }, [menuData.isOpen]);

  const openMoveMenu = (e, id) => {
    e.stopPropagation();
    let posX = e.clientX; let posY = e.clientY;
    const menuWidth = 150; const menuHeight = 250;
    if (posX + menuWidth > window.innerWidth) posX = window.innerWidth - menuWidth - 10;
    if (posY + menuHeight > window.innerHeight) posY = window.innerHeight - menuHeight - 10;
    setMenuData({ isOpen: true, x: posX, y: posY, memoId: id });
  };

  const executeMoveMemo = async (folderName) => {
    const targetMemo = memoData.find(m => String(m.id) === String(menuData.memoId));
    if (!targetMemo) return;

    const updatedMemo = { ...targetMemo, folder: folderName, updatedAt: Date.now() };
    const newData = memoData.map(m => String(m.id) === String(menuData.memoId) ? updatedMemo : m);
    setMemoData(newData);
    localStorage.setItem('galpi-memos', JSON.stringify(newData));

    try {
      const isEdit = !String(targetMemo.id).startsWith("local_");
      await api[isEdit ? 'put' : 'post'](`/api/memos${isEdit ? `/${targetMemo.id}` : ''}`, updatedMemo);
    } catch(e) {}
    setMenuData({ isOpen: false, x: 0, y: 0, memoId: null });
  };

  const deleteMemo = async () => {
    const deleteKeyword = import.meta.env.VITE_DELETE_KEYWORD || 'delete';
    
    const pass = await window.openSafeDeleteModal(`이 메모를 영구 삭제하시겠습니까?`);
    
    if (pass !== deleteKeyword) {
      if (pass !== null) alert("입력값이 일치하지 않아 삭제가 취소되었습니다.");
      setMenuData({ isOpen: false, x: 0, y: 0, memoId: null });
      return;
    }

    const newData = memoData.filter(m => String(m.id) !== String(menuData.memoId));
    setMemoData(newData);
    localStorage.setItem('galpi-memos', JSON.stringify(newData));

    try {
      const isEdit = !String(menuData.memoId).startsWith("local_");
      if (isEdit) await api.delete(`/api/memos/${menuData.memoId}`);
    } catch(e) {}
    
    if (String(activeMemoId) === String(menuData.memoId)) {
      setActiveMemoId(newData.length > 0 ? newData[0].id : null);
    }
    setMenuData({ isOpen: false, x: 0, y: 0, memoId: null });
  };

  return { menuData, setMenuData, listContainerRef, menuRef, openMoveMenu, executeMoveMemo, deleteMemo };
};