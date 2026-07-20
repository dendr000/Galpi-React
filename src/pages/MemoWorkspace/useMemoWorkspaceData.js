// 파일 위치: src/pages/MemoWorkspace/useMemoWorkspaceData.js
// 기능 요약: 통합 검색(searchQuery) 및 해시태그(selectedTag) 교차 필터링이 추가된 워크스페이스 전역 상태 훅
// 버전: v1.2.0

import { useState, useEffect } from 'react';
import api from '../../api/axiosCore';

export const useMemoWorkspaceData = () => {
  const [memos, setMemos] = useState([]);
  const [relations, setRelations] = useState([]); 
  
  const [folders, setFolders] = useState(["전체 메모", "설정 아이디어", "기타", "휴지통"]);
  const [currentFolder, setCurrentFolder] = useState("전체 메모");
  const [sortMap, setSortMap] = useState({});

  // 신규 필터링 상태 추가
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    console.log("[useMemoWorkspaceData] 워크스페이스 초기 데이터 스캔 및 폴더 병합 개시");
    const fetchData = async () => {
      try {
        const storedSortMap = JSON.parse(localStorage.getItem('galpi-memo-sort-map'));
        if (storedSortMap) setSortMap(storedSortMap);

        let localFolders = ["전체 메모", "설정 아이디어", "기타", "휴지통"];
        const storedFolders = JSON.parse(localStorage.getItem('galpi-memo-folders'));
        if (storedFolders) localFolders = [...new Set([...localFolders, ...storedFolders])];

        const [memosRes, relationsRes] = await Promise.all([
          api.get('/api/memos'),
          api.get('/api/memo-relations').catch(() => ({ data: [] }))
        ]);

        if (memosRes.data && memosRes.data.length > 0) {
          setMemos(memosRes.data);
          setRelations(relationsRes.data);
          localStorage.setItem('galpi-memos', JSON.stringify(memosRes.data));

          const dbFolders = [...new Set(memosRes.data.map(m => m.folder).filter(Boolean))];
          const mergedFolders = [...new Set([...localFolders, ...dbFolders])];
          
          setFolders(mergedFolders);
          localStorage.setItem('galpi-memo-folders', JSON.stringify(mergedFolders));
        } else {
          setFolders(localFolders);
        }
      } catch (error) {
        console.error("[useMemoWorkspaceData] DB 통신 실패. 로컬 데이터로 폴백 연산 수행:", error);
        const storedMemos = JSON.parse(localStorage.getItem('galpi-memos')) || [];
        setMemos(storedMemos);
      }
    };
    fetchData();
  }, []);

  const extractTags = (content) => {
    if (!content) return "";
    const cleanText = content.replace(/<[^>]*>?/gm, ' ');
    const tagMatches = cleanText.match(/#[^\s#<]+/g);
    if (!tagMatches) return "";
    return [...new Set(tagMatches.map(t => t.replace('#', '').trim()))].join(',');
  };

  const handleAddFolder = () => {
    const name = prompt("새로운 폴더 이름을 입력하세요:");
    if (name && name.trim() && !folders.includes(name.trim())) {
      console.log(`[useMemoWorkspaceData] 신규 폴더 추가: ${name.trim()}`);
      const newFolders = [...folders, name.trim()];
      setFolders(newFolders);
      localStorage.setItem('galpi-memo-folders', JSON.stringify(newFolders));
      setCurrentFolder(name.trim());
    }
  };

  const handleEditFolder = async () => {
    if (["전체 메모", "설정 아이디어", "기타", "휴지통"].includes(currentFolder)) {
      return alert("기본 시스템 폴더는 이름을 수정할 수 없습니다.");
    }
    const newName = prompt("수정할 폴더 이름을 입력하세요:", currentFolder);
    if (newName && newName.trim() && newName.trim() !== currentFolder) {
      const finalName = newName.trim();
      if (folders.includes(finalName)) return alert("이미 존재하는 폴더명입니다.");
      
      console.log(`[useMemoWorkspaceData] 폴더명 변경 감지: ${currentFolder} -> ${finalName}`);
      const newFolders = folders.map(f => f === currentFolder ? finalName : f);
      setFolders(newFolders);
      localStorage.setItem('galpi-memo-folders', JSON.stringify(newFolders));
      
      const newData = memos.map(m => m.folder === currentFolder ? { ...m, folder: finalName, updatedAt: Date.now() } : m);
      setMemos(newData);
      localStorage.setItem('galpi-memos', JSON.stringify(newData));
      setCurrentFolder(finalName);

      const affectedMemos = newData.filter(m => m.folder === finalName);
      Promise.all(affectedMemos.map(m => {
        const isEdit = !String(m.id).startsWith("local_") && String(m.id).length < 13;
        return isEdit ? api.put(`/api/memos/${m.id}`, m) : Promise.resolve();
      })).then(() => console.log(`[useMemoWorkspaceData] 폴더명 변경에 따른 DB 연쇄 업데이트 성공`))
        .catch(e => console.warn(`[useMemoWorkspaceData] DB 동기화 실패`, e));
    }
  };

  const handleDeleteFolder = async () => {
    if (["전체 메모", "설정 아이디어", "기타", "휴지통"].includes(currentFolder)) {
      return alert("기본 시스템 폴더는 삭제할 수 없습니다.");
    }
    if (window.confirm(`'${currentFolder}' 폴더를 삭제하시겠습니까?\n(내부에 있던 메모는 모두 '기타' 폴더로 자동 이동되며 DB에 반영됩니다)`)) {
      console.log(`[useMemoWorkspaceData] 폴더 삭제 집행: ${currentFolder}`);
      const newFolders = folders.filter(f => f !== currentFolder);
      setFolders(newFolders);
      localStorage.setItem('galpi-memo-folders', JSON.stringify(newFolders));
      
      const newData = memos.map(m => m.folder === currentFolder ? { ...m, folder: "기타", updatedAt: Date.now() } : m);
      setMemos(newData);
      localStorage.setItem('galpi-memos', JSON.stringify(newData));
      setCurrentFolder("전체 메모");

      const affectedMemos = newData.filter(m => m.folder === "기타");
      Promise.all(affectedMemos.map(m => {
        const isEdit = !String(m.id).startsWith("local_") && String(m.id).length < 13;
        return isEdit ? api.put(`/api/memos/${m.id}`, m) : Promise.resolve();
      })).then(() => console.log(`[useMemoWorkspaceData] 폴더 삭제에 따른 '기타' 폴더로의 DB 연쇄 이관 성공`))
        .catch(e => console.warn(`[useMemoWorkspaceData] DB 동기화 실패`, e));
    }
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    console.log(`[useMemoWorkspaceData] 폴더[${currentFolder}] 정렬 기준 변경: ${val}`);
    const newSortMap = { ...sortMap, [currentFolder]: val };
    setSortMap(newSortMap);
    localStorage.setItem('galpi-memo-sort-map', JSON.stringify(newSortMap));
  };

  const currentSort = sortMap[currentFolder] || 'date';
  
  // 1. 폴더 기준 필터링
  let filteredMemos = [];
  if (currentFolder === "전체 메모") {
    filteredMemos = memos.filter(m => !m.isTrash);
  } else if (currentFolder === "휴지통") {
    filteredMemos = memos.filter(m => m.isTrash);
  } else {
    filteredMemos = memos.filter(m => m.folder === currentFolder && !m.isTrash);
  }

  // 2. 태그 교차 필터링
  if (selectedTag) {
    filteredMemos = filteredMemos.filter(m => m.tags && m.tags.split(',').map(t => t.trim()).includes(selectedTag));
  }

  // 3. 텍스트 검색 교차 필터링
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredMemos = filteredMemos.filter(m => 
      (m.title && m.title.toLowerCase().includes(q)) || 
      (m.content && m.content.toLowerCase().includes(q))
    );
  }

  filteredMemos.sort((a, b) => {
    if (currentSort === 'name') return (a.title || "").localeCompare(b.title || "", 'ko-KR');
    if (currentSort === 'custom') return (a.sortOrder !== undefined ? a.sortOrder : 9999) - (b.sortOrder !== undefined ? b.sortOrder : 9999);
    return b.updatedAt - a.updatedAt;
  });

  return {
    memos, setMemos, folders, setFolders, currentFolder, setCurrentFolder,
    sortMap, setSortMap, currentSort, filteredMemos, relations, setRelations, extractTags,
    searchQuery, setSearchQuery, selectedTag, setSelectedTag,
    handleAddFolder, handleEditFolder, handleDeleteFolder, handleSortChange
  };
};