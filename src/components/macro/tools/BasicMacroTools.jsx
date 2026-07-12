// src/components/macro/tools/BasicMacroTools.jsx
// 파일 역할: 엑셀형 표, 스탯 레이더, 게이지 바, 타임라인 생성기 서브 컴포넌트 모음
// 버전: v1.4.0 (표 생성기 Grid UI 전면 개편 및 직관성 향상)

import React, { useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import styles from '../MacroToolbar.module.css';

/* =======================================
 * 1. 엑셀형 표 생성 컴포넌트
 * ======================================= */
export const TableEditor = ({ selectedText, onInsert, onCancel }) => {
  // 표 데이터(2차원 배열) 상태 초기화 및 역파싱
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
    // 기본값: 2x2 테이블
    return [['제목 1', '제목 2'], ['내용 1', '내용 2']];
  });

  // 아래 행 추가
  const addRow = () => {
    console.log("[TableEditor] 아래 행 추가");
    setTableData([...tableData, new Array(tableData[0].length).fill('')]);
  };

  // 우측 열 추가
  const addCol = () => {
    console.log("[TableEditor] 우측 열 추가");
    setTableData(tableData.map(row => [...row, '']));
  };

  // 맨 밑 행 삭제
  const delRow = () => {
    console.log("[TableEditor] 맨밑 행 삭제");
    if (tableData.length > 1) {
      setTableData(tableData.slice(0, -1));
    }
  };

  // 맨 끝 열 삭제
  const delCol = () => {
    console.log("[TableEditor] 맨끝 열 삭제");
    if (tableData[0].length > 1) {
      setTableData(tableData.map(row => row.slice(0, -1)));
    }
  };

  // 특정 셀 데이터 수정
  const updateCell = (rIdx, cIdx, val) => {
    const newData = [...tableData];
    newData[rIdx] = [...newData[rIdx]];
    newData[rIdx][cIdx] = val;
    setTableData(newData);
  };

  // 에디터에 마크다운 문법으로 변환하여 삽입
  const handleConfirm = () => {
    console.log("[TableEditor] 표 삽입 가동");
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
        {/* 제어 버튼 패널 */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
          <button className="wiki-btn" style={{ padding: '6px 10px', fontSize: '12px', borderColor: 'var(--border-color)', background: 'transparent', color: 'var(--text-primary)' }} onClick={addRow}>+ 아래 행 추가</button>
          <button className="wiki-btn" style={{ padding: '6px 10px', fontSize: '12px', borderColor: 'var(--border-color)', background: 'transparent', color: 'var(--text-primary)' }} onClick={addCol}>+ 우측 열 추가</button>
          <button className="wiki-btn" style={{ padding: '6px 10px', fontSize: '12px', borderColor: '#e53e3e', background: 'transparent', color: '#e53e3e', marginLeft: 'auto' }} onClick={delRow}>- 맨밑 행 삭제</button>
          <button className="wiki-btn" style={{ padding: '6px 10px', fontSize: '12px', borderColor: '#e53e3e', background: 'transparent', color: '#e53e3e' }} onClick={delCol}>- 맨끝 열 삭제</button>
        </div>

        <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>※ 첫 번째 줄은 굵은 제목 행으로 자동 처리됩니다.</p>
        
        {/* 표 UI 렌더링 (착시 현상을 막기 위한 명확한 Grid Table 구조) */}
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
                        <input 
                          type="text" 
                          value={cText} 
                          placeholder={isHeader ? '제목' : '내용'} 
                          onChange={(e) => updateCell(rIdx, cIdx, e.target.value)} 
                          style={{ 
                            width: '100%', minWidth: '100px', padding: '10px', 
                            border: 'none', background: bg, color: 'var(--text-primary)', 
                            outline: 'none', fontWeight: fw, textAlign: 'center', boxSizing: 'border-box' 
                          }} 
                        />
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

/* =======================================
 * 2. 스탯 차트 (방사형) 생성 컴포넌트
 * ======================================= */
export const RadarEditor = ({ selectedText, onInsert, onCancel }) => {
  const [formList, setFormList] = useState(() => {
    if (selectedText && selectedText.includes('[스탯:')) {
      const match = selectedText.match(/\[스탯:\s*(.*?)\]/);
      if (match) {
        const parsed = [];
        match[1].split(',').forEach(p => {
          const parts = p.split('=');
          if (parts.length === 2) parsed.push({ label: parts[0].trim(), val: parts[1].trim() });
        });
        if (parsed.length > 0) return parsed;
      }
    }
    return [{ label: '근력', val: 80 }, { label: '민첩', val: 60 }, { label: '지능', val: 90 }];
  });

  const handleConfirm = () => {
    console.log("[RadarEditor] 스탯 차트 삽입 가동");
    const valid = formList.filter(f => f.label.trim() !== "");
    if (valid.length < 3) return alert("스탯 항목은 최소 3개 이상이어야 합니다.");
    onInsert(`\n[스탯: ${valid.map(f => `${f.label}=${f.val}`).join(', ')}]\n`);
  };

  return (
    <>
      <div className={styles.modalBody}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>스탯 이름과 수치(0~100)를 입력하세요.</p>
          <button className="wiki-btn" onClick={() => setFormList([...formList, {label:'', val:50}])} style={{ padding: '4px 8px', fontSize: '12px' }}>+ 스탯 추가</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
          {formList.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
               <input className={styles.toolInput} value={f.label} onChange={(e) => { const n = [...formList]; n[i].label = e.target.value; setFormList(n); }} placeholder="스탯명" style={{ flex: 1 }} />
               <input type="number" className={styles.toolInput} value={f.val} onChange={(e) => { const n = [...formList]; n[i].val = e.target.value; setFormList(n); }} placeholder="수치" style={{ width: '80px', textAlign: 'center' }} />
               <button onClick={() => { const n = [...formList]; n.splice(i, 1); setFormList(n); }} style={{ background:'transparent', border:'none', color:'#e53e3e', cursor:'pointer', fontWeight:'bold', fontSize:'16px' }}>✖</button>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.modalFooter}>
        <button className={styles.cancelBtn} onClick={onCancel}>취소</button>
        <button className={styles.confirmBtn} onClick={handleConfirm}>에디터에 삽입</button>
      </div>
    </>
  );
};

/* =======================================
 * 3. 게이지 바 생성 컴포넌트
 * ======================================= */
export const BarEditor = ({ selectedText, onInsert, onCancel }) => {
  const [formList, setFormList] = useState(() => {
    if (selectedText && selectedText.includes('[게이지:')) {
      const match = selectedText.match(/\[게이지:\s*(.*?)\]/);
      if (match) {
        const parsed = [];
        match[1].split(',').forEach(p => {
          const parts = p.split('=');
          if (parts.length === 2) {
            const vParts = parts[1].split('/');
            parsed.push({ label: parts[0].trim(), val: vParts[0].trim(), max: vParts[1] ? vParts[1].trim() : '100' });
          }
        });
        if (parsed.length > 0) return parsed;
      }
    }
    return [{ label: '체력', val: 50, max: 100 }];
  });

  const handleConfirm = () => {
    console.log("[BarEditor] 게이지 바 삽입 가동");
    const valid = formList.filter(f => f.label.trim() !== "");
    if (valid.length === 0) return alert("게이지 항목을 입력해주세요.");
    onInsert(`\n[게이지: ${valid.map(f => `${f.label}=${f.val}/${f.max}`).join(', ')}]\n`);
  };

  return (
    <>
      <div className={styles.modalBody}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>항목명과 현재/최대 수치를 입력하세요.</p>
          <button className="wiki-btn" onClick={() => setFormList([...formList, {label:'', val:50, max:100}])} style={{ padding: '4px 8px', fontSize: '12px' }}>+ 항목 추가</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {formList.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
               <input className={styles.toolInput} value={f.label} onChange={(e) => { const n = [...formList]; n[i].label = e.target.value; setFormList(n); }} placeholder="상태명" style={{ flex: 1 }} />
               <input type="number" className={styles.toolInput} value={f.val} onChange={(e) => { const n = [...formList]; n[i].val = e.target.value; setFormList(n); }} placeholder="현재" style={{ width: '60px', textAlign: 'center' }} />
               <span style={{ color:'var(--text-secondary)', fontWeight:'bold' }}>/</span>
               <input type="number" className={styles.toolInput} value={f.max} onChange={(e) => { const n = [...formList]; n[i].max = e.target.value; setFormList(n); }} placeholder="최대" style={{ width: '60px', textAlign: 'center' }} />
               <button onClick={() => { const n = [...formList]; n.splice(i, 1); setFormList(n); }} style={{ background:'transparent', border:'none', color:'#e53e3e', cursor:'pointer', fontWeight:'bold', fontSize:'16px' }}>✖</button>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.modalFooter}>
        <button className={styles.cancelBtn} onClick={onCancel}>취소</button>
        <button className={styles.confirmBtn} onClick={handleConfirm}>에디터에 삽입</button>
      </div>
    </>
  );
};

/* =======================================
 * 4. 타임라인(연표) 생성 컴포넌트
 * ======================================= */
export const TimelineEditor = ({ selectedText, onInsert, onCancel }) => {
  const [formList, setFormList] = useState(() => {
    let initialList = [];
    if (selectedText && selectedText.includes('[TIMELINE]')) {
      const lines = selectedText.split('\n');
      let inTimeline = false;
      lines.forEach(line => {
        const t = line.trim();
        if (t === '[TIMELINE]') { inTimeline = true; return; }
        if (t === '[/TIMELINE]') { inTimeline = false; return; }
        if (inTimeline && t) {
          const parts = t.split('::::');
          if (parts.length >= 1) {
            initialList.push({ id: `tl-${Date.now()}-${Math.random()}`, date: (parts[0]||'').trim(), title: (parts[1]||'').trim(), desc: (parts[2]||'').trim().replace(/<br>/g, '\n') });
          }
        }
      });
    }
    if (initialList.length === 0) initialList.push({ id: `tl-${Date.now()}`, date: '', title: '', desc: '' });
    return initialList;
  });

  // 드래그 앤 드롭 종료 시 배열 순서 변경
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(formList);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFormList(items);
  };

  const handleConfirm = () => {
    console.log("[TimelineEditor] 타임라인 삽입 가동");
    let snippet = `\n[TIMELINE]\n`;
    let count = 0;
    formList.forEach(f => {
      if (f.date || f.title || f.desc) {
        snippet += `${f.date}::::${f.title}::::${f.desc.replace(/\n/g, '<br>')}\n`;
        count++;
      }
    });
    snippet += `[/TIMELINE]\n`;
    if (count === 0) return alert("내용을 하나 이상 입력해야 합니다.");
    onInsert(snippet);
  };

  return (
    <>
      <div className={styles.modalBody}>
        <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>사건을 시간 순서대로 작성하세요. <b>(☰)</b> 버튼을 끌어올려 순서를 바꿀 수 있습니다.</p>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="timeline-list">
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '5px', marginBottom: '15px' }}
              >
                {formList.map((f, i) => (
                  <Draggable key={f.id} draggableId={f.id} index={i}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef} 
                        {...provided.draggableProps} 
                        style={{ 
                          ...provided.draggableProps.style,
                          display: 'flex', gap: '10px', background: 'var(--bg-color)', padding: '12px', border: '1px solid var(--border-color)', 
                          borderRadius: '8px', alignItems: 'flex-start',
                          boxShadow: snapshot.isDragging ? '0 5px 15px rgba(0,0,0,0.1)' : 'none',
                          opacity: snapshot.isDragging ? 0.9 : 1
                        }}
                      >
                        <div {...provided.dragHandleProps} style={{ fontSize: '20px', color: 'var(--text-secondary)', cursor: 'grab', paddingTop: '5px' }}>☰</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input className={styles.toolInput} style={{ width: '140px', flex: 'none', fontWeight: 'bold' }} value={f.date} onChange={(e) => { const n = [...formList]; n[i].date = e.target.value; setFormList(n); }} placeholder="날짜 (예: 2026.06.27)" />
                            <input className={styles.toolInput} style={{ flex: 1, fontWeight: 'bold' }} value={f.title} onChange={(e) => { const n = [...formList]; n[i].title = e.target.value; setFormList(n); }} placeholder="사건 제목" />
                          </div>
                          <textarea className={styles.toolInput} style={{ resize: 'vertical', minHeight: '40px' }} value={f.desc} onChange={(e) => { const n = [...formList]; n[i].desc = e.target.value; setFormList(n); }} placeholder="사건 상세 내용" />
                        </div>
                        <button style={{ border: 'none', background: 'transparent', color: '#e53e3e', fontSize: '16px', cursor: 'pointer', padding: '5px' }} onClick={() => { const n = [...formList]; n.splice(i, 1); setFormList(n); }}>✖</button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <button type="button" className="wiki-btn" onClick={() => setFormList([...formList, { id: `tl-${Date.now()}`, date: '', title: '', desc: '' }])} style={{ width: '100%', border: '1px dashed var(--primary-color)', background: 'transparent', color: 'var(--primary-color)', padding: '12px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}>
          + 새로운 사건 추가
        </button>
      </div>
      <div className={styles.modalFooter}>
        <button className={styles.cancelBtn} onClick={onCancel}>취소</button>
        <button className={styles.confirmBtn} onClick={handleConfirm}>에디터에 삽입</button>
      </div>
    </>
  );
};