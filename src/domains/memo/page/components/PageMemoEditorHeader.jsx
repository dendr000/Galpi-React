// 파일 위치: src/domains/memo/page/components/PageMemoEditorHeader.jsx
// 기능 요약: 페이지 에디터 모달의 상단 상태 제어(제목, 테마, 폴더, 저장, 닫기)를 담당하는 헤더 컴포넌트
import React from 'react';
import { SaveIcon, CheckCircleIcon, TrashIcon, XIcon } from '../../shared/components/MemoIcons';

const THEME_COLORS = [
  'var(--surface-color)', '#ffeaa7', '#a29bfe', '#81ecec', '#fab1a0', '#ff7675', '#74b9ff'
];

const PageMemoEditorHeader = ({
  titleRef,
  editData,
  setEditData,
  charCount,
  selectedColor,
  setSelectedColor,
  folders,
  isSaving,
  handleSaveMemo,
  activeMemoId,
  handleDeleteMemo,
  setIsEditorOpen,
  handleTitleKeyDown
}) => {
  return (
    <div style={{ padding: '12px 20px', background: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <input 
          ref={titleRef} 
          type="text" 
          placeholder="메모 제목" 
          style={{ flex: 1, fontSize: '18px', fontWeight: '900', border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none' }}
          onKeyDown={handleTitleKeyDown}
        />
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginRight: '10px' }}>
            {THEME_COLORS.map(color => (
              <button
                key={color} 
                onClick={() => setSelectedColor(color)}
                style={{ 
                  width: '20px', height: '20px', borderRadius: '50%', background: color, 
                  border: selectedColor === color ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', 
                  boxShadow: selectedColor === color ? '0 0 8px rgba(0,0,0,0.2)' : 'none', 
                  cursor: 'pointer', padding: 0 
                }}
                title="테마 색상 변경"
              />
            ))}
          </div>

          <select 
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '13px', fontWeight: 'bold', background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none' }} 
            value={editData.folder} 
            onChange={e => setEditData({ ...editData, folder: e.target.value })}
          >
            {folders.filter(f => f !== '전체 메모').map(f => <option key={f} value={f}>{f}</option>)}
          </select>

          <button 
            className="wiki-btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: isSaving ? '#10b981' : 'var(--primary-color)', color: 'white', fontWeight: 'bold', padding: '8px 16px', transition: '0.2s', width: isSaving ? '95px' : 'auto', border: 'none', borderRadius: '4px', cursor: 'pointer' }} 
            onClick={handleSaveMemo}
          >
            {isSaving ? <><CheckCircleIcon /> 저장됨</> : <><SaveIcon /> 저장</>}
          </button>

          {(activeMemoId && !String(activeMemoId).startsWith('local_')) && (
            <button 
              className="wiki-btn" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', color: '#e53e3e', border: '1px dashed rgba(229,62,62,0.5)', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }} 
              onClick={handleDeleteMemo} 
              title="영구 삭제"
            >
              <TrashIcon />
            </button>
          )}

          <button 
            className="wiki-btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontWeight: 'bold' }} 
            onClick={() => setIsEditorOpen(false)}
          >
            <XIcon /> 닫기
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: 'var(--bg-color)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold', marginLeft: '15px' }}>
          {charCount.selected > 0 ? `${charCount.selected} / ${charCount.total}` : `0 / ${charCount.total}`}
        </div>
      </div>
    </div>
  );
};

export default PageMemoEditorHeader;