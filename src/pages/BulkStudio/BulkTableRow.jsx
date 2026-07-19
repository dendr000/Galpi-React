// 파일 위치: src/pages/BulkStudio/BulkTableRow.jsx
// 기능 요약: React 가상화 테이블의 개별 행(Row)을 렌더링하며 고정(Sticky) 셀의 투명도 중첩을 방지하는 모듈

import React from 'react';

const BulkTableRow = ({ 
  row, rIdx, columns, 
  handleCellChange, toggleRowCheck, removeRow, 
  setActiveRowIdx, handleKeyDown, setBodyModal 
}) => {
  const isNew = String(row.id).startsWith('new_');
  const rowClass = row._checked ? 'checked-row' : '';
  
  // ★ 스크롤 시 글자가 비쳐 보이는 것을 막기 위해 Sticky 셀 전용 불투명 배경색 추출
  const bgCol = row._checked ? 'var(--table-bg-alt)' : 'var(--surface-color)';

  return (
    <tr className={rowClass} style={{ background: bgCol }}>
      <td className="sticky-check" style={{ background: bgCol }}>
        <input type="checkbox" checked={row._checked} onChange={e => toggleRowCheck(e, rIdx)} />
      </td>
      <td className="sticky-delete" style={{ background: bgCol }}>
        <button onClick={() => removeRow(rIdx)} style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>✖</button>
      </td>
      <td className="sticky-name" style={{ background: bgCol }}>
        <input 
          type="text" 
          className="input b-name" 
          data-row={rIdx} 
          value={row.name} 
          onChange={e => handleCellChange(rIdx, 'name', e.target.value)} 
          onFocus={() => setActiveRowIdx(rIdx)} 
          onKeyDown={e => handleKeyDown(e, rIdx, 'name')}
          placeholder={isNew ? '새 캐릭터명' : ''} 
          style={isNew ? { boxShadow: 'inset 0 0 0 1px #10b981' } : {}}
        />
      </td>
      
      {columns.map(col => {
        let ph = (col === "나이" || col === "신장" || col === "키" || col === "신체") ? "숫자만" : (col === "부제목" ? "영문/별명 입력" : "");
        return (
          <td key={col}>
            <input 
              type="text" 
              className="input b-prop" 
              data-row={rIdx} 
              data-col={col}
              list={`dl-${col}`}
              value={row[col] || ''} 
              onChange={e => handleCellChange(rIdx, col, e.target.value)} 
              onFocus={() => setActiveRowIdx(rIdx)}
              onKeyDown={e => handleKeyDown(e, rIdx, col)}
              placeholder={ph}
              autoComplete="off"
            />
          </td>
        );
      })}
      
      <td className="sticky-body" style={{ background: bgCol }} onClick={() => { setActiveRowIdx(rIdx); setBodyModal({ isOpen: true, rowIdx: rIdx, text: row.pageBodyRaw }); }}>
        <span style={{ color: row.pageBodyRaw ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: row.pageBodyRaw ? 900 : 'bold', fontSize: '13px', cursor: 'pointer' }}>
          {row.pageBodyRaw ? '📝 편집' : '➕ 내용 작성'}
        </span>
      </td>
    </tr>
  );
};

// React.memo를 통해 부모 데이터(전체 배열)가 변경되어도 해당 행 데이터가 그대로면 렌더링을 차단합니다.
export default React.memo(BulkTableRow);