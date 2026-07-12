import React, { useState, useRef } from 'react';
import styles from './MacroToolbar.module.css';

const MACRO_TOOLS = [
  { id: 'table', icon: 'table.svg', tooltip: '엑셀형 표 생성/편집기' },
  { id: 'bar', icon: 'barGraph.svg', tooltip: '상태창 게이지 바 에디터' },
  { id: 'radar', icon: 'radarChart.svg', tooltip: '방사형 스탯 차트 에디터' },
  { id: 'timeline', icon: 'timeline.svg', tooltip: '타임라인(연표)' },
  { id: 'relation', icon: 'relation.svg', tooltip: '비주얼 인물 관계도 캔버스' }
];

const MacroToolbar = ({ editorRef, onInsert }) => {
  const [activeTool, setActiveTool] = useState(null);
  const [formList, setFormList] = useState([]);
  
  // 표 생성기용 2D 배열 상태 (모달 내부 편집 지원)
  const [tableData, setTableData] = useState([['제목 1', '제목 2'], ['내용 1', '내용 2']]);

  // 다이어그램 에디터 (Relation) 상태
  const [diagNodes, setDiagNodes] = useState([]);
  const [diagEdges, setDiagEdges] = useState([]);
  const [diagPan, setDiagPan] = useState({ x: 0, y: 0, zoom: 1.0 });
  const [diagSelectedNode, setDiagSelectedNode] = useState(null);
  const [diagSelectedEdge, setDiagSelectedEdge] = useState(null);
  const [diagLinkingSource, setDiagLinkingSource] = useState(null);
  const [diagInputName, setDiagInputName] = useState("");

  const svgRef = useRef(null);
  const dragState = useRef({ isPanning: false, startX: 0, startY: 0, isDraggingNode: false, nodeId: null, offX: 0, offY: 0 });
  const tlDragItem = useRef(null);

  const handleOpenModal = (tool) => {
    setActiveTool(tool);
    if (tool.id === 'radar') setFormList([{ label: '근력', val: 80 }, { label: '민첩', val: 60 }, { label: '지능', val: 90 }]);
    else if (tool.id === 'bar') setFormList([{ label: '체력', val: 50, max: 100 }]);
    else if (tool.id === 'timeline') setFormList([{ date: '', title: '', desc: '' }]);
    else if (tool.id === 'table') setTableData([['제목 1', '제목 2'], ['내용 1', '내용 2']]);
    else if (tool.id === 'relation') {
      setDiagNodes([{ id: 'n1', label: '테스트', x: 200, y: 200, shape: 'circle' }, { id: 'n2', label: '테스트2', x: 400, y: 200, shape: 'rect' }]);
      setDiagEdges([{ source: 'n1', target: 'n2', type: '->', desc: '관계' }]);
      setDiagPan({ x: 0, y: 0, zoom: 1.0 });
      setDiagSelectedNode(null); setDiagSelectedEdge(null); setDiagLinkingSource(null);
    }
  };

  const handleCloseModal = () => {
    setActiveTool(null);
  };

  const handleConfirmInsert = () => {
    if (!editorRef.current || !activeTool) return;
    let snippet = "";

    if (activeTool.id === 'table') {
      snippet = "\n";
      tableData.forEach(row => {
        snippet += "|| " + row.map(c => c || " ").join(" || ") + " ||\n";
      });
      snippet += "\n";
    } 
    else if (activeTool.id === 'radar') {
      const valid = formList.filter(f => f.label.trim() !== "");
      if (valid.length < 3) return alert("스탯 항목은 최소 3개 이상이어야 합니다.");
      snippet = `\n[스탯: ${valid.map(f => `${f.label}=${f.val}`).join(', ')}]\n`;
    } 
    else if (activeTool.id === 'bar') {
      const valid = formList.filter(f => f.label.trim() !== "");
      if (valid.length === 0) return alert("게이지 항목을 입력해주세요.");
      snippet = `\n[게이지: ${valid.map(f => `${f.label}=${f.val}/${f.max}`).join(', ')}]\n`;
    } 
    else if (activeTool.id === 'timeline') {
      snippet = `\n[TIMELINE]\n`;
      let count = 0;
      formList.forEach(f => {
        if (f.date || f.title || f.desc) {
          snippet += `${f.date}::::${f.title}::::${f.desc.replace(/\n/g, '<br>')}\n`;
          count++;
        }
      });
      snippet += `[/TIMELINE]\n`;
      if (count === 0) return alert("내용을 하나 이상 입력해야 합니다.");
    } 
    else if (activeTool.id === 'relation') {
      if (diagNodes.length === 0) return alert("배치된 인물 오브젝트가 존재하지 않습니다.");
      let minX = Math.min(...diagNodes.map(n => n.x));
      let maxX = Math.max(...diagNodes.map(n => n.x));
      let minY = Math.min(...diagNodes.map(n => n.y));
      let maxY = Math.max(...diagNodes.map(n => n.y));

      let offX = minX < 45 ? 45 - minX : 0;
      let offY = minY < 45 ? 45 - minY : 0;
      
      const fixedNodes = diagNodes.map(n => ({ ...n, x: n.x + offX, y: n.y + offY }));
      const payload = {
        width: Math.floor(Math.max(720, maxX + offX + 100)),
        height: Math.floor(Math.max(380, maxY + offY + 100)),
        nodes: fixedNodes,
        edges: diagEdges
      };
      snippet = `\n[RELATION_GRAPH]\n${JSON.stringify(payload)}\n[/RELATION_GRAPH]\n`;
    }

    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    
    onInsert(currentText.substring(0, start) + snippet + currentText.substring(end), start + snippet.length);
    handleCloseModal();
  };

  /* ================== 타임라인 DND 엔진 ================== */
  const handleTlDragStart = (e, idx) => {
    tlDragItem.current = idx;
    e.currentTarget.style.opacity = '0.5';
  };
  const handleTlDragEnter = (e, idx) => {
    e.preventDefault();
    if (tlDragItem.current === null || tlDragItem.current === idx) return;
    const newList = [...formList];
    const dragItem = newList.splice(tlDragItem.current, 1)[0];
    newList.splice(idx, 0, dragItem);
    tlDragItem.current = idx;
    setFormList(newList);
  };
  const handleTlDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    tlDragItem.current = null;
  };

  /* ================== 다이어그램 물리 엔진 ================== */
  const addDiagNode = (shape) => {
    if (!diagInputName.trim()) return alert("명칭을 입력하세요.");
    const id = "n_" + Date.now();
    const cx = (300 - diagPan.x) / diagPan.zoom;
    const cy = (200 - diagPan.y) / diagPan.zoom;
    setDiagNodes([...diagNodes, { id, label: diagInputName, shape, x: cx + Math.random()*20, y: cy + Math.random()*20 }]);
    setDiagInputName("");
  };

  const handleDiagWheel = (e) => {
    e.preventDefault();
    setDiagPan(p => ({ ...p, zoom: Math.max(0.3, Math.min(3.0, p.zoom + (e.deltaY < 0 ? 0.05 : -0.05))) }));
  };

  const handleDiagMouseDown = (e) => {
    if (e.target.tagName === 'svg') {
      dragState.current = { isPanning: true, startX: e.clientX - diagPan.x, startY: e.clientY - diagPan.y };
    }
  };

  const handleNodeMouseDown = (e, id) => {
    e.stopPropagation();
    const svgRect = svgRef.current.getBoundingClientRect();
    const node = diagNodes.find(n => n.id === id);
    const rawX = (e.clientX - svgRect.left - diagPan.x) / diagPan.zoom;
    const rawY = (e.clientY - svgRect.top - diagPan.y) / diagPan.zoom;
    dragState.current = { isDraggingNode: true, nodeId: id, offX: rawX - node.x, offY: rawY - node.y };
  };

  const handleDiagMouseMove = (e) => {
    if (dragState.current.isPanning) {
      setDiagPan(p => ({ ...p, x: e.clientX - dragState.current.startX, y: e.clientY - dragState.current.startY }));
    } else if (dragState.current.isDraggingNode) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const rawX = (e.clientX - svgRect.left - diagPan.x) / diagPan.zoom;
      const rawY = (e.clientY - svgRect.top - diagPan.y) / diagPan.zoom;
      setDiagNodes(nodes => nodes.map(n => n.id === dragState.current.nodeId ? { ...n, x: rawX - dragState.current.offX, y: rawY - dragState.current.offY } : n));
    }
  };

  const handleDiagMouseUp = (e) => {
    dragState.current = { isPanning: false, isDraggingNode: false, nodeId: null };
    if (diagLinkingSource) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const mx = (e.clientX - svgRect.left - diagPan.x) / diagPan.zoom;
      const my = (e.clientY - svgRect.top - diagPan.y) / diagPan.zoom;
      const target = diagNodes.find(n => Math.sqrt((n.x - mx)**2 + (n.y - my)**2) < 45);
      if (target && target.id !== diagLinkingSource) {
        const dup = diagEdges.some(eg => (eg.source === diagLinkingSource && eg.target === target.id) || (eg.source === target.id && eg.target === diagLinkingSource));
        if (!dup) setDiagEdges([...diagEdges, { source: diagLinkingSource, target: target.id, type: '->', desc: '', descRev: '' }]);
      }
      setDiagLinkingSource(null);
    }
  };

  /* ================== 모달 내부 UI 렌더러 ================== */
  const renderModalBody = () => {
    if (!activeTool) return null;

    if (activeTool.id === 'table') {
      return (
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '15px' }}>
            <button className="wiki-btn" onClick={() => { if (tableData.length > 1) setTableData(tableData.slice(0, -1)); }}>- 행 삭제</button>
            <span style={{ fontWeight: 'bold' }}>{tableData.length}행 x {tableData[0].length}열</span>
            <button className="wiki-btn" onClick={() => setTableData([...tableData, new Array(tableData[0].length).fill('')])}>+ 행 추가</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
            <button className="wiki-btn" onClick={() => { if (tableData[0].length > 1) setTableData(tableData.map(row => row.slice(0, -1))); }}>- 열 삭제</button>
            <button className="wiki-btn" onClick={() => setTableData(tableData.map(row => [...row, '']))}>+ 열 추가</button>
          </div>
          <div style={{ overflowX: 'auto', paddingBottom: '10px' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <tbody>
                {tableData.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td key={c} style={{ border: '1px solid var(--border-color)', padding: '4px' }}>
                        <input
                          className={styles.toolInput}
                          style={{ width: '100px', minWidth: '80px', textAlign: 'center', fontWeight: r === 0 ? 'bold' : 'normal', background: r === 0 ? 'var(--table-bg-alt)' : 'var(--bg-color)' }}
                          value={cell}
                          onChange={(e) => {
                            const newData = [...tableData];
                            newData[r][c] = e.target.value;
                            setTableData(newData);
                          }}
                          placeholder={r === 0 ? '제목' : '내용'}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '20px' }}>※ 첫 번째 줄은 굵은 제목 행으로 자동 처리됩니다.</p>
        </div>
      );
    }

    if (activeTool.id === 'radar') {
      return (
        <>
          <p style={{ margin: '0', fontSize: '13px', color: 'var(--text-secondary)' }}>스탯 이름과 수치(0~100)를 입력하세요. (최소 3개)</p>
          {formList.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input className={styles.toolInput} value={f.label} onChange={(e) => { const n = [...formList]; n[i].label = e.target.value; setFormList(n); }} placeholder="스탯명" />
              <input className={styles.toolInput} style={{ flex: 'none', width: '80px', textAlign: 'center' }} type="number" min="0" max="100" value={f.val} onChange={(e) => { const n = [...formList]; n[i].val = e.target.value; setFormList(n); }} placeholder="수치" />
              <button style={{ border: 'none', background: 'transparent', color: '#e53e3e', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => { const n = [...formList]; n.splice(i, 1); setFormList(n); }}>✖</button>
            </div>
          ))}
          <button className={styles.addBtn} onClick={() => setFormList([...formList, { label: '', val: 50 }])}>+ 스탯 추가</button>
        </>
      );
    }

    if (activeTool.id === 'bar') {
      return (
        <>
          <p style={{ margin: '0', fontSize: '13px', color: 'var(--text-secondary)' }}>항목명과 현재/최대 수치를 입력하세요.</p>
          {formList.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input className={styles.toolInput} value={f.label} onChange={(e) => { const n = [...formList]; n[i].label = e.target.value; setFormList(n); }} placeholder="항목명" />
              <input className={styles.toolInput} style={{ flex: 'none', width: '60px', textAlign: 'center' }} type="number" value={f.val} onChange={(e) => { const n = [...formList]; n[i].val = e.target.value; setFormList(n); }} />
              <span style={{ fontWeight: 'bold' }}>/</span>
              <input className={styles.toolInput} style={{ flex: 'none', width: '60px', textAlign: 'center' }} type="number" value={f.max} onChange={(e) => { const n = [...formList]; n[i].max = e.target.value; setFormList(n); }} />
              <button style={{ border: 'none', background: 'transparent', color: '#e53e3e', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => { const n = [...formList]; n.splice(i, 1); setFormList(n); }}>✖</button>
            </div>
          ))}
          <button className={styles.addBtn} onClick={() => setFormList([...formList, { label: '', val: 50, max: 100 }])}>+ 항목 추가</button>
        </>
      );
    }

    if (activeTool.id === 'timeline') {
      return (
        <>
          <p style={{ margin: '0', fontSize: '13px', color: 'var(--text-secondary)' }}>사건을 시간 순서대로 작성하세요. <b>(☰)</b> 버튼을 끌어올려 순서를 바꿀 수 있습니다.</p>
          <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {formList.map((f, i) => (
              <div key={i} className={styles.tlItem} draggable onDragStart={(e) => handleTlDragStart(e, i)} onDragEnter={(e) => handleTlDragEnter(e, i)} onDragEnd={handleTlDragEnd} onDragOver={(e) => e.preventDefault()}>
                <div className={styles.tlDragHandle}>☰</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input className={styles.toolInput} style={{ width: '140px', flex: 'none', fontWeight: 'bold' }} value={f.date} onChange={(e) => { const n = [...formList]; n[i].date = e.target.value; setFormList(n); }} placeholder="날짜 (예: 2026.06.27)" />
                    <input className={styles.toolInput} style={{ fontWeight: 'bold' }} value={f.title} onChange={(e) => { const n = [...formList]; n[i].title = e.target.value; setFormList(n); }} placeholder="사건 제목" />
                  </div>
                  <textarea className={styles.toolInput} style={{ resize: 'vertical', height: '60px' }} value={f.desc} onChange={(e) => { const n = [...formList]; n[i].desc = e.target.value; setFormList(n); }} placeholder="사건 상세 내용 (마지막 칸에서 Tab 누르면 새 사건 추가)" onKeyDown={(e) => { if (e.key === 'Tab' && i === formList.length - 1) { e.preventDefault(); setFormList([...formList, { date: '', title: '', desc: '' }]); } }} />
                </div>
                <button style={{ border: 'none', background: 'transparent', color: '#e53e3e', fontSize: '16px', cursor: 'pointer', padding: '5px' }} onClick={() => { const n = [...formList]; n.splice(i, 1); setFormList(n); }}>✖</button>
              </div>
            ))}
          </div>
          <button className={styles.addBtn} onClick={() => setFormList([...formList, { date: '', title: '', desc: '' }])}>+ 새로운 사건 추가</button>
        </>
      );
    }

    if (activeTool.id === 'relation') {
      return (
        <div style={{ display: 'flex', gap: '15px', height: '70vh', minHeight: '500px', userSelect: 'none' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--table-bg-alt)', padding: '8px 12px', borderRadius: '6px' }}>
              <input className={styles.toolInput} style={{ width: '160px', flex: 'none' }} placeholder="명칭 입력" value={diagInputName} onChange={e => setDiagInputName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addDiagNode('circle')} />
              <button className="wiki-btn" style={{ background: 'var(--primary-color)', color: 'white' }} onClick={() => addDiagNode('circle')}>○ 원형 추가</button>
              <button className="wiki-btn" style={{ background: 'var(--text-secondary)', color: 'white' }} onClick={() => addDiagNode('rect')}>□ 사각형 추가</button>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: 'auto', fontWeight: 'bold' }}>💡 배경 드래그(이동) / 스크롤(줌)</span>
            </div>
            
            <div className={styles.diagramBoard} onWheel={handleDiagWheel} onMouseDown={handleDiagMouseDown} onMouseMove={handleDiagMouseMove} onMouseUp={handleDiagMouseUp} onClick={() => { setDiagSelectedNode(null); setDiagSelectedEdge(null); }}>
              <svg ref={svgRef} width="100%" height="100%" style={{ display: 'block', overflow: 'visible', cursor: dragState.current.isPanning ? 'grabbing' : 'grab' }}>
                <defs>
                  <marker id="m-arr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto-start-reverse"><path d="M 0 0 L 8 4 L 0 8 z" fill="var(--text-secondary)"/></marker>
                  <marker id="m-arr-act" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto-start-reverse"><path d="M 0 0 L 8 4 L 0 8 z" fill="#e53e3e"/></marker>
                  <filter id="m-shadv"><feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1"/></filter>
                </defs>
                <g transform={`translate(${diagPan.x}, ${diagPan.y}) scale(${diagPan.zoom})`}>
                  
                  {/* 간선(Edges) 렌더링 */}
                  {diagEdges.map((e, idx) => {
                    const n1 = diagNodes.find(n => n.id === e.source);
                    const n2 = diagNodes.find(n => n.id === e.target);
                    if (!n1 || !n2) return null;
                    const dx = n2.x - n1.x; const dy = n2.y - n1.y; const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist === 0) return null;
                    const R = 35;
                    const x1 = n1.x + (dx * R / dist); const y1 = n1.y + (dy * R / dist);
                    const x2 = n2.x - (dx * R / dist); const y2 = n2.y - (dy * R / dist);
                    const isSel = diagSelectedEdge === idx;
                    const stroke = isSel ? '#e53e3e' : (e.type === '<->' ? 'var(--primary-color)' : 'var(--text-secondary)');
                    const strokeW = isSel || e.type === '<->' ? '2.5' : '1.5';
                    const mEnd = isSel ? 'url(#m-arr-act)' : 'url(#m-arr)';

                    let angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
                    if (angle > 90 || angle < -90) angle += 180;
                    const cx = (x1 + x2) / 2; const cy = (y1 + y2) / 2;
                    const tw = (e.desc?.length || 0) * 10 + 12;

                    return (
                      <g key={idx} style={{ cursor: 'pointer' }} onClick={(ev) => { ev.stopPropagation(); setDiagSelectedEdge(idx); setDiagSelectedNode(null); }}>
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={strokeW} markerEnd={e.type !== '--' ? mEnd : ''} strokeDasharray={e.type === '--' ? '4,4' : ''} />
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth="15" />
                        {e.desc && (
                          <g transform={`rotate(${angle}, ${cx}, ${cy})`}>
                            <rect x={cx - tw/2} y={cy - 10} width={tw} height="20" fill="var(--surface-color)" rx="3" ry="3" stroke={stroke} />
                            <text x={cx} y={cy + 4} fill={stroke} fontSize="11" fontWeight="900" textAnchor="middle">{e.desc}</text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* 노드(Nodes) 렌더링 */}
                  {diagNodes.map(n => {
                    const isSel = diagSelectedNode === n.id;
                    const isLinkSrc = diagLinkingSource === n.id;
                    const fill = isSel ? 'var(--table-bg-alt)' : 'var(--surface-color)';
                    const stroke = isLinkSrc ? '#ff922b' : (isSel ? '#e53e3e' : (n.shape === 'rect' ? 'var(--text-secondary)' : 'var(--primary-color)'));

                    return (
                      <g key={n.id} transform={`translate(${n.x}, ${n.y})`} onMouseDown={(e) => handleNodeMouseDown(e, n.id)} onClick={(e) => { e.stopPropagation(); setDiagSelectedNode(n.id); setDiagSelectedEdge(null); }}>
                        {n.shape === 'rect' ? 
                          <rect x="-38" y="-18" width="76" height="36" fill={fill} stroke={stroke} strokeWidth={isSel?3:2} rx="5" filter="url(#m-shadv)" /> : 
                          <circle cx="0" cy="0" r="35" fill={fill} stroke={stroke} strokeWidth={isSel?3:2} filter="url(#m-shadv)" />}
                        <text x="0" y="4" fill="var(--text-primary)" fontSize="12" fontWeight="900" textAnchor="middle" pointerEvents="none">{n.label}</text>
                        <circle cx={n.shape==='rect'?38:35} cy="0" r="6" fill="#ff922b" stroke="#fff" strokeWidth="1.5" style={{ cursor: 'crosshair' }} onMouseDown={(e) => { e.stopPropagation(); setDiagLinkingSource(n.id); }} />
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          </div>

          <div className={styles.diagPanel}>
            {diagSelectedNode ? (
              <>
                <div style={{ fontWeight: 900, color: 'var(--primary-color)', borderBottom: '1px dashed var(--border-color)', paddingBottom: '5px' }}>📝 도형 속성 변경</div>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>명칭 수정</label>
                <input className={styles.toolInput} value={diagNodes.find(n => n.id === diagSelectedNode).label} onChange={e => setDiagNodes(nodes => nodes.map(n => n.id === diagSelectedNode ? { ...n, label: e.target.value } : n))} />
                <button className="wiki-btn" style={{ background: '#e53e3e', color: 'white', marginTop: 'auto' }} onClick={() => {
                  setDiagEdges(edges => edges.filter(e => e.source !== diagSelectedNode && e.target !== diagSelectedNode));
                  setDiagNodes(nodes => nodes.filter(n => n.id !== diagSelectedNode));
                  setDiagSelectedNode(null);
                }}>🗑️ 도형 삭제</button>
              </>
            ) : diagSelectedEdge !== null ? (
              <>
                <div style={{ fontWeight: 900, color: 'var(--primary-color)', borderBottom: '1px dashed var(--border-color)', paddingBottom: '5px' }}>⚙️ 연결선 설정</div>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>관계 기술 텍스트</label>
                <input className={styles.toolInput} value={diagEdges[diagSelectedEdge].desc} onChange={e => { const n = [...diagEdges]; n[diagSelectedEdge].desc = e.target.value; setDiagEdges(n); }} />
                <label style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '10px' }}>선 종류 결정</label>
                <select className={styles.toolInput} value={diagEdges[diagSelectedEdge].type} onChange={e => { const n = [...diagEdges]; n[diagSelectedEdge].type = e.target.value; setDiagEdges(n); }}>
                  <option value="->">단방향 화살표 (➔)</option>
                  <option value="<->">양방향 화살표 (⇄)</option>
                  <option value="--">종속/연결 점선 (╌)</option>
                </select>
                <button className="wiki-btn" style={{ background: '#e53e3e', color: 'white', marginTop: 'auto' }} onClick={() => {
                  const n = [...diagEdges]; n.splice(diagSelectedEdge, 1); setDiagEdges(n); setDiagSelectedEdge(null);
                }}>✖ 연결선 제거</button>
              </>
            ) : (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', paddingTop: '40px', fontWeight: 'bold' }}>도형이나 연결선을<br/>선택하면 이곳에<br/>설정창이 활성화됩니다.</div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div className={styles.sidebarToolbar}>
        {MACRO_TOOLS.map(tool => (
          <button key={tool.id} className={styles.toolBtn} onClick={() => handleOpenModal(tool)} type="button">
            <img src={`/img/svg/${tool.icon}`} alt="" onError={(e) => e.target.style.display = 'none'} />
            <span className={styles.toolTip}>{tool.tooltip}</span>
          </button>
        ))}
      </div>

      {activeTool && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} style={{ width: activeTool.id === 'relation' ? '1200px' : (activeTool.id === 'timeline' ? '500px' : 'max-content') }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{activeTool.tooltip} <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>(생성 모드)</span></h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}>&times;</button>
            </div>
            <div className={styles.modalBody}>
              {renderModalBody()}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCloseModal}>취소</button>
              <button className={styles.confirmBtn} onClick={handleConfirmInsert}>에디터에 삽입</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MacroToolbar;