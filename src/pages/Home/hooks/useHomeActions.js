// 파일 위치: src/pages/Home/hooks/useHomeActions.js
// 기능 요약: 메인 대시보드에서 일어나는 작품 진행 상태(status) 토글 및 즐겨찾기 상태 변경 로직을 전담합니다.
import { useState } from 'react';
import api from '../../../api/axiosCore';

export const useHomeActions = ({ works, setWorks }) => {
  const [favWorks, setFavWorks] = useState(() => JSON.parse(localStorage.getItem('wiki-favs') || '[]'));

  const toggleFav = (e, id) => {
    e.stopPropagation();
    let newFavs;
    if (favWorks.includes(id)) {
      newFavs = favWorks.filter(fid => fid !== id);
      console.log(`[useHomeActions] 즐겨찾기 해제: ID ${id}`);
    } else {
      newFavs = [...favWorks, id];
      console.log(`[useHomeActions] 즐겨찾기 등록: ID ${id}`);
    }
    setFavWorks(newFavs);
    localStorage.setItem('wiki-favs', JSON.stringify(newFavs));
  };

  const toggleStatus = async (e, id) => {
    e.stopPropagation();
    const targetWork = works.find(w => w.id === id);
    if (!targetWork) return;

    const statuses = ["진행 전", "진행 중", "완료"];
    const curIdx = statuses.indexOf(targetWork.status);
    const nextStatus = statuses[(curIdx === -1 ? 0 : curIdx + 1) % statuses.length];

    console.log(`[useHomeActions] 작품 상태 변경 통신 시작: ID ${id}, ${targetWork.status} -> ${nextStatus}`);
    
    const payload = { ...targetWork, status: nextStatus };
    delete payload.metaInfo; 

    try {
      await api.put(`/api/works/${id}`, payload);
      setWorks(works.map(w => w.id === id ? { ...w, status: nextStatus } : w));
      console.log(`[useHomeActions] 작품 상태 변경 완료`);
    } catch (error) {
      console.error("[useHomeActions] 상태 변경 통신 실패:", error);
    }
  };

  return { favWorks, toggleFav, toggleStatus };
};