// 파일 위치: src/domains/memo/fab/components/FabMemoItem.jsx
// 기능 요약: 사이드바 탐색기 내부에 표시되는 개별 메모 카드(아이콘, 제목, 복사/더보기 버튼)를 렌더링하는 UI 컴포넌트
import React from 'react';
import { FileTextIcon, LinkIcon, MoreVerticalIcon } from '../../shared/components/MemoIcons';

const FabMemoItem = ({ m, isActive, setActiveMemoId, handleCopyPath, openMoveMenu }) => {
  return (
    <div
      onClick={() => setActiveMemoId(m.id)}
      className={isActive ? 'galpi-active-menu-btn' : ''}
      style={{
        padding: '6px 10px 6px 20px', 
        borderRadius: '4px', 
        cursor: 'pointer', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'transparent',
        opacity: 1, 
        transition: 'background 0.2s', 
        marginTop: '2px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
        <FileTextIcon />
        <span style={{ fontSize: '13px', color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {m.title || '제목 없음'}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button 
          className="wiki-btn" 
          onClick={(e) => handleCopyPath(e, 'memo', m.id)} 
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
          title="경로 복사"
        >
          <LinkIcon />
        </button>
        <button 
          className="wiki-btn"
          onClick={(e) => openMoveMenu(e, m.id)} 
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <MoreVerticalIcon />
        </button>
      </div>
    </div>
  );
};

export default FabMemoItem;