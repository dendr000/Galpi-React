// 파일 위치: src/components/layout/fab/memo/MemoEditor.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosCore';

const MemoEditor = ({ activeMemo, memoData, setMemoData, currentFolder, setActiveMemoId }) => {
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

  useEffect(() => {
    if (!activeMemo) return;
    if (titleRef.current) titleRef.current.value = activeMemo.title || '';
    if (editorRef.current) {
      let content = activeMemo.content || "";
      if (!content.includes('<div') && !content.includes('<br') && !content.includes('<p>') && content.includes('\n')) {
        content = content.replace(/\n/g, '<br>');
      }
      editorRef.current.innerHTML = content;
      updateCharCount();
    }
    setTableCtrlVisible(false);
    setFindReplaceVisible(false);
  }, [activeMemo?.id]);

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

  const saveMemo = async () => {
    // 기능 설명 주석: 메모 에디터에서 작성된 내용을 DB에 저장 또는 갱신하는 비동기 함수입니다.
    console.log("[MemoEditor] saveMemo 함수 호출: 메모 저장 로직 개시");
    
    if (!activeMemo || !titleRef.current || !editorRef.current) {
      console.log("[MemoEditor] 필수 요소(activeMemo, titleRef, editorRef) 누락으로 저장 중단");
      return;
    }
    
    const title = titleRef.current.value.trim();
    const content = editorRef.current.innerHTML;
    
    if (!title) {
      console.log("[MemoEditor] 제목 미입력 상태. 저장 거부");
      return alert("메모 제목을 입력해주세요.");
    }

    const folder = activeMemo.folder || (currentFolder === "전체 메모" ? "기타" : currentFolder);
    console.log(`[MemoEditor] 할당된 폴더명: ${folder}`);
    
    // 기능 설명 주석: 기존 메모의 속성(태그, 잠금 상태 등)을 유지하기 위해 전개 연산자를 사용하여 payload를 구성합니다.
    const memoPayload = { 
      ...activeMemo,
      title, content, folder, 
      updatedAt: Date.now(), sortOrder: activeMemo.sortOrder || -1,
      canvasX: activeMemo.canvasX || 2500, canvasY: activeMemo.canvasY || 2500, themeColor: activeMemo.themeColor || 'var(--surface-color)'
    };

    // 기능 설명 주석: ID가 'local_'로 시작하지 않으면 기존 DB에 있는 데이터로 판단하여 업데이트 모드로 설정합니다.
    const isEdit = !String(activeMemo.id).startsWith("local_");
    console.log(`[MemoEditor] 편집 모드 판별: ${isEdit ? "기존 메모 수정" : "신규 메모 생성"}`);

    // 기능 설명 주석: 신규 메모 생성 시 백엔드의 Long 타입 매핑 에러 방지를 위해 임시 문자열 ID를 페이로드에서 제거합니다.
    if (!isEdit) {
      console.log("[MemoEditor] 신규 생성 모드: 페이로드에서 임시 문자열 ID를 제거합니다.");
      delete memoPayload.id;
    } else {
      memoPayload.id = activeMemo.id;
    }

    try {
      const url = isEdit ? `/api/memos/${activeMemo.id}` : '/api/memos';
      const method = isEdit ? 'put' : 'post';
      console.log(`[MemoEditor] API 통신 준비 - URL: ${url}, Method: ${method}`);

      const response = await api[method](url, memoPayload);
      console.log("[MemoEditor] API 통신 성공 응답 수신");
      
      // 기능 설명 주석: 신규 메모 생성 완료 후, 서버로부터 발급받은 실제 숫자 ID를 로컬 페이로드에 적용합니다.
      if (!isEdit && response.data?.id) {
        console.log(`[MemoEditor] 백엔드에서 발급받은 실제 DB ID 갱신: ${response.data.id}`);
        memoPayload.id = response.data.id;
      }
    } catch (error) {
      // 기능 설명 주석: API 통신 중 에러가 발생한 경우 에러를 묵살하지 않고 로깅한 뒤 로직을 종료합니다.
      console.error("[MemoEditor] 저장 중 통신 에러 발생:", error);
      alert("서버 오류로 메모를 저장하지 못했습니다.");
      return; 
    }

    console.log("[MemoEditor] 로컬 메모 데이터 배열 갱신 및 스토리지 저장 처리");
    const newData = memoData.map(m => String(m.id) === String(activeMemo.id) ? memoPayload : m);
    setMemoData(newData);
    localStorage.setItem('galpi-memos', JSON.stringify(newData));

    // 기능 설명 주석: 신규 메모 생성 시 부모 컴포넌트의 활성 ID를 실제 DB ID로 동기화하여 에디터 뷰 증발 현상을 방지합니다.
    if (!isEdit && memoPayload.id && setActiveMemoId) {
      console.log(`[MemoEditor] 부모 컴포넌트의 활성화 ID를 신규 DB ID(${memoPayload.id})로 동기화합니다.`);
      setActiveMemoId(memoPayload.id);
    }

    setIsSaving(true);
    setTimeout(() => {
      console.log("[MemoEditor] 저장 완료 상태 표시 해제");
      setIsSaving(false);
    }, 1500);
  };

  // ★ 2. 제목 입력 후 Tab 키 이동 완벽 복원
  const handleTitleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault(); e.stopPropagation();
      saveMemo();
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      if (editorRef.current) {
        editorRef.current.focus();
        // 커서를 에디터 내용의 맨 끝으로 이동
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
      saveMemo();
    }
    
    // ★ 3. Ctrl + A 격리 모드 100% 복원 (내부 블록 정밀 스캔)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
      const selection = window.getSelection();
      if (selection.rangeCount === 0) return;

      let anchor = selection.anchorNode;
      if (anchor.nodeType === 3) anchor = anchor.parentNode;

      const editableBlock = anchor.closest('[contenteditable="true"]');
      if (editableBlock) {
        e.preventDefault(); e.stopPropagation();
        
        if (editableBlock.id === 'memo-edit-content') {
          // 최상단 메인 에디터 전체 선택 시
          editableBlock.classList.add('galpi-outer-select');
          const range = document.createRange();
          range.selectNodeContents(editableBlock);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          // 표 내부, 아코디언 내부 등 독립된 contenteditable 블록 안일 경우 격리모드 해제 후 해당 내부만 선택
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

  // ★ 4. 체크박스 상태 물리적 동기화 (이벤트 위임 패턴)
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
      // 체크박스 클릭 즉시 상태를 반영하기 위해 저장 로직 딜레이 큐에 넣음
      setTimeout(saveMemo, 100); 
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

  // 체크박스 마크다운 정합성 복원
  const checkHTML = `<div style="display:flex; align-items:center; gap:8px; margin:4px 0;" contenteditable="false"><button type="button" onclick="this.parentElement.remove()" style="background:transparent; color:#e53e3e; border:none; cursor:pointer; font-size:14px; padding:0; outline:none;" title="삭제">✖</button><input type="checkbox" style="cursor:pointer; width:16px; height:16px;"><span contenteditable="true" style="outline:none; flex:1; font-size:13px; min-width:50px;">할 일 입력...</span></div>`;
  const tableHTML = `<div style="position:relative; margin:15px 0; border:1px solid transparent; padding-top:15px;" contenteditable="false"><button type="button" onclick="this.parentElement.remove()" style="position:absolute; top:0; right:0; background:#e53e3e; color:white; border:none; border-radius:4px; padding:2px 8px; cursor:pointer; font-size:10px; font-weight:bold;">❌ 표 완전히 지우기</button><table contenteditable="true" style="width:100%; border-collapse:collapse; text-align:center; font-size:13px; background:var(--surface-color); table-layout:auto;"><tbody><tr><th style="border:1px solid var(--border-color); padding:10px; background:var(--table-bg-alt); color:var(--primary-color); min-width:60px;">제목1</th><th style="border:1px solid var(--border-color); padding:10px; background:var(--table-bg-alt); color:var(--primary-color); min-width:60px;">제목2</th></tr><tr><td style="border:1px solid var(--border-color); padding:10px; min-width:60px;">내용1</td><td style="border:1px solid var(--border-color); padding:10px; min-width:60px;">내용2</td></tr></tbody></table></div><div><br></div>`;
  const foldHTML = `<div style="position:relative; margin:15px 0; padding-top:15px;" contenteditable="false"><button type="button" onclick="this.parentElement.remove()" style="position:absolute; top:0; right:0; background:#e53e3e; color:white; border:none; border-radius:4px; padding:2px 8px; cursor:pointer; font-size:10px; font-weight:bold; z-index:10;">❌ 박스 삭제</button><details style="border: 1px solid var(--border-color); border-radius: 8px; background: var(--table-bg-alt); overflow: hidden; font-size:13px;"><summary style="padding: 10px 15px; font-weight: 900; cursor: pointer; color: var(--primary-color); outline: none; list-style:none;"><span>▶</span> <span contenteditable="true" style="outline:none;">펼쳐보기 (클릭하여 제목 수정)</span></summary><div contenteditable="true" style="padding: 15px; border-top: 1px dashed var(--border-color); line-height: 1.6; background: var(--surface-color); outline:none;">숨길 내용을 입력하세요...</div></details></div><div><br></div>`;

  if (!activeMemo) {
    return <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)', fontWeight: 'bold' }}>좌측에서 메모를 선택하거나 생성하세요.</div>;
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-color)' }}>
      <div className="memo-editor-header" style={{ display: 'flex', padding: '15px 20px', borderBottom: '1px solid var(--border-color)', gap: '10px', alignItems: 'center', background: 'var(--surface-color)' }}>
        <input 
          ref={titleRef} type="text" placeholder="메모 제목" 
          style={{ flex: 1, fontSize: '18px', fontWeight: '900', border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none' }}
          onKeyDown={handleTitleKeyDown} // ★ 탭 키 이동 이벤트 연동
        />
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold', marginRight: '10px' }} id="memo-char-count">
          {charCount.selected > 0 ? `${charCount.selected} / ${charCount.total}` : `0 / ${charCount.total}`}
        </div>
        <button 
          className="memo-btn" title="메모 페이지로 이동"
          style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
          onClick={() => navigate('/memo')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </button>
        <button 
          onClick={saveMemo} 
          style={{ background: isSaving ? '#10b981' : 'var(--primary-color)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', width: isSaving ? '90px' : 'auto', whiteSpace: 'nowrap' }}
        >
          {isSaving ? "✅ 저장됨" : "💾 저장"}
        </button>
      </div>

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

        {tableCtrlVisible && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', width: '100%' }}>
            <button className="wiki-btn" onClick={addTableRowBelow} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>➕ 아래에 행 추가</button>
            <button className="wiki-btn" onClick={addTableColRight} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>➕ 우측에 열 추가</button>
            <button className="wiki-btn" onClick={delTableRow} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: '#e53e3e', border: '1px solid rgba(229,62,62,0.3)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>➖ 현재 행 삭제</button>
            <button className="wiki-btn" onClick={delTableCol} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: '#e53e3e', border: '1px solid rgba(229,62,62,0.3)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>➖ 현재 열 삭제</button>
          </div>
        )}

        {findReplaceVisible && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', width: '100%' }}>
            <input type="text" placeholder="찾을 내용" value={findText} onChange={e => setFindText(e.target.value)} style={{ padding: '4px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: '4px', flex: 1, outline: 'none' }} />
            <input type="text" placeholder="바꿀 내용 (\n 줄바꿈 적용)" value={replaceText} onChange={e => setReplaceText(e.target.value)} style={{ padding: '4px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: '4px', flex: 1, outline: 'none' }} />
            <button className="wiki-btn" onClick={executeFindReplace} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>일괄 변경</button>
          </div>
        )}
      </div>

      <div 
        id="memo-edit-content"
        ref={editorRef}
        contentEditable="true"
        spellCheck="false"
        style={{ flex: 1, overflowY: 'auto', outline: 'none', padding: '20px', background: 'var(--bg-color)', fontSize: '14px', lineHeight: 1.6, color: 'var(--text-primary)' }}
        onInput={updateCharCount}
        onClick={handleEditorClick} // ★ 체크박스 이벤트 위임
        onMouseUp={() => { checkTableFocus(); updateCharCount(); }}
        onKeyUp={() => { checkTableFocus(); updateCharCount(); }}
        onKeyDown={handleEditorKeyDown}
        onCopy={handleCopy}
      />
    </div>
  );
};

export default MemoEditor;