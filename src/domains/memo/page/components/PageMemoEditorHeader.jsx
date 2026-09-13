// 파일 위치: src/domains/memo/page/components/PageMemoEditorHeader.jsx
// 기능 요약: 색상 팔레트 삭제, 글자 라벨을 아이콘(Tooltip)으로 압축하여 좁은 분할 화면에서도 줄바꿈이 절대 일어나지 않게 다이어트한 에디터 헤더
import React from 'react';
import { SaveIcon, CheckCircleIcon, TrashIcon, XIcon, EyeIcon, PenToolIcon } from '../../shared/components/MemoIcons';

const PageMemoEditorHeader = ({
  titleRef,
  editData,
  setEditData,
  charCount,
  folders,
  isSaving,
  handleSaveMemo,
  activeMemoId,
  handleDeleteMemo,
  handleCloseTab,
  handleTitleKeyDown,
  isReadOnly,
  setIsReadOnly,
  paneType
}) => {
  return (
    <div style={{ padding: '12px 20px', background: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
        <input 
          ref={titleRef} 
          type="text" 
          placeholder="메모 제목" 
          style={{ flex: 1, fontSize: '18px', fontWeight: '900', border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none', minWidth: 0 }}
          onKeyDown={handleTitleKeyDown}
          readOnly={isReadOnly}
        />
        
        {/* 버튼 구역: 텍스트를 제거하고 32x32 정사각형 아이콘 툴팁 버튼으로 압축 */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
          
          <select
            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px', fontWeight: 'bold', background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer', maxWidth: '100px' }}
            value={editData.folder}
            onChange={e => setEditData({ ...editData, folder: e.target.value })}
            disabled={isReadOnly}
            title="폴더 이동"
          >
            {/* ★ "웹툰"처럼 하위 폴더만 있고 그 경로 자체에 메모가 하나도 없는 상위 폴더를 선택한
                채로 새 메모를 만들면, folders 목록엔 그 경로가 아예 없어서 select가 옵션을 못 찾고
                조용히 첫 번째("기타")를 보여주는 버그가 있었다 — 실제 데이터는 맞게 들어가는데
                화면에는 엉뚱한 폴더로 저장된 것처럼 보였다. 지금 값이 목록에 없으면 끼워 넣는다. */}
            {!folders.includes(editData.folder) && editData.folder && <option value={editData.folder}>{editData.folder}</option>}
            {folders.filter(f => f !== '전체 메모').map(f => <option key={f} value={f}>{f}</option>)}
          </select>

          <button 
            className="wiki-btn" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: isReadOnly ? 'rgba(59, 91, 219, 0.1)' : 'transparent', color: isReadOnly ? 'var(--primary-color)' : 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', transition: '0.2s', padding: 0 }} 
            onClick={() => setIsReadOnly(!isReadOnly)}
            title={isReadOnly ? "편집 모드로 전환" : "읽기 전용(뷰어) 모드로 전환"}
          >
            {isReadOnly ? <PenToolIcon size={14} /> : <EyeIcon size={14} />}
          </button>

          {!isReadOnly && (
            <button 
              className="wiki-btn" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: isSaving ? '#10b981' : 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: '0.2s', padding: 0 }} 
              onClick={handleSaveMemo}
              title={isSaving ? "저장됨" : "저장"}
            >
              {isSaving ? <CheckCircleIcon /> : <SaveIcon />}
            </button>
          )}

          {(activeMemoId && !String(activeMemoId).startsWith('local_') && !isReadOnly) && (
            <button 
              className="wiki-btn" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: 'transparent', color: '#e53e3e', border: '1px dashed rgba(229,62,62,0.5)', borderRadius: '4px', cursor: 'pointer', transition: '0.2s', padding: 0 }} 
              onClick={handleDeleteMemo} 
              title="영구 삭제"
            >
              <TrashIcon />
            </button>
          )}

          <button 
            className="wiki-btn" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: 'transparent', color: 'var(--text-secondary)', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: '0.2s', padding: 0 }} 
            onClick={(e) => handleCloseTab(e, activeMemoId, paneType)}
            title="탭 닫기"
          >
            <XIcon />
          </button>
        </div>
      </div>

      {/* 흉물스러운 회색 배경 박스를 제거하고 텍스트만 깔끔하게 노출 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
          {charCount.selected > 0 ? `${charCount.selected} / ${charCount.total}` : `0 / ${charCount.total}`} 글자
        </span>
      </div>
    </div>
  );
};

export default PageMemoEditorHeader;