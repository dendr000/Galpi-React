// 파일 위치: src/domains/work/WorkCategoryBar.jsx
// 기능 요약: 작품 상세 페이지에서 분류(장르/태그) 목록을 표시하고, 삭제 및 인라인 폼을 통한 추가를 관리하는 컴포넌트
// 버전: v1.0.0

import React from 'react';
import api from '../../api/axiosCore';
import InlineCategoryForm from './InlineCategoryForm';

const WorkCategoryBar = ({ work, workId, setWork, styles }) => {
  if (!work) return null;
  console.log("[WorkCategoryBar] 분류 카테고리 바 렌더링 시작");

  const handleDelete = async (e, index) => {
    e.stopPropagation();
    console.log(`[WorkCategoryBar] 카테고리 삭제 요청 감지. 타겟 인덱스: ${index}`);
    const gs = work.genre.split(',').filter(gen => gen.trim() !== "");
    gs.splice(index, 1);
    const newGenre = gs.join(',');
    
    try {
      await api.put(`/api/works/${workId}`, { ...work, genre: newGenre });
      setWork(prev => ({ ...prev, genre: newGenre }));
      console.log("[WorkCategoryBar] 카테고리 삭제 완료 및 상태 갱신");
    } catch(err) {
      console.error("[WorkCategoryBar] 카테고리 삭제 통신 실패", err);
      alert("분류 삭제 실패");
    }
  };

  return (
    <div id="work-category" className={`${styles.wikiCategory} gt-category`}>
      <div style={{ fontWeight: 'bold', marginLeft: '10px', marginRight: '10px', flexShrink: 0 }}>분류: </div>
      {work.genre && work.genre.split(',').filter(g => g.trim()).map((g, index) => (
        <span key={`${g}-${index}`} className={`${styles.wikiTagItem} gt-tag`}>
          <a href={`/category?cat=${encodeURIComponent(g.trim())}`} style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.target.style.textDecoration='underline'} onMouseOut={(e) => e.target.style.textDecoration='none'}>
            {g.trim()}
          </a>
          <span 
            style={{ cursor: 'pointer', opacity: 0.6, marginLeft: '4px', padding: '0 2px' }} 
            onClick={(e) => handleDelete(e, index)}
          >&times;</span>
        </span>
      ))}
      <InlineCategoryForm work={work} workId={workId} setWork={setWork} />
      <div style={{ flex: 1 }}></div>
    </div>
  );
};

export default WorkCategoryBar;