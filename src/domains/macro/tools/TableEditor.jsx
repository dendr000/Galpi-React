// 파일 위치: src/components/macro/tools/TableEditor.jsx
// 기능 요약: 마크다운 엑셀형 표 생성/편집기 모달 UI 컴포넌트
// 버전: v2.2.0

import React, { useState } from 'react';
import styles from '../MacroToolbar.module.css';

export const TableEditor = ({ selectedText, onInsert, onCancel }) => {
  console.log("[TableEditor] 컴포넌트 렌더링 주기 추적");
  const [tableData, setTableData] = useState(() => {
    if (selectedText && selectedText.includes('||')) {
      let parsed = [];
      selectedText.trim().split('\n').forEach(line => {
        let t = line.trim();
        if (t.startsWith('||') && t.endsWith('||')) {
          parsed.push(t.substring(2, t.length - 2).split('||').map(s => s.trim()));
        }
      });
      if (parsed.length > 0) return parsed;
    }
    return [['제목 1', '제목 2'], ['내용 1', '내용 2']];
  });

  const addRow = () => {
    console.log("[TableEditor] 아래 행 추가 실행");
    setTableData([...tableData, new Array(tableData[0].length).fill('')]);
  };

  const addCol = () => {
    console.log("[TableEditor] 우측 열 추가 실행");
    setTableData(tableData.map(row => [...row, '']));
  };

  const delRow = () => {
    console.log("[TableEditor] 맨밑 행 삭제 실행");
    if (tableData.length > 1) {
      setTableData(tableData.slice(0, -1));
    }
  };

  const delCol = () => {
    console.log("[TableEditor] 맨끝 열 삭제 실행");
    if (tableData[0].length > 1) {
      setTableData(tableData.map(row => row.slice(0, -1)));
    }
  };

  const updateCell = (rIdx, cIdx, val) => {
    const newData = [...tableData];
    newData[rIdx] = [...newData[rIdx]];
    newData[rIdx][cIdx] = val;
    setTableData(newData);
  };

  const handleConfirm = () => {
    console.log("[TableEditor] 최종 스니펫 파싱 후 인서트 전달");
    let snippet = "\n";
    tableData.forEach(row => { 
      snippet += "|| " + row.map(c => c || " ").join(" || ") + " ||\n"; 
    });
    snippet += "\n";
    onInsert(snippet);
  };

  return (
    <>
      <div className={styles.modalBody}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
          <button className="wiki-btn" style={{ padding: '6px 10px', fontSize: '12px', borderColor: 'var(--border-color)', background: 'transparent', color: 'var(--text-primary)' }} onClick={addRow}>+ 아래 행 추가</button>
          <button className="wiki-btn" style={{ padding: '6px 10px', fontSize: '12px', borderColor: 'var(--border-color)', background: 'transparent', color: 'var(--text-primary)' }} onClick={addCol}>+ 우측 열 추가</button>
          <button className="wiki-btn" style={{ padding: '6px 10px', fontSize: '12px', borderColor: '#e53e3e', background: 'transparent', color: '#e53e3e', marginLeft: 'auto' }} onClick={delRow}>- 맨밑 행 삭제</button>
          <button className="wiki-btn" style={{ padding: '6px 10px', fontSize: '12px', borderColor: '#e53e3e', background: 'transparent', color: '#e53e3e' }} onClick={delCol}>- 맨끝 열 삭제</button>
        </div>
        <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>※ 첫 번째 줄은 굵은 제목 행으로 자동 처리됩니다.</p>
        <div style={{ overflowX: 'auto', paddingBottom: '10px' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', border: '2px solid var(--border-color)' }}>
            <tbody>
              {tableData.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => {
                    const isHeader = rIdx === 0;
                    const bg = isHeader ? 'var(--table-bg-alt)' : 'var(--surface-color)';
                    const fw = isHeader ? 'bold' : 'normal';
                    const cText = (cell === "제목 1" || cell === "제목 2" || cell === "내용 1" || cell === "내용 2") ? "" : cell;
                    return (
                      <td key={cIdx} style={{ border: '1px solid var(--border-color)', padding: 0 }}>
                        <input type="text" value={cText} placeholder={isHeader ? '제목' : '내용'} onChange={(e) => updateCell(rIdx, cIdx, e.target.value)} style={{ width: '100%', minWidth: '100px', padding: '10px', border: 'none', background: bg, color: 'var(--text-primary)', outline: 'none', fontWeight: fw, textAlign: 'center', boxSizing: 'border-box' }} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className={styles.modalFooter}>
        <button className={styles.cancelBtn} onClick={onCancel}>취소</button>
        <button className={styles.confirmBtn} onClick={handleConfirm}>에디터에 삽입</button>
      </div>
    </>
  );
};