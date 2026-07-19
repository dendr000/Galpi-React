// 파일 위치: src/pages/BulkStudio/BulkModals.jsx
// 기능 요약: 전역 찾아 바꾸기 플러그인과 독립된 대형 마크다운 텍스트에어리어 에디터 모달을 렌더링하는 UI 컴포넌트

import React, { useState, useEffect } from 'react';

export const BulkModals = ({ 
  bodyModal, setBodyModal, handleCellChange, 
  findReplaceModal, setFindReplaceModal, columns, executeFindReplace 
}) => {
  
  const [findVal, setFindVal] = useState('');
  const [replaceVal, setReplaceVal] = useState('');
  const [targetCol, setTargetCol] = useState('ALL');
  const [bodyText, setBodyText] = useState('');

  // 본문 모달 동기화
  useEffect(() => {
    console.log(`[BulkModals] 본문 텍스트에어리어 동기화 패치. 타겟 인덱스: ${bodyModal.rowIdx}`);
    if (bodyModal.isOpen) setBodyText(bodyModal.text || '');
  }, [bodyModal.isOpen, bodyModal.text]);

  const handleSaveBody = () => {
    console.log(`[BulkModals] 모달 본문 임시 저장 커밋`);
    handleCellChange(bodyModal.rowIdx, 'pageBodyRaw', bodyText);
    setBodyModal({ isOpen: false, rowIdx: null, text: '' });
  };

  const handleExecuteFr = () => {
    console.log(`[BulkModals] 일괄 찾아 바꾸기 스캔 엔진 시작`);
    executeFindReplace(targetCol, findVal, replaceVal);
  };

  return (
    <>
      {/* 1. 마크다운 본문 상세 편집 모달 */}
      {bodyModal.isOpen && (
        <div className="bulk-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }} onClick={() => setBodyModal({ isOpen: false })}>
          <div className="bulk-modal-content" style={{ background: 'var(--bg-color)', width: '90%', maxWidth: '800px', height: '80vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', border: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--table-bg-alt)' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: 'var(--primary-color)' }}>📝 상세 본문 편집</h3>
              <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setBodyModal({ isOpen: false })}>&times;</button>
            </div>
            <textarea 
              value={bodyText} 
              onChange={e => setBodyText(e.target.value)} 
              placeholder="상세 본문 내용을 마크다운으로 작성하십시오." 
              style={{ flex: 1, padding: '20px', border: 'none', outline: 'none', resize: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '14px', lineHeight: 1.6, fontFamily: 'inherit' }}
              autoFocus
            />
            <div style={{ padding: '15px 20px', borderTop: '1px solid var(--border-color)', background: 'var(--table-bg-alt)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }} onClick={() => setBodyModal({ isOpen: false })}>취소</button>
              <button style={{ background: 'var(--primary-color)', border: 'none', color: 'white', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }} onClick={handleSaveBody}>본문 내용 임시 저장</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. 전역 찾아 바꾸기 플러그인 모달 */}
      {findReplaceModal.isOpen && (
        <div className="bulk-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }} onClick={() => setFindReplaceModal({ isOpen: false })}>
          <div className="bulk-modal-content" style={{ background: 'var(--bg-color)', width: '90%', maxWidth: '400px', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', border: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--table-bg-alt)' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: 'var(--primary-color)' }}>🔍 찾아 바꾸기</h3>
              <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setFindReplaceModal({ isOpen: false })}>&times;</button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>대상 속성(열)</label>
                <select value={targetCol} onChange={e => setTargetCol(e.target.value)} style={{ width: '100%', marginTop: '5px', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', background: 'var(--surface-color)', color: 'var(--primary-color)', outline: 'none' }}>
                  <option value="ALL">모든 속성 (이름 포함)</option>
                  <option value="본문(마크다운)">본문(마크다운)</option>
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>찾을 내용</label>
                <input type="text" value={findVal} onChange={e => setFindVal(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', marginTop: '5px', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', background: 'var(--surface-color)', color: 'var(--text-primary)', outline: 'none' }} autoFocus />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>바꿀 내용</label>
                <input type="text" value={replaceVal} onChange={e => setReplaceVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleExecuteFr()} style={{ width: '100%', boxSizing: 'border-box', marginTop: '5px', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', background: 'var(--surface-color)', color: 'var(--text-primary)', outline: 'none' }} />
              </div>
            </div>
            <div style={{ padding: '15px 20px', borderTop: '1px solid var(--border-color)', background: 'var(--table-bg-alt)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }} onClick={() => setFindReplaceModal({ isOpen: false })}>취소</button>
              <button style={{ background: 'var(--primary-color)', border: 'none', color: 'white', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }} onClick={handleExecuteFr}>모두 바꾸기</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};