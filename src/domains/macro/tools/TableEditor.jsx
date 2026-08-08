// 절대 경로: src/components/macro/tools/TableEditor.jsx
// 기능 요약: 마크다운 엑셀형 표 생성/편집기 모달 UI 컴포넌트 (textarea 기반 다중 행 지원 및 헤더 옵션 적용)
// 버전: v3.0.0

import React, { useState } from 'react';
import styles from '../MacroToolbar.module.css';

export const TableEditor = ({ selectedText, onInsert, onCancel }) => {
  console.log("[TableEditor] 컴포넌트 렌더링 주기 추적");
  
  // 기능: 기존 에디터에서 드래그된 표 데이터가 있다면 파싱하고, 없다면 3x2 기본 배열 생성
  const [tableData, setTableData] = useState(() => {
    if (selectedText && selectedText.includes('||')) {
      let parsed = [];
      selectedText.trim().split('\n').forEach(line => {
        let t = line.trim();
        if (t.startsWith('||') && t.endsWith('||')) {
          // 마크다운 표 안의 [br] 문자를 에디터용 줄바꿈(\n)으로 복원
          parsed.push(t.substring(2, t.length - 2).split('||').map(s => s.trim().replace(/\[br\]/g, '\n')));
        }
      });
      if (parsed.length > 0) return parsed;
    }
    return [['', ''], ['', ''], ['', '']];
  });

  // 기능: 첫 번째 행을 제목(헤더)으로 처리할지 여부
  const [useHeader, setUseHeader] = useState(true);

  const addRow = () => {
    console.log("[TableEditor] 아래 행 추가 실행");
    setTableData(prev => [...prev, Array(prev[0].length).fill('')]);
  };

  const addCol = () => {
    console.log("[TableEditor] 우측 열 추가 실행");
    setTableData(prev => prev.map(row => [...row, '']));
  };

  const delRow = () => {
    console.log("[TableEditor] 맨밑 행 삭제 실행");
    setTableData(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  };

  const delCol = () => {
    console.log("[TableEditor] 맨끝 열 삭제 실행");
    setTableData(prev => prev[0].length > 1 ? prev.map(row => row.slice(0, -1)) : prev);
  };

  // 기능: 셀 내용 변경 감지 및 textarea 높이 자동 조절
  const handleCellChange = (rIdx, cIdx, event) => {
    const newData = [...tableData];
    newData[rIdx][cIdx] = event.target.value;
    setTableData(newData);
    
    event.target.style.height = 'auto';
    event.target.style.height = event.target.scrollHeight + 'px';
  };

  // 기능: 에디터에 마크다운 표 문법으로 변환하여 삽입
  const handleConfirm = () => {
    console.log("[TableEditor] 최종 스니펫 파싱 후 인서트 전달");
    let snippet = "\n";
    tableData.forEach((row, rIdx) => {
      const isHeader = useHeader && rIdx === 0;
      const cellDelimiter = isHeader ? ' ||~ ' : ' || ';
      const prefix = isHeader ? '||~ ' : '|| ';
      
      // 줄바꿈 문자를 마크다운용 공백인 [br]로 치환
      const rowString = row.map(cell => cell.replace(/\n/g, ' [br] ').trim() || ' ').join(cellDelimiter);
      snippet += `${prefix}${rowString} ||\n`;
    });
    snippet += "\n";
    onInsert(snippet);
  };

  return (
    <>
      <div className={styles.modalBody}>
        {/* 툴바 영역 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px', alignItems: 'center' }}>
          <button className="wiki-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', fontSize: '12px', borderColor: 'var(--border-color)', background: 'transparent', color: 'var(--text-primary)' }} onClick={addRow}>
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> 아래 행 추가
          </button>
          <button className="wiki-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', fontSize: '12px', borderColor: 'var(--border-color)', background: 'transparent', color: 'var(--text-primary)' }} onClick={addCol}>
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> 우측 열 추가
          </button>
          <button className="wiki-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', fontSize: '12px', borderColor: '#e53e3e', background: 'transparent', color: '#e53e3e', marginLeft: 'auto' }} onClick={delRow}>
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg> 맨밑 행 삭제
          </button>
          <button className="wiki-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', fontSize: '12px', borderColor: '#e53e3e', background: 'transparent', color: '#e53e3e' }} onClick={delCol}>
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg> 맨끝 열 삭제
          </button>
        </div>

        {/* 옵션 토글 영역 */}
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={useHeader} onChange={e => setUseHeader(e.target.checked)} style={{ width: '16px', height: '16px' }} />
          첫 번째 줄을 굵은 제목(헤더) 행으로 처리합니다.
        </label>

        {/* 그리드 입력 영역 */}
        <div style={{ overflowX: 'auto', paddingBottom: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${tableData[0].length}, minmax(150px, 1fr))`, gap: '8px', minWidth: '100%' }}>
            {tableData.map((row, rIdx) => (
              row.map((cell, cIdx) => (
                <textarea
                  key={`${rIdx}-${cIdx}`}
                  value={cell}
                  onChange={(e) => handleCellChange(rIdx, cIdx, e)}
                  placeholder={`${rIdx + 1}행 ${cIdx + 1}열`}
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '8px',
                    boxSizing: 'border-box',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    resize: 'none',
                    overflowY: 'hidden',
                    background: (useHeader && rIdx === 0) ? 'var(--table-bg-alt)' : 'var(--surface-color)',
                    fontWeight: (useHeader && rIdx === 0) ? 'bold' : 'normal',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    lineHeight: '1.4'
                  }}
                />
              ))
            ))}
          </div>
        </div>
      </div>
      
      {/* 푸터 영역 */}
      <div className={styles.modalFooter}>
        <button className={styles.cancelBtn} onClick={onCancel}>취소</button>
        <button className={styles.confirmBtn} onClick={handleConfirm}>에디터에 삽입</button>
      </div>
    </>
  );
};