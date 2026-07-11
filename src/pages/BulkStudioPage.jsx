import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosCore';
import styles from './BulkStudio.module.css';
import { renderMarkdown } from '../utils/markdownParser';

const DEFAULT_COLS = ["부제목", "나이", "성별", "종족", "소속", "직책", "능력", "등급", "관계"];

const BulkStudioPage = () => {
  const navigate = useNavigate();
  const [works, setWorks] = useState([]);
  const [selectedWorkId, setSelectedWorkId] = useState('');
  const [columns, setColumns] = useState([...DEFAULT_COLS]);
  const [rows, setRows] = useState([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [activeRowIdx, setActiveRowIdx] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.get('/api/works').then(res => setWorks(res.data)).catch(() => {}); }, []);

  const loadCharacters = async (workId) => {
    setSelectedWorkId(workId);
    if (!workId) return setRows([]);
    setLoading(true);
    try {
      const res = await api.get(`/api/characters?workId=${workId}`);
      const chars = res.data;
      
      const newCols = new Set([...DEFAULT_COLS]);
      chars.forEach(c => {
        if (c.dynamicProperties) {
          try {
            const dp = JSON.parse(c.dynamicProperties);
            Object.keys(dp).forEach(k => {
              if (!k.startsWith('_') && k !== '부제목' && !["작품명", "제작자", "age", "gender", "species"].includes(k)) newCols.add(k);
            });
          } catch(e){}
        }
      });
      const colArray = Array.from(newCols).filter(k => k !== "부제목");
      colArray.unshift("부제목");
      setColumns(colArray);

      const formattedRows = chars.map(c => {
        let dp = {}; try { dp = JSON.parse(c.dynamicProperties || "{}"); } catch(e){}
        const rowData = { id: c.id, name: c.name || '', _checked: false, pageBodyRaw: dp.pageBody?.rawText || '' };
        colArray.forEach(col => {
          if (col === '나이') rowData[col] = c.age || dp[col] || '';
          else if (col === '성별') rowData[col] = c.gender || dp[col] || '';
          else if (col === '종족') rowData[col] = c.species || dp[col] || '';
          else rowData[col] = dp[col] || '';
        });
        return rowData;
      });
      setRows(formattedRows);
    } catch (e) { alert("데이터 로드 실패"); } finally { setLoading(false); }
  };

  const handleCellChange = (rIdx, key, val) => {
    const newRows = [...rows];
    newRows[rIdx][key] = val;
    setRows(newRows);
  };

  const handleSaveAll = async () => {
    if (!selectedWorkId) return alert("작품이 선택되지 않았습니다.");
    const targetWork = works.find(w => String(w.id) === String(selectedWorkId));
    let cExt = "png";
    if (targetWork?.description && targetWork.description.includes('META_DATA')) {
        try { cExt = JSON.parse(targetWork.description.match(/\[META_DATA:(.*?)\]/)[1]).charExt || "png"; } catch(e){}
    }

    try {
      const promises = rows.map(row => {
        if (!row.name.trim()) return Promise.resolve(); // 이름 빈칸 스킵
        const dp = { _propOrder: [...columns], pageBody: { rawText: row.pageBodyRaw } };
        columns.forEach(col => { if (row[col]?.trim() && !["나이", "성별", "종족"].includes(col)) dp[col] = row[col].trim(); });
        
        const payload = {
          workId: parseInt(selectedWorkId), name: row.name.trim(),
          age: row["나이"], gender: row["성별"], species: row["종족"],
          imageCode: `${targetWork.title}_${row.name.trim()}.${cExt}`,
          dynamicProperties: JSON.stringify(dp)
        };
        return String(row.id).startsWith('new_') ? api.post('/api/characters', payload) : api.put(`/api/characters/${row.id}`, payload);
      });
      await Promise.all(promises);
      alert("✅ 일괄 저장 완료!");
      loadCharacters(selectedWorkId);
    } catch (e) { alert("저장 실패"); }
  };

  const activeRow = activeRowIdx !== null ? rows[activeRowIdx] : null;

  return (
    <div className={styles.layout}>
      {/* 좌측 실시간 뷰어 */}
      <aside className={`${styles.sidebar} ${!isPreviewOpen ? styles.sidebarClosed : ''}`}>
        <div className={styles.previewHeader}>✨ 실시간 뷰어</div>
        <div className={styles.previewContent}>
          {activeRow ? (
            <div style={{ background: 'var(--surface-color)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h2 style={{ color: 'var(--primary-color)', margin: '0 0 15px 0' }}>{activeRow.name || '이름 없음'}</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <tbody>
                  {columns.map(c => activeRow[c] && (
                    <tr key={c}><th style={{ background: 'var(--table-bg-alt)', padding: '8px', border: '1px solid var(--border-color)', width: '30%' }}>{c}</th><td style={{ padding: '8px', border: '1px solid var(--border-color)' }}>{activeRow[c]}</td></tr>
                  ))}
                </tbody>
              </table>
              {activeRow.pageBodyRaw && (
                <div className="markdown-body" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed var(--border-color)' }} dangerouslySetInnerHTML={{ __html: renderMarkdown(activeRow.pageBodyRaw) }} />
              )}
            </div>
          ) : <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>행을 클릭하면 미리보기가 나타납니다.</div>}
        </div>
      </aside>

      {/* 우측 엑셀 시트 */}
      <main className={styles.main}>
        <div className={styles.header}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="wiki-btn" style={{ background: 'var(--table-bg-alt)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} onClick={() => setIsPreviewOpen(!isPreviewOpen)}>{isPreviewOpen ? '◀' : '▶'}</button>
            <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>📦 일괄 관리 스튜디오</h2>
          </div>
          <select className="tool-input" style={{ width: '250px', padding: '8px' }} value={selectedWorkId} onChange={e => loadCharacters(e.target.value)}>
            <option value="">-- 작품 선택 --</option>
            {works.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
          </select>
        </div>

        <div className={styles.toolbar}>
           <button className="wiki-btn" onClick={() => {
              if(!selectedWorkId) return alert("작품 선택 요망");
              const nr = { id: `new_${Date.now()}`, name: '', _checked: false, pageBodyRaw: '' };
              columns.forEach(c => nr[c] = ''); setRows([...rows, nr]);
           }}>+ 행(캐릭터) 추가</button>
           <button className="wiki-btn" style={{background:'var(--surface-color)', color:'var(--text-primary)', border:'1px solid var(--border-color)'}} onClick={() => {
              const nc = prompt("추가할 속성명:");
              if(nc && !columns.includes(nc)) { setColumns([...columns, nc]); setRows(rows.map(r => ({...r, [nc]: ''}))); }
           }}>+ 열(속성) 추가</button>
        </div>

        <div className={styles.tableWrap}>
          {loading ? <div style={{ padding: '40px', textAlign: 'center' }}>로딩 중...</div> : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th><input type="checkbox" onChange={e => setRows(rows.map(r => ({...r, _checked: e.target.checked})))} checked={rows.length > 0 && rows.every(r=>r._checked)} /></th>
                  <th>삭제</th><th>이름 (필수)</th>
                  {columns.map(c => <th key={c}>{c}</th>)}
                  <th style={{ width: '100px' }}>본문 편집</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rIdx) => (
                  <tr key={row.id} style={{ background: row._checked ? 'var(--table-bg-alt)' : 'var(--surface-color)' }}>
                    <td><input type="checkbox" checked={row._checked} onChange={e => handleCellChange(rIdx, '_checked', e.target.checked)} /></td>
                    <td><button style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }} onClick={() => setRows(rows.filter((_, i)=>i!==rIdx))}>✖</button></td>
                    <td><input type="text" className={styles.input} value={row.name} onChange={e => handleCellChange(rIdx, 'name', e.target.value)} onFocus={() => setActiveRowIdx(rIdx)} placeholder="이름" /></td>
                    {columns.map(col => (
                      <td key={col}><input type="text" className={styles.input} value={row[col] || ''} onChange={e => handleCellChange(rIdx, col, e.target.value)} onFocus={() => setActiveRowIdx(rIdx)} /></td>
                    ))}
                    <td><button className="wiki-btn" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => { setActiveRowIdx(rIdx); const text = prompt("마크다운 본문을 입력하세요:", row.pageBodyRaw); if (text !== null) handleCellChange(rIdx, 'pageBodyRaw', text); }}>📝 본문</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className={styles.footer}>
          <button className="wiki-btn" style={{ width: '100%', background: '#10b981', padding: '15px', fontSize: '16px' }} onClick={handleSaveAll}>💾 전체 데이터베이스에 일괄 저장</button>
        </div>
      </main>
    </div>
  );
};

export default BulkStudioPage;