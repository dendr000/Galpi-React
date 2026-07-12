// 파일 위치: src/components/fab/MemoEditor.jsx
// 기능 요약: ContentEditable 기반의 편집기 뼈대 구현, 단축키 처리(Ctrl+S, Ctrl+A 격리모드), 툴바 서식 주입, 표 제어, 찾아바꾸기 엔진

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../api/axiosCore';
import styles from './FabMemoWidget.module.css';

const MemoEditor = ({ activeMemo, memoData, setMemoData, currentFolder }) => {
  console.log("[MemoEditor] 에디터 코어 마운트 완료. 연결된 메모 ID:", activeMemo?.id);
  
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const titleRef = useRef(null);
  
  const [charCount, setCharCount] = useState({ selected: 0, total: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [tableCtrlVisible, setTableCtrlVisible] = useState(false);
  const [findReplaceVisible, setFindReplaceVisible] = useState(false);
  const activeCellRef = useRef(null);
  
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");

  // 1. 메모 로드 시 에디터 초기화
  useEffect(() => {
    if (!activeMemo) return;
    if (titleRef.current) titleRef.current.value = activeMemo.title || '';
    if (editorRef.current) {
      console.log(`[MemoEditor] 메모 내용 주입 (ID: ${activeMemo.id})`);
      let content = activeMemo.content || "";
      // 레거시 일반 텍스트 자동 HTML 줄바꿈 치환 로직
      if (!content.includes('<div') && !content.includes('<br') && !content.includes('<p>') && content.includes('\n')) {
        content = content.replace(/\n/g, '<br>');
      }
      editorRef.current.innerHTML = content;
      updateCharCount();
    }
    setTableCtrlVisible(false);
    setFindReplaceVisible(false);
  }, [activeMemo?.id]);

  // 2. 글자 수 갱신 로직
  const updateCharCount = () => {
    if (!editorRef.current) return;
    const total = editorRef.current.innerText.replace(/\n/g, '').length;
    const selection = window.getSelection();
    const selected = selection.toString().length;
    
    if (selected > 0 && editorRef.current.contains(selection.anchorNode)) {
      setCharCount({ selected, total });
    } else {
      setCharCount({ selected: 0, total });
    }
  };

  // 3. 서버 동기화 및 저장 로직 (Ctrl+S & 저장 버튼)
  const saveMemo = async () => {
    if (!activeMemo || !titleRef.current || !editorRef.current) return;
    const title = titleRef.current.value.trim();
    const content = editorRef.current.innerHTML;
    
    if (!title) return alert("메모 제목을 입력해주세요.");
    console.log("[MemoEditor] 서버 데이터 동기화 연산 개시");

    const folder = activeMemo.folder || (currentFolder === "전체 메모" ? "기타" : currentFolder);
    const memoPayload = { 
      id: activeMemo.id, title, content, folder, 
      updatedAt: Date.now(), sortOrder: activeMemo.sortOrder || -1 
    };

    try {
      const isEdit = !String(activeMemo.id).startsWith("local_") && String(activeMemo.id).length < 13;
      const url = isEdit ? `/api/memos/${activeMemo.id}` : '/api/memos';
      const method = isEdit ? 'put' : 'post';

      const response = await api[method](url, memoPayload);
      if (!isEdit && response.data?.id) memoPayload.id = response.data.id; // DB ID 매핑
    } catch (error) {
      console.warn("[MemoEditor] API 통신 무효화. 오프라인 로컬 저장만 진행합니다.");
    }

    const newData = memoData.map(m => String(m.id) === String(activeMemo.id) ? memoPayload : m);
    setMemoData(newData);
    localStorage.setItem('galpi-memos', JSON.stringify(newData));

    // 시각적 피드백
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  // 4. 단축키 방어 (Ctrl+S, Ctrl+A 가상 격리 모드)
  const handleEditorKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault(); e.stopPropagation();
      saveMemo();
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
      e.preventDefault(); e.stopPropagation();
      console.log("[MemoEditor] 다중 선택 한계 돌파를 위한 가상 격리 모드(Grayscale) 가동");
      const editor = editorRef.current;
      editor.classList.add('galpi-outer-select');
      const range = document.createRange();
      range.selectNodeContents(editor);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      updateCharCount();
    }
  };

  // 5. 클린 복사 이벤트 가로채기 (특수 컨테이너 삭제)
  const handleCopy = (e) => {
    const editor = editorRef.current;
    if (editor && editor.classList.contains('galpi-outer-select')) {
      e.preventDefault();
      console.log("[MemoEditor] 가상 격리 상태 감지. 내부 UI용 껍데기 태그를 삭제하고 클린 텍스트만 클립보드에 추출합니다.");
      
      const clone = editor.cloneNode(true);
      const ignores = clone.querySelectorAll('[contenteditable="false"]');
      ignores.forEach(el => el.remove());
      
      clone.style.position = 'absolute'; clone.style.left = '-9999px';
      document.body.appendChild(clone);
      
      const cleanText = clone.innerText;
      const cleanHTML = clone.innerHTML;
      document.body.removeChild(clone);

      e.clipboardData.setData('text/plain', cleanText);
      e.clipboardData.setData('text/html', cleanHTML);
      
      editor.classList.remove('galpi-outer-select');
      window.getSelection().collapseToEnd();
    }
  };

  // 6. 에디터 이벤트 트래킹 (표 감지 등)
  const checkTableFocus = () => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0 && editorRef.current) {
      let node = sel.anchorNode;
      if (node && node.nodeType === 3) node = node.parentNode;
      
      if (node && editorRef.current.contains(node)) {
        const cell = node.closest('td, th');
        if (cell) {
          activeCellRef.current = cell;
          setTableCtrlVisible(true);
          setFindReplaceVisible(false);
          updateCharCount();
          return;
        }
      }
    }
    activeCellRef.current = null;
    setTableCtrlVisible(false);
    updateCharCount();
  };

  // 7. 서식 주입 엔진 (document.execCommand 사용)
  const executeCmd = (cmd) => {
    editorRef.current.focus();
    document.execCommand(cmd, false, null);
    updateCharCount();
  };

  const insertHtml = (htmlContent) => {
    editorRef.current.focus();
    document.execCommand('insertHTML', false, htmlContent);
    updateCharCount();
  };

  // 8. 정밀 트리워커 기반 찾아 바꾸기 연산
  const executeFindReplace = () => {
    console.log(`[MemoEditor] 일괄 치환 가동: '${findText}' -> '${replaceText}'`);
    if (!findText) return alert("찾을 내용을 입력하세요.");
    if (!editorRef.current) return;

    let repHtml = replaceText.replace(/\\n/g, '<br>');
    const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) textNodes.push(node);
    
    let changed = false;
    textNodes.forEach(textNode => {
      if (textNode.nodeValue.includes(findText)) {
        const parts = textNode.nodeValue.split(findText);
        const fragment = document.createDocumentFragment();
        
        parts.forEach((part, index) => {
          fragment.appendChild(document.createTextNode(part));
          if (index < parts.length - 1) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = repHtml;
            while(tempDiv.firstChild) { fragment.appendChild(tempDiv.firstChild); }
          }
        });
        textNode.parentNode.replaceChild(fragment, textNode);
        changed = true;
      }
    });
    
    if (changed) {
      updateCharCount();
      alert("일괄 변경이 완료되었습니다.");
    } else {
      alert("일치하는 내용을 찾을 수 없습니다.");
    }
  };

  // 9. 표 컨트롤 로직
  const addTableRowBelow = () => {
    if (!activeCellRef.current) return;
    const tr = activeCellRef.current.closest('tr');
    const newTr = document.createElement('tr');
    Array.from(tr.children).forEach(c => {
      const td = document.createElement('td');
      td.style.cssText = c.style.cssText;
      td.innerHTML = '<br>'; 
      newTr.appendChild(td);
    });
    tr.parentNode.insertBefore(newTr, tr.nextSibling);
    updateCharCount();
  };

  const addTableColRight = () => {
    if (!activeCellRef.current) return;
    const tr = activeCellRef.current.closest('tr');
    const table = activeCellRef.current.closest('table');
    const cellIdx = Array.from(tr.children).indexOf(activeCellRef.current);
    
    table.querySelectorAll('tr').forEach(row => {
      const refCell = row.children[cellIdx];
      if (refCell) {
        const newCell = document.createElement(refCell.tagName);
        newCell.style.cssText = refCell.style.cssText;
        newCell.innerHTML = '<br>';
        row.insertBefore(newCell, refCell.nextSibling);
      }
    });
    updateCharCount();
  };

  const delTableRow = () => {
    if (!activeCellRef.current) return;
    const tr = activeCellRef.current.closest('tr');
    if (tr.parentNode.children.length <= 1) return alert("표에는 최소 1개의 행이 남아있어야 합니다.");
    tr.remove(); setTableCtrlVisible(false); activeCellRef.current = null; updateCharCount();
  };

  const delTableCol = () => {
    if (!activeCellRef.current) return;
    const tr = activeCellRef.current.closest('tr');
    const table = activeCellRef.current.closest('table');
    const cellIdx = Array.from(tr.children).indexOf(activeCellRef.current);
    
    if (tr.children.length <= 1) return alert("표에는 최소 1개의 열이 남아있어야 합니다.");
    table.querySelectorAll('tr').forEach(row => { if (row.children[cellIdx]) row.children[cellIdx].remove(); });
    setTableCtrlVisible(false); activeCellRef.current = null; updateCharCount();
  };

  // HTML 매크로 블록 정의
  const tableHTML = `<div style="position:relative; margin:15px 0; border:1px solid transparent; padding-top:15px;" contenteditable="false"><button type="button" onclick="this.parentElement.remove()" style="position:absolute; top:0; right:0; background:#e53e3e; color:white; border:none; border-radius:4px; padding:2px 8px; cursor:pointer; font-size:10px; font-weight:bold;">❌ 표 완전히 지우기</button><table contenteditable="true" style="width:100%; border-collapse:collapse; text-align:center; font-size:13px; background:var(--surface-color); table-layout:auto;"><tbody><tr><th style="border:1px solid var(--border-color); padding:10px; background:var(--table-bg-alt); color:var(--primary-color); min-width:60px;">제목1</th><th style="border:1px solid var(--border-color); padding:10px; background:var(--table-bg-alt); color:var(--primary-color); min-width:60px;">제목2</th></tr><tr><td style="border:1px solid var(--border-color); padding:10px; min-width:60px;">내용1</td><td style="border:1px solid var(--border-color); padding:10px; min-width:60px;">내용2</td></tr></tbody></table></div><div><br></div>`;
  const checkHTML = `<div style="display:flex; align-items:center; gap:8px; margin:4px 0;" contenteditable="false"><button type="button" onclick="this.parentElement.remove()" style="background:transparent; color:#e53e3e; border:none; cursor:pointer; font-size:14px; padding:0; outline:none;" title="삭제">✖</button><input type="checkbox" style="cursor:pointer; width:16px; height:16px;" onchange="this.nextElementSibling.style.textDecoration = this.checked ? 'line-through' : 'none'; this.nextElementSibling.style.color = this.checked ? 'var(--text-secondary)' : 'var(--text-primary)';"><span contenteditable="true" style="outline:none; flex:1; font-size:13px; min-width:50px;">할 일 입력...</span></div>`;
  const foldHTML = `<div style="position:relative; margin:15px 0; padding-top:15px;" contenteditable="false"><button type="button" onclick="this.parentElement.remove()" style="position:absolute; top:0; right:0; background:#e53e3e; color:white; border:none; border-radius:4px; padding:2px 8px; cursor:pointer; font-size:10px; font-weight:bold; z-index:10;">❌ 박스 삭제</button><details style="border: 1px solid var(--border-color); border-radius: 8px; background: var(--table-bg-alt); overflow: hidden; font-size:13px;"><summary style="padding: 10px 15px; font-weight: 900; cursor: pointer; color: var(--primary-color); outline: none; list-style:none;"><span>▶</span> <span contenteditable="true" style="outline:none;">펼쳐보기 (클릭하여 제목 수정)</span></summary><div contenteditable="true" style="padding: 15px; border-top: 1px dashed var(--border-color); line-height: 1.6; background: var(--surface-color); outline:none;">숨길 내용을 입력하세요...</div></details></div><div><br></div>`;

  if (!activeMemo) {
    return <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)', fontWeight: 'bold' }}>좌측에서 메모를 선택하거나 생성하세요.</div>;
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-color)' }}>
      {/* A. 에디터 헤더 (제목 및 버튼) */}
      <div className="memo-editor-header" style={{ display: 'flex', padding: '15px 20px', borderBottom: '1px solid var(--border-color)', gap: '10px', alignItems: 'center', background: 'var(--surface-color)' }}>
        <input 
          ref={titleRef} type="text" placeholder="메모 제목" 
          style={{ flex: 1, fontSize: '18px', fontWeight: '900', border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none' }}
          onKeyDown={handleEditorKeyDown}
        />
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold', marginRight: '10px' }} id="memo-char-count">
          {charCount.selected > 0 ? `${charCount.selected} / ${charCount.total}` : `0 / ${charCount.total}`}
        </div>
        
        {/* 요청하신 페이지 이동 버튼 추가 */}
        <button 
          className="memo-btn" title="메모 페이지로 이동"
          style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
          onClick={() => navigate('/memo')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </button>
        
        {/* 저장 버튼 (문자열 길이 고정 피드백) */}
        <button 
          onClick={saveMemo} 
          style={{ background: isSaving ? '#10b981' : 'var(--primary-color)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', width: isSaving ? '90px' : 'auto', whiteSpace: 'nowrap' }}
        >
          {isSaving ? "✅ 저장됨" : "💾 저장"}
        </button>
      </div>

      {/* B. 서식 제어 툴바 (Format Bar) */}
      <div id="memo-format-bar" style={{ display: 'flex', flexDirection: 'column', width: '100%', background: 'var(--table-bg-alt)', borderBottom: '1px solid var(--border-color)', userSelect: 'none', padding: '6px 10px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="wiki-btn" onClick={() => executeCmd('bold')} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>B</button>
          <button className="wiki-btn" onClick={() => executeCmd('italic')} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>I</button>
          <button className="wiki-btn" onClick={() => executeCmd('strikeThrough')} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>S</button>
          <button className="wiki-btn" onClick={() => insertHtml(tableHTML)} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>📊 표 삽입</button>
          <button className="wiki-btn" onClick={() => insertHtml(checkHTML)} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>☑️ 할 일</button>
          <button className="wiki-btn" onClick={() => insertHtml(foldHTML)} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>▼ 접기 박스</button>
          <button className="wiki-btn" onClick={() => { setFindReplaceVisible(!findReplaceVisible); setTableCtrlVisible(false); }} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>🔍 찾기/바꾸기</button>
        </div>

        {/* 표 전용 컨트롤러 */}
        {tableCtrlVisible && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', width: '100%' }}>
            <button className="wiki-btn" onClick={addTableRowBelow} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>➕ 아래에 행 추가</button>
            <button className="wiki-btn" onClick={addTableColRight} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>➕ 우측에 열 추가</button>
            <button className="wiki-btn" onClick={delTableRow} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: '#e53e3e', border: '1px solid rgba(229,62,62,0.3)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>➖ 현재 행 삭제</button>
            <button className="wiki-btn" onClick={delTableCol} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: '#e53e3e', border: '1px solid rgba(229,62,62,0.3)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>➖ 현재 열 삭제</button>
          </div>
        )}

        {/* 찾아 바꾸기 엔진 */}
        {findReplaceVisible && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', width: '100%' }}>
            <input type="text" placeholder="찾을 내용" value={findText} onChange={e => setFindText(e.target.value)} style={{ padding: '4px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: '4px', flex: 1, outline: 'none' }} />
            <input type="text" placeholder="바꿀 내용 (\n 줄바꿈 적용)" value={replaceText} onChange={e => setReplaceText(e.target.value)} style={{ padding: '4px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: '4px', flex: 1, outline: 'none' }} />
            <button className="wiki-btn" onClick={executeFindReplace} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>일괄 변경</button>
          </div>
        )}
      </div>

      {/* C. 순수 ContentEditable 에디터 코어 본문 */}
      <div 
        id="memo-edit-content"
        ref={editorRef}
        contentEditable="true"
        spellCheck="false"
        style={{ flex: 1, overflowY: 'auto', outline: 'none', padding: '20px', background: 'var(--bg-color)', fontSize: '14px', lineHeight: 1.6, color: 'var(--text-primary)' }}
        onInput={updateCharCount}
        onMouseUp={(e) => { checkTableFocus(); updateCharCount(); }}
        onKeyUp={(e) => { checkTableFocus(); updateCharCount(); }}
        onKeyDown={handleEditorKeyDown}
        onCopy={handleCopy}
      />
    </div>
  );
};

export default MemoEditor;