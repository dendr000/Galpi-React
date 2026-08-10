// 파일 위치: src/domains/memo/page/hooks/usePageMemoData.js
// 기능 요약: 페이지 전역 상태 관리 (검색, 태그 필터링, 폴더 관리) - 캔버스 관계망 데이터 적출 완료
import { useState, useEffect, useMemo } from 'react';
import api from '../../../../api/axiosCore';

export const usePageMemoData = () => {
  const [memos, setMemos] = useState([]);
  const [folders, setFolders] = useState(["전체 메모", "기타"]);
  const [currentFolder, setCurrentFolder] = useState("전체 메모");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const memosRes = await api.get('/api/memos');

        if (memosRes.data) {
          setMemos(memosRes.data);
          const dbFolders = [...new Set(memosRes.data.map(m => m.folder).filter(Boolean))];
          const mergedFolders = [...new Set(["전체 메모", "기타", ...dbFolders])];
          setFolders(mergedFolders);
        }
      } catch (err) {
        console.error("[usePageMemoData] 데이터 로드 실패", err);
      }
    };
    fetchData();
  }, []);

  const handleAddFolder = () => {
    const name = prompt("새로운 폴더 이름을 입력하세요:");
    if (name && name.trim() && !folders.includes(name.trim())) {
      setFolders(prev => [...prev, name.trim()]);
      setCurrentFolder(name.trim());
    }
  };

  const handleEditFolder = async () => {
    if (["전체 메모", "기타"].includes(currentFolder)) return alert("기본 시스템 폴더는 이름을 수정할 수 없습니다.");
    
    const newName = prompt("수정할 폴더 이름을 입력하세요:", currentFolder);
    if (newName && newName.trim() && newName.trim() !== currentFolder) {
      const finalName = newName.trim();
      if (folders.includes(finalName)) return alert("이미 존재하는 폴더명입니다.");
      
      setFolders(prev => prev.map(f => f === currentFolder ? finalName : f));
      
      const newData = memos.map(m => m.folder === currentFolder ? { ...m, folder: finalName, updatedAt: Date.now() } : m);
      setMemos(newData);
      setCurrentFolder(finalName);
      
      const affectedMemos = newData.filter(m => m.folder === finalName);
      Promise.all(affectedMemos.map(m => {
        const isEdit = !String(m.id).startsWith("local_") && String(m.id).length < 13;
        return isEdit ? api.put(`/api/memos/${m.id}`, m) : Promise.resolve();
      })).catch(e => console.warn("[usePageMemoData] 폴더명 변경 동기화 실패", e));
    }
  };

  const handleDeleteFolder = async () => {
    if (["전체 메모", "기타"].includes(currentFolder)) return alert("기본 시스템 폴더는 삭제할 수 없습니다.");
    
    if (window.confirm(`'${currentFolder}' 폴더를 삭제하시겠습니까?\n(내부에 있던 메모는 모두 '기타' 폴더로 이관됩니다)`)) {
      setFolders(prev => prev.filter(f => f !== currentFolder));
      
      const newData = memos.map(m => m.folder === currentFolder ? { ...m, folder: "기타", updatedAt: Date.now() } : m);
      setMemos(newData);
      setCurrentFolder("기타");

      const affectedMemos = newData.filter(m => m.folder === "기타");
      Promise.all(affectedMemos.map(m => {
        const isEdit = !String(m.id).startsWith("local_") && String(m.id).length < 13;
        return isEdit ? api.put(`/api/memos/${m.id}`, m) : Promise.resolve();
      })).catch(e => console.warn("[usePageMemoData] 폴더 삭제 동기화 실패", e));
    }
  };

  const filteredMemos = useMemo(() => {
    let result = [...memos];

    if (currentFolder !== "전체 메모") {
      result = result.filter(m => m.folder === currentFolder);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => 
        (m.title && m.title.toLowerCase().includes(q)) || 
        (m.content && m.content.toLowerCase().includes(q))
      );
    }

    result = result.filter(m => !m.isTrash);

    if (selectedTag) {
      result = result.filter(m => {
        if (!m.tags) return false;
        const tags = m.tags.split(',').map(t => t.trim()).filter(Boolean);
        return tags.includes(selectedTag);
      });
    }

    result.sort((a, b) => b.updatedAt - a.updatedAt);
    
    return result;
  }, [memos, currentFolder, searchQuery, selectedTag]);

  return {
    memos, setMemos, folders, setFolders, currentFolder, setCurrentFolder,
    filteredMemos,
    searchQuery, setSearchQuery, selectedTag, setSelectedTag,
    handleAddFolder, handleEditFolder, handleDeleteFolder
  };
};