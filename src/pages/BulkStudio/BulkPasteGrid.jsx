// 파일 위치: src/pages/BulkStudio/BulkPasteGrid.jsx
// 기능 요약: "붙여넣기로 추가" 모달의 표 입력 모드. '-'를 직접 안 쳐도 Tab/Enter로 칸을
// 옮겨다니며 채울 수 있고, <table> 레이아웃이 알아서 열 너비를 맞춰준다(글자 수 세서
// 스페이스로 정렬하던 걸 대체). 미리 텍스트로 써둔 게 있으면 아무 칸에나 붙여넣어도
// 거기서부터 표에 흩뿌려진다. 시작할 땐 "이름" 열만 있고, 필요한 속성만 직접 추가/삭제한다
// (메인 표의 현재 열을 전부 들고 오면 쓰지도 않을 속성 때문에 표가 쓸데없이 늘어나서).
import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { IconPlus } from '../../components/common/icons/DomainIcons';

const blankRow = (cols) => cols.reduce((acc, c) => ({ ...acc, [c]: '' }), {});
const cellBorder = '1px solid var(--border-color)';

const BulkPasteGrid = forwardRef(({ columns, onSubmit }, ref) => {
  const [extraCols, setExtraCols] = useState([]);
  const [newColName, setNewColName] = useState('');
  const [tabMode, setTabMode] = useState('horizontal'); // 메인 표(BulkTable)와 같은 기본값/개념
  const allCols = ['이름', ...extraCols, '본문'];

  const [rows, setRows] = useState(() => Array.from({ length: 5 }, () => blankRow(allCols)));
  const containerRef = useRef(null);

  const focusCell = (r, c) => {
    setTimeout(() => {
      const el = containerRef.current?.querySelector(`[data-r="${r}"][data-c="${c}"]`);
      if (el) { el.focus(); el.select?.(); }
    }, 0);
  };

  const addColumnByName = (name) => {
    if (!name || allCols.includes(name)) return;
    setExtraCols(prev => [...prev, name]);
    setRows(prev => prev.map(r => ({ ...r, [name]: '' })));
  };

  const removeColumn = (name) => {
    setExtraCols(prev => prev.filter(c => c !== name));
    setRows(prev => prev.map(r => {
      const copy = { ...r };
      delete copy[name];
      return copy;
    }));
  };

  const handleCellChange = (r, col, val) => {
    setRows(prev => {
      const next = [...prev];
      next[r] = { ...next[r], [col]: val };
      return next;
    });
  };

  const handleKeyDown = (e, r, c) => {
    const isLastCol = c === allCols.length - 1;
    const isLastRow = r === rows.length - 1;

    if (e.key === 'Tab' && tabMode === 'vertical') {
      // 세로 모드에서는 Tab/Shift+Tab 둘 다 좌우가 아니라 같은 열의 위아래로 움직여야 한다
      // (안 막아두면 브라우저 기본 동작대로 Shift+Tab이 그냥 이전 DOM 순서인 왼쪽 칸으로 가버림)
      e.preventDefault();
      if (e.shiftKey) {
        if (r > 0) focusCell(r - 1, c);
        return;
      }
      if (isLastRow) setRows(prev => [...prev, blankRow(allCols)]);
      focusCell(r + 1, c);
      return;
    }
    if (e.key === 'Tab' && !e.shiftKey && isLastCol && isLastRow) {
      // 가로 모드에서 맨 마지막 칸까지 다 왔으면 다음 줄을 만들어서 이어 칠 수 있게 한다
      e.preventDefault();
      setRows(prev => [...prev, blankRow(allCols)]);
      focusCell(r + 1, 0);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isLastRow) setRows(prev => [...prev, blankRow(allCols)]);
      focusCell(r + 1, c);
    }
  };

  // 여러 줄/여러 칸짜리 텍스트를 붙여넣으면(엑셀·구글시트·노션 표, 또는 "이름 - 나이 - ..."
  // 식으로 미리 써둔 텍스트) 여기서부터 표에 흩뿌린다.
  // 첫 줄이 "이름"으로 시작하는 헤더면, 그 헤더의 속성 "이름"으로 매칭해서 넣는다(그리드의
  // 현재 열 순서와 붙여넣은 속성 순서가 다를 수 있어서 — 그냥 위치로만 맞춰 넣으면, 그리드에
  // 아직 없는 속성이 껴 있을 때 뒤 칸들이 전부 밀려서 엉뚱한 속성에 들어간다).
  // 헤더가 없으면(그냥 값들만 붙여넣은 경우) 지금 누른 칸부터 순서대로 채운다.
  const handlePaste = (e, r, c) => {
    const text = e.clipboardData.getData('text');
    if (!text.includes('\n') && !text.includes('\t') && !text.includes(' - ')) return; // 한 칸짜리 붙여넣기는 기본 동작에 맡긴다
    e.preventDefault();

    const useTab = text.includes('\t');
    const delim = useTab ? '\t' : ' - ';
    const lines = text.split('\n').map(l => l.replace(/\r$/, '')).filter(l => l.trim() !== '');
    if (lines.length === 0) return;

    const firstCells = lines[0].split(delim).map(s => s.trim());
    const hasHeader = firstCells[0] === '이름';

    if (hasHeader) {
      const headerLabels = firstCells;
      const dataLines = lines.slice(1);
      if (dataLines.length === 0) return;

      const newCols = headerLabels.filter(h => h !== '이름' && h !== '본문' && !allCols.includes(h));
      if (newCols.length > 0) setExtraCols(prev => [...prev, ...newCols]);
      const finalCols = ['이름', ...extraCols, ...newCols, '본문'];

      setRows(prev => {
        const next = prev.map(row => {
          const copy = { ...row };
          newCols.forEach(nc => { if (copy[nc] === undefined) copy[nc] = ''; });
          return copy;
        });
        while (next.length < r + dataLines.length) next.push(blankRow(finalCols));

        dataLines.forEach((line, li) => {
          const cells = line.split(delim).map(s => s.trim());
          const targetRow = { ...next[r + li] };
          headerLabels.forEach((label, hi) => {
            if (cells[hi] !== undefined) targetRow[label] = cells[hi];
          });
          next[r + li] = targetRow;
        });
        return next;
      });
      focusCell(r + dataLines.length, 0);
    } else {
      setRows(prev => {
        const next = [...prev];
        while (next.length < r + lines.length) next.push(blankRow(allCols));
        lines.forEach((line, li) => {
          const cells = line.split(delim).map(s => s.trim());
          const targetRow = { ...next[r + li] };
          cells.forEach((val, ci) => {
            const col = allCols[c + ci];
            if (col) targetRow[col] = val;
          });
          next[r + li] = targetRow;
        });
        return next;
      });
      focusCell(r + lines.length, c);
    }
  };

  const handleAddColumn = () => {
    const name = newColName.trim();
    if (!name) return;
    if (allCols.includes(name)) return alert('이미 있는 속성입니다.');
    addColumnByName(name);
    setNewColName('');
  };

  const quickAddOptions = columns.filter(c => !allCols.includes(c));
  const filledCount = rows.filter(r => r['이름'].trim() !== '').length;

  // 그리드 표시용 열 이름을 " - " 구분 텍스트로 바꿔준다 — '텍스트로 붙여넣기' 탭과 내용을 동기화할 때 사용
  const rowsToText = () => {
    const header = allCols.join(' - ');
    const dataLines = rows
      .filter(r => (r['이름'] || '').trim() !== '')
      .map(r => allCols.map(c => (r[c] || '').trim()).join(' - '));
    if (dataLines.length === 0) return '';
    return [header, ...dataLines].join('\n');
  };

  // rowsToText의 반대 방향 — '텍스트로 붙여넣기' 탭에서 고친 내용을 표로 되돌린다.
  // 텍스트 쪽은 자유 형식이라 헤더 줄("이름 - ...")이 없으면 어느 칸이 뭔지 알 수 없으니,
  // 그 경우엔 표를 건드리지 않고 그대로 둔다.
  const loadFromText = (text) => {
    const lines = text.split('\n').map(l => l.replace(/\r$/, '')).filter(l => l.trim() !== '');
    if (lines.length === 0) return;
    const useTab = lines.some(l => l.includes('\t'));
    const delim = useTab ? '\t' : ' - ';
    const headerLabels = lines[0].split(delim).map(s => s.trim());
    if (headerLabels[0] !== '이름') return;

    const dataLines = lines.slice(1);
    const newCols = headerLabels.filter(h => h !== '이름' && h !== '본문' && !extraCols.includes(h));
    const finalExtraCols = newCols.length > 0 ? [...extraCols, ...newCols] : extraCols;
    const finalCols = ['이름', ...finalExtraCols, '본문'];

    const newRows = dataLines.map(line => {
      const cells = line.split(delim).map(s => s.trim());
      const row = blankRow(finalCols);
      headerLabels.forEach((label, hi) => { if (cells[hi] !== undefined) row[label] = cells[hi]; });
      return row;
    });

    if (newCols.length > 0) setExtraCols(finalExtraCols);
    setRows(newRows.length > 0 ? newRows : Array.from({ length: 5 }, () => blankRow(finalCols)));
  };

  // 메인 표에 이미 있는 인물들을 그대로 그리드에 불러온다 — 모달을 열 때마다 매번 빈 표로
  // 시작해서 새로 추가하는 용도로만 쓰던 걸, 기존 인물도 여기서 같이 고칠 수 있게 바꾼 것.
  // 여기서 어떤 열을 보여줄지는 메인 표의 현재 columns를 그대로 따른다(기존 값이 실제로
  // 들어있는 속성들이니까) — 새로 "행 추가"할 때의 "이름만 있는 빈 칸" 시작과는 다른 경우.
  // 제출 시 이름으로 기존 인물과 매칭해서 새로 만들지 갱신할지 정하므로(useBulkStudioData의
  // importRowsFromGrid), 여기서는 별도 id 추적 없이 이름 값만 그대로 들고 있으면 된다.
  const loadFromRows = (mainRows, mainColumns) => {
    const existingCols = mainColumns.filter(c => c !== '이름' && c !== '본문');
    const finalCols = ['이름', ...existingCols, '본문'];

    const mirrored = mainRows
      .filter(r => (r.name || '').trim() !== '')
      .map(r => {
        const row = blankRow(finalCols);
        row['이름'] = r.name || '';
        row['본문'] = r.pageBodyRaw || '';
        existingCols.forEach(c => { row[c] = r[c] || ''; });
        return row;
      });

    setExtraCols(existingCols);
    setRows([...mirrored, ...Array.from({ length: 3 }, () => blankRow(finalCols))]);
  };

  useImperativeHandle(ref, () => ({
    submit: () => onSubmit(rows, extraCols),
    getAsText: rowsToText,
    loadFromText,
    loadFromRows
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, margin: '12px 20px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <input
          type="text" value={newColName} onChange={e => setNewColName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddColumn(); } }}
          placeholder="새 속성 이름 (예: 랭킹)"
          style={{ padding: '5px 10px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--surface-color)', color: 'var(--text-primary)', outline: 'none', width: '150px' }}
        />
        <button onClick={handleAddColumn} className="wiki-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '5px 10px', fontSize: '11.5px' }}>
          <IconPlus size={11} /> 열 추가
        </button>

        <button
          onClick={() => setTabMode(prev => prev === 'horizontal' ? 'vertical' : 'horizontal')}
          title={`탭 이동 방향: ${tabMode === 'horizontal' ? '가로(좌우)' : '세로(상하)'}`}
          className="wiki-btn"
          style={{
            display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', fontSize: '11.5px', border: '1px solid var(--border-color)',
            background: tabMode === 'vertical' ? 'rgba(59,91,219,0.1)' : 'transparent',
            color: tabMode === 'vertical' ? 'var(--primary-color)' : 'var(--text-primary)',
            borderColor: tabMode === 'vertical' ? 'var(--primary-color)' : 'var(--border-color)'
          }}
        >
          {tabMode === 'horizontal' ? (
            <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="12" x2="22" y2="12"></line><polyline points="8 6 2 12 8 18"></polyline><polyline points="16 6 22 12 16 18"></polyline></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="22"></line><polyline points="8 6 12 2 16 6"></polyline><polyline points="8 18 12 22 16 18"></polyline></svg>
          )}
          탭 이동
        </button>

        {quickAddOptions.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>기존 속성:</span>
            {quickAddOptions.map(c => (
              <button
                key={c} onClick={() => addColumnByName(c)}
                style={{ background: 'var(--table-bg-alt)', border: '1px solid var(--border-color)', borderRadius: '999px', padding: '3px 10px', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                + {c}
              </button>
            ))}
          </div>
        )}
      </div>

      <div ref={containerRef} className="galpi-sidebar-scroll" style={{ flex: 1, overflow: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              {allCols.map(col => {
                const removable = col !== '이름' && col !== '본문';
                return (
                  <th key={col} style={{ position: 'sticky', top: 0, background: 'var(--table-bg-alt)', borderBottom: '2px solid var(--border-color)', borderRight: cellBorder, padding: '6px 10px', fontSize: '11.5px', fontWeight: 900, color: 'var(--text-secondary)', whiteSpace: 'nowrap', textAlign: 'left' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {col}
                      {removable && (
                        <button
                          onClick={() => removeColumn(col)}
                          title={`'${col}' 열 삭제`}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0, display: 'flex', fontSize: '13px', lineHeight: 1, opacity: 0.6 }}
                        >×</button>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                {allCols.map((col, c) => (
                  <td key={col} style={{ borderBottom: cellBorder, borderRight: cellBorder, padding: 0 }}>
                    <input
                      data-r={r} data-c={c}
                      value={row[col] ?? ''}
                      onChange={e => handleCellChange(r, col, e.target.value)}
                      onKeyDown={e => handleKeyDown(e, r, c)}
                      onPaste={e => handlePaste(e, r, c)}
                      style={{ width: '100%', minWidth: col === '본문' ? '160px' : '70px', boxSizing: 'border-box', padding: '7px 10px', border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '12.5px' }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '10px 0', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{filledCount > 0 ? `${filledCount}명분의 내용이 반영됩니다. (이미 있는 이름은 수정, 새 이름은 추가)` : '이름 칸부터 채워주세요. Tab으로 다음 칸, Enter로 아래 칸.'}</span>
      </div>
    </div>
  );
});

export default BulkPasteGrid;
