// 파일 위치: src/pages/MemoWorkspace/WorkspaceEditorModal.jsx
// 기능 요약: 워크스페이스 전용 풀스크린 리치 텍스트 에디터 모달 컴포넌트
// 버전: v1.0.0

import React, { useState, useRef, useEffect } from 'react';
import api from '../../api/axiosCore';

const WorkspaceEditorModal = ({
  memos,
  setMemos,
  activeMemoId,
  editData,
  setEditData,
  folders,
  currentFolder,
  setIsEditorOpen
}) => {
  console.log("[WorkspaceEditorModal] 리치 텍스트 에디터 모달 렌더링 개시");

  const editorRef = useRef(null);
  const titleRef = useRef(null);
  
  const [charCount, setCharCount] = useState({ selected: 0, total: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [tableCtrlVisible, setTableCtrlVisible] = useState(false);
  const [findReplaceVisible, setFindReplaceVisible] = useState(false);
  const activeCellRef = useRef(null);
  
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");

  // 에디터 초기값 세팅 (모달 마운트 시 1회 실행)
  useEffect(() => {
    if (titleRef.current) titleRef.current.value = editData.title || '';
    if (editorRef.current) {
      const targetMemo = memos.find(m => m.id === activeMemoId);
      let content = targetMemo?.content || "";
      if (!content.includes('<div') && !content.includes('<br') && !content.includes('<p>') && content.includes('\n')) {
        content = content.replace(/\n/g, '<br>');
      }
      editorRef.current.innerHTML = content;
      updateCharCount();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleSaveMemo = async () => {
    if (!titleRef.current || !editorRef.current) return;
    const title = titleRef.current.value.trim();
    const content = editorRef.current.innerHTML;
    
    if (!title) return alert("메모 제목을 입력해주세요.");

    const payload = {
      title,
      content,
      folder: editData.folder,
      updatedAt: Date.now(),
      canvasX: 2500, canvasY: 2500,
      themeColor: 'var(--surface-color)'
    };

    setIsSaving(true);
    try {
      if (activeMemoId) {
        const originMemo = memos.find(m => m.id === activeMemoId);
        payload.canvasX = originMemo?.canvasX ?? 2500;
        payload.canvasY = originMemo?.canvasY ?? 2500;
        payload.themeColor = originMemo?.themeColor ?? 'var(--surface-color)';
        payload.sortOrder = originMemo?.sortOrder ?? -1;

        await api.put(`/api/memos/${activeMemoId}`, { ...payload, id: activeMemoId });
        setMemos(prev => prev.map(m => m.id === activeMemoId ? { ...m, ...payload } : m));
      } else {
        const res = await api.post('/api/memos', payload);
        setMemos([res.data, ...memos]);
        
        // 새 메모 저장 시, 현재 작성창의 속성을 갱신하기 위해 editData 강제 업데이트
        editData.id = res.data.id; 
      }
      console.log("[WorkspaceEditorModal] 메모 저장 완료");
      setTimeout(() => setIsSaving(false), 1000);
    } catch (e) {
      console.error("[WorkspaceEditorModal] 메모 저장 실패", e);
      alert("메모 저장에 실패했습니다.");
      setIsSaving(false);
    }
  };

  const handleDeleteMemo = async () => {
    if (window.confirm("이 메모를 영구 삭제하시겠습니까?")) {
      try {
        await api.delete(`/api/memos/${activeMemoId}`);
        setMemos(prev => prev.filter(m => m.id !== activeMemoId));
        console.log(`[WorkspaceEditorModal] 메모 ID [${activeMemoId}] 삭제 완료`);
        setIsEditorOpen(false);
      } catch (e) { 
        console.error("[WorkspaceEditorModal] 메모 삭제 실패", e);
        alert("삭제 실패"); 
      }
    }
  };

  const handleTitleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault(); e.stopPropagation();
      handleSaveMemo();
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      if (editorRef.current) {
        editorRef.current.focus();
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  };

  const handleEditorKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault(); e.stopPropagation();
      handleSaveMemo();
    }
    
    if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
      const selection = window.getSelection();
      if (selection.rangeCount === 0) return;

      let anchor = selection.anchorNode;
      if (anchor.nodeType === 3) anchor = anchor.parentNode;

      const editableBlock = anchor.closest('[contenteditable="true"]');
      if (editableBlock) {
        e.preventDefault(); e.stopPropagation();
        
        if (editableBlock.id === 'memo-edit-content') {
          editableBlock.classList.add('galpi-outer-select');
          const range = document.createRange();
          range.selectNodeContents(editableBlock);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          const mainEditor = editableBlock.closest('#memo-edit-content');
          if (mainEditor) mainEditor.classList.remove('galpi-outer-select');
          
          const range = document.createRange();
          range.selectNodeContents(editableBlock);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        updateCharCount();
      }
    }
  };

  const handleCopy = (e) => {
    const editor = editorRef.current;
    if (editor && editor.classList.contains('galpi-outer-select')) {
      e.preventDefault();
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

  const handleEditorClick = (e) => {
    checkTableFocus();
    updateCharCount();

    if (e.target.type === 'checkbox' && editorRef.current.contains(e.target)) {
      const isChecked = e.target.checked;
      const nextSpan = e.target.nextElementSibling;
      if (nextSpan) {
        nextSpan.style.textDecoration = isChecked ? 'line-through' : 'none';
        nextSpan.style.color = isChecked ? 'var(--text-secondary)' : 'var(--text-primary)';
      }
      setTimeout(handleSaveMemo, 100); 
    }
  };

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

  const executeFindReplace = () => {
    if (!findText) return alert("찾을 내용을 입력하세요.");
    if (!editorRef.current) return;

    let repHtml = replaceText.replace(/\\n/g, '<br>');
    const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) textNodes.push(node);
    
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

  const checkHTML = `<div style="display:flex; align-items:center; gap:8px; margin:4px 0;" contenteditable="false"><button type="button" onclick="this.parentElement.remove()" style="background:transparent; color:#e53e3e; border:none; cursor:pointer; font-size:14px; padding:0; outline:none;" title="삭제">✖</button><input type="checkbox" style="cursor:pointer; width:16px; height:16px;"><span contenteditable="true" style="outline:none; flex:1; font-size:13px; min-width:50px;">할 일 입력...</span></div>`;
  const tableHTML = `<div style="position:relative; margin:15px 0; border:1px solid transparent; padding-top:15px;" contenteditable="false"><button type="button" onclick="this.parentElement.remove()" style="position:absolute; top:0; right:0; background:#e53e3e; color:white; border:none; border-radius:4px; padding:2px 8px; cursor:pointer; font-size:10px; font-weight:bold;">❌ 표 완전히 지우기</button><table contenteditable="true" style="width:100%; border-collapse:collapse; text-align:center; font-size:13px; background:var(--surface-color); table-layout:auto;"><tbody><tr><th style="border:1px solid var(--border-color); padding:10px; background:var(--table-bg-alt); color:var(--primary-color); min-width:60px;">제목1</th><th style="border:1px solid var(--border-color); padding:10px; background:var(--table-bg-alt); color:var(--primary-color); min-width:60px;">제목2</th></tr><tr><td style="border:1px solid var(--border-color); padding:10px; min-width:60px;">내용1</td><td style="border:1px solid var(--border-color); padding:10px; min-width:60px;">내용2</td></tr></tbody></table></div><div><br></div>`;
  const foldHTML = `<div style="position:relative; margin:15px 0; padding-top:15px;" contenteditable="false"><button type="button" onclick="this.parentElement.remove()" style="position:absolute; top:0; right:0; background:#e53e3e; color:white; border:none; border-radius:4px; padding:2px 8px; cursor:pointer; font-size:10px; font-weight:bold; z-index:10;">❌ 박스 삭제</button><details style="border: 1px solid var(--border-color); border-radius: 8px; background: var(--table-bg-alt); overflow: hidden; font-size:13px;"><summary style="padding: 10px 15px; font-weight: 900; cursor: pointer; color: var(--primary-color); outline: none; list-style:none;"><span>▶</span> <span contenteditable="true" style="outline:none;">펼쳐보기 (클릭하여 제목 수정)</span></summary><div contenteditable="true" style="padding: 15px; border-top: 1px dashed var(--border-color); line-height: 1.6; background: var(--surface-color); outline:none;">숨길 내용을 입력하세요...</div></details></div><div><br></div>`;

  return (
    <div className="modal-overlay" style={{ zIndex: 100000, display: 'flex', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }} onClick={() => setIsEditorOpen(false)}>
      <div className="modal-content" style={{ width: '1000px', maxWidth: '95vw', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0, background: 'var(--bg-color)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
        
        <div style={{ padding: '15px 20px', background: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <input 
            ref={titleRef} type="text" placeholder="메모 제목" 
            style={{ flex: 1, fontSize: '18px', fontWeight: '900', border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none' }}
            onKeyDown={handleTitleKeyDown}
          />
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold', marginRight: '15px' }}>
            {charCount.selected > 0 ? `${charCount.selected} / ${charCount.total}` : `0 / ${charCount.total}`}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '13px', fontWeight: 'bold' }} value={editData.folder} onChange={e => setEditData({...editData, folder: e.target.value})}>
              {folders.filter(f => f !== '전체 메모').map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <button className="wiki-btn" style={{ background: isSaving ? '#10b981' : 'var(--primary-color)', color: 'white', fontWeight: 'bold', padding: '8px 16px', transition: '0.2s', width: isSaving ? '90px' : 'auto' }} onClick={handleSaveMemo}>
              {isSaving ? "✅ 저장됨" : "💾 저장"}
            </button>
            {(activeMemoId && !String(activeMemoId).startsWith('local_')) && <button className="wiki-btn" style={{ background: 'transparent', color: '#e53e3e', border: '1px dashed rgba(229,62,62,0.5)', padding: '8px 12px' }} onClick={handleDeleteMemo} title="영구 삭제">🗑️</button>}
            <button className="wiki-btn" style={{ background: 'transparent', color: 'var(--text-secondary)' }} onClick={() => setIsEditorOpen(false)}>✖ 닫기</button>
          </div>
        </div>

        {/* 서식 매크로 툴바 영역 */}
        <div id="memo-format-bar" style={{ display: 'flex', flexDirection: 'column', width: '100%', background: 'var(--table-bg-alt)', borderBottom: '1px solid var(--border-color)', userSelect: 'none', padding: '8px 20px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="wiki-btn" onClick={() => executeCmd('bold')} style={{ padding: '4px 10px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px' }}>B</button>
            <button className="wiki-btn" onClick={() => executeCmd('italic')} style={{ padding: '4px 10px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px' }}>I</button>
            <button className="wiki-btn" onClick={() => executeCmd('strikeThrough')} style={{ padding: '4px 10px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px' }}>S</button>
            <button className="wiki-btn" onClick={() => insertHtml(tableHTML)} style={{ padding: '4px 10px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px' }}>📊 표 삽입</button>
            <button className="wiki-btn" onClick={() => insertHtml(checkHTML)} style={{ padding: '4px 10px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px' }}>☑️ 할 일</button>
            <button className="wiki-btn" onClick={() => insertHtml(foldHTML)} style={{ padding: '4px 10px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px' }}>▼ 접기 박스</button>
            <button className="wiki-btn" onClick={() => { setFindReplaceVisible(!findReplaceVisible); setTableCtrlVisible(false); }} style={{ padding: '4px 10px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px' }}>🔍 찾기/바꾸기</button>
          </div>

          {tableCtrlVisible && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed var(--border-color)', width: '100%' }}>
              <button className="wiki-btn" onClick={addTableRowBelow} style={{ padding: '4px 10px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>➕ 아래에 행 추가</button>
              <button className="wiki-btn" onClick={addTableColRight} style={{ padding: '4px 10px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>➕ 우측에 열 추가</button>
              <button className="wiki-btn" onClick={delTableRow} style={{ padding: '4px 10px', background: 'var(--surface-color)', color: '#e53e3e', border: '1px solid rgba(229,62,62,0.3)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>➖ 현재 행 삭제</button>
              <button className="wiki-btn" onClick={delTableCol} style={{ padding: '4px 10px', background: 'var(--surface-color)', color: '#e53e3e', border: '1px solid rgba(229,62,62,0.3)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>➖ 현재 열 삭제</button>
            </div>
          )}

          {findReplaceVisible && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed var(--border-color)', width: '100%' }}>
              <input type="text" placeholder="찾을 내용" value={findText} onChange={e => setFindText(e.target.value)} style={{ padding: '6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: '4px', flex: 1, outline: 'none' }} />
              <input type="text" placeholder="바꿀 내용 (\n 줄바꿈 적용)" value={replaceText} onChange={e => setReplaceText(e.target.value)} style={{ padding: '6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: '4px', flex: 1, outline: 'none' }} />
              <button className="wiki-btn" onClick={executeFindReplace} style={{ padding: '4px 10px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px' }}>일괄 변경</button>
            </div>
          )}
        </div>

        <div 
          id="memo-edit-content"
          ref={editorRef}
          contentEditable="true"
          spellCheck="false"
          style={{ flex: 1, overflowY: 'auto', outline: 'none', padding: '30px', background: 'var(--bg-color)', fontSize: '15px', lineHeight: 1.6, color: 'var(--text-primary)' }}
          onInput={updateCharCount}
          onClick={handleEditorClick} 
          onMouseUp={() => { checkTableFocus(); updateCharCount(); }}
          onKeyUp={() => { checkTableFocus(); updateCharCount(); }}
          onKeyDown={handleEditorKeyDown}
          onCopy={handleCopy}
        />

      </div>
    </div>
  );
};

export default WorkspaceEditorModal;