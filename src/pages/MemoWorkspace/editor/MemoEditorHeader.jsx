// 파일 위치: src/pages/MemoWorkspace/editor/MemoEditorHeader.jsx
// 기능 요약: 에디터 모달의 최상단 상태 제어(제목, 테마, 폴더, 저장, 닫기)를 담당하는 헤더 컴포넌트
// 버전: v1.1.0 (폴더 셀렉트 복구 및 인라인 태그 입력창 제거)

import React from 'react';

const THEME_COLORS = [
  'var(--surface-color)', '#ffeaa7', '#a29bfe', '#81ecec', '#fab1a0', '#ff7675', '#74b9ff'
];

const MemoEditorHeader = ({
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
  console.log("[MemoEditorHeader] 에디터 헤더 컨트롤 패널 렌더링");

  return (
    <div style={{ padding: '12px 20px', background: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      
      {/* 1열: 제목 입력 및 기능 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <input 
          ref={titleRef} 
          type="text" 
          placeholder="메모 제목" 
          style={{ flex: 1, fontSize: '18px', fontWeight: '900', border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none' }}
          onKeyDown={(e) => {
            console.log(`[MemoEditorHeader] 제목 입력창 키보드 이벤트 감지: ${e.key}`);
            handleTitleKeyDown(e);
          }}
        />
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginRight: '10px' }}>
            {THEME_COLORS.map(color => (
              <button
                key={color} 
                onClick={() => {
                  console.log(`[MemoEditorHeader] 테마 색상 선택됨: ${color}`);
                  setSelectedColor(color);
                }}
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

          {/* ★ 실수로 삭제했던 폴더 셀렉트 박스 완벽 복구 */}
          <select 
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '13px', fontWeight: 'bold' }} 
            value={editData.folder} 
            onChange={e => {
              console.log(`[MemoEditorHeader] 폴더 변경됨: ${e.target.value}`);
              setEditData({...editData, folder: e.target.value});
            }}
          >
            {folders.filter(f => f !== '전체 메모').map(f => <option key={f} value={f}>{f}</option>)}
          </select>

          <button 
            className="wiki-btn" 
            style={{ background: isSaving ? '#10b981' : 'var(--primary-color)', color: 'white', fontWeight: 'bold', padding: '8px 16px', transition: '0.2s', width: isSaving ? '90px' : 'auto' }} 
            onClick={() => {
              console.log("[MemoEditorHeader] 저장 버튼 클릭 감지");
              handleSaveMemo();
            }}
          >
            {isSaving ? "✅ 저장됨" : "💾 저장"}
          </button>

          {(activeMemoId && !String(activeMemoId).startsWith('local_')) && (
            <button 
              className="wiki-btn" 
              style={{ background: 'transparent', color: '#e53e3e', border: '1px dashed rgba(229,62,62,0.5)', padding: '8px 12px' }} 
              onClick={() => {
                console.log("[MemoEditorHeader] 영구 삭제 버튼 클릭 감지");
                handleDeleteMemo();
              }} 
              title="영구 삭제"
            >
              🗑️
            </button>
          )}

          <button 
            className="wiki-btn" 
            style={{ background: 'transparent', color: 'var(--text-secondary)' }} 
            onClick={() => {
              console.log("[MemoEditorHeader] 모달 닫기 버튼 클릭 감지");
              setIsEditorOpen(false);
            }}
          >
            ✖ 닫기
          </button>
        </div>
      </div>

      {/* 2열: 글자 수 표시 (인라인 태그창 제거 후 우측 정렬 유지) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: 'var(--bg-color)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold', marginLeft: '15px' }}>
          {charCount.selected > 0 ? `${charCount.selected} / ${charCount.total}` : `0 / ${charCount.total}`}
        </div>
      </div>
    </div>
  );
};

export default MemoEditorHeader;