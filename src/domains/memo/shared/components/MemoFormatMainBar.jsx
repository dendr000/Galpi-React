// 파일 위치: src/domains/memo/components/MemoFormatMainBar.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  BoldIcon, ItalicIcon, StrikethroughIcon, FootnoteIcon, LinkIcon,
  TableIcon, TodoIcon, FoldIcon, SearchIcon, TemplateIcon, TemplateSaveIcon,
  FontResetIcon, CrackIcon, BabyIcon
} from './MemoIcons';

const MemoFormatMainBar = ({
  executeCmd, insertFootnote, insertMarkdownLink, insertHtml,
  findReplaceVisible, setFindReplaceVisible, setTableCtrlVisible,
  openTemplateList, saveAsTemplate,
  fontList, applyFont
}) => {
  const selectRef = useRef(null);
  const [recentFonts, setRecentFonts] = useState([]);

  useEffect(() => {
    setRecentFonts(JSON.parse(localStorage.getItem('galpi-recent-fonts') || '[]'));
  }, []);

  const svgClose = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
  const svgPlay = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;

  const checkHTML = `<div style="display:flex; align-items:center; gap:8px; margin:4px 0;" contenteditable="false"><button type="button" onclick="this.parentElement.remove()" style="background:transparent; color:#e53e3e; border:none; cursor:pointer; font-size:14px; padding:0; outline:none; display:flex; align-items:center; justify-content:center;" title="삭제">${svgClose}</button><input type="checkbox" style="cursor:pointer; width:16px; height:16px;"><span contenteditable="true" style="outline:none; flex:1; font-size:13px; min-width:50px;">할 일 입력...</span></div>`;
  const tableHTML = `<table style="width:max-content; min-width:100%; border-collapse:collapse; text-align:center; font-size:13px; background:var(--surface-color); word-break:break-all; margin: 15px 0;"><tbody><tr><th style="border:1px solid var(--border-color); padding:10px; background:var(--table-bg-alt); color:var(--primary-color); min-width:60px; resize:horizontal; overflow:hidden;">제목1</th><th style="border:1px solid var(--border-color); padding:10px; background:var(--table-bg-alt); color:var(--primary-color); min-width:60px; resize:horizontal; overflow:hidden;">제목2</th></tr><tr><td style="border:1px solid var(--border-color); padding:10px; min-width:60px; resize:horizontal; overflow:hidden;">내용1</td><td style="border:1px solid var(--border-color); padding:10px; min-width:60px; resize:horizontal; overflow:hidden;">내용2</td></tr></tbody></table><div><br></div>`;
  
  // ★ 픽스: svgPlay의 중복 클릭 스크립트 제거 (pointer-events:none 추가) 및 삭제 버튼 확보용 여백(padding-top: 28px) 확장
  const foldHTML = `<div style="position:relative; margin:15px 0; padding-top:28px;" contenteditable="false"><button type="button" onclick="this.parentElement.remove()" style="position:absolute; top:0; right:0; background:#e53e3e; color:white; border:none; border-radius:4px; padding:4px 8px; cursor:pointer; font-size:11px; font-weight:bold; z-index:10; display:flex; align-items:center; gap:4px;">${svgClose} 박스 삭제</button><details open style="border: 1px solid var(--border-color); border-radius: 8px; background: var(--table-bg-alt); overflow: hidden; font-size:13px;"><summary onmousedown="if(event.target.closest('.fold-title')) return; event.preventDefault(); const d = this.closest('details'); d.open = !d.open;" onclick="if(!event.target.closest('.fold-title')) event.preventDefault();" style="padding: 10px 15px; font-weight: 900; cursor: pointer; color: var(--primary-color); outline: none; list-style:none; display:flex; align-items:center; gap:8px;"><span contenteditable="false" style="display:flex; align-items:center; justify-content:center; user-select:none; padding:2px; pointer-events:none;">${svgPlay}</span><span class="fold-title" contenteditable="true" data-placeholder="접기 박스 제목 (Tab을 눌러 내용으로)" style="outline:none; flex:1; min-width:50px; cursor:text;"></span></summary><div class="fold-content" contenteditable="true" data-placeholder="숨길 내용을 입력하세요..." style="padding: 15px; border-top: 1px dashed var(--border-color); line-height: 1.6; background: var(--surface-color); outline:none; min-height:50px;"></div></details></div><div><br></div>`;

  const iconBtnStyle = { padding: '4px 6px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' };

  const handleFontChange = (e) => {
    const val = e.target.value;
    applyFont(val);
    
    if (val !== 'default') {
      let recents = [...recentFonts];
      recents = recents.filter(f => f !== val);
      recents.unshift(val);
      if (recents.length > 5) recents.pop();
      
      localStorage.setItem('galpi-recent-fonts', JSON.stringify(recents));
      setRecentFonts(recents);
    }
  };

  const handleFontReset = () => {
    applyFont('default');
    if (selectRef.current) selectRef.current.value = 'default';
  };

  // ★ 추가: contentEditable 환경에 최적화된 텍스트 감싸기 전용 매크로 함수 (Undo 스택 보호용)
  const applyTextWrap = (prefix, suffix) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const selectedText = selection.toString();
    document.execCommand('insertText', false, prefix + selectedText + suffix);
    
    // 선택된 텍스트 없이 버튼만 눌렀을 경우, 커서를 기호 정중앙으로 자동 텔레포트
    if (selectedText.length === 0) {
      for (let i = 0; i < suffix.length; i++) {
        selection.modify('move', 'backward', 'character');
      }
    }
  };

  const recentFontObjs = recentFonts.map(rf => fontList?.find(f => f.fontFamily === rf)).filter(Boolean);

  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
      
      <select 
        ref={selectRef}
        onChange={handleFontChange}
        defaultValue={localStorage.getItem('galpi-default-font') || 'default'}
        title="선택한 영역 또는 전체 글꼴 변경"
        style={{ padding: '3px 6px', fontSize: '11px', fontWeight: 'bold', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--surface-color)', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer', minWidth: '110px' }}
      >
        <option value="default">기본 폰트</option>
        
        {recentFontObjs.map(f => (
          <option key={`recent_${f.filename}`} value={f.fontFamily}>[최근] {f.displayName}</option>
        ))}

        {recentFontObjs.length > 0 && <option disabled>──────────</option>}

        {fontList && fontList.length > 0 && fontList.map(f => (
          <option key={`all_${f.filename}`} value={f.fontFamily}>{f.displayName}</option>
        ))}
      </select>

      <button 
        className="wiki-btn" 
        onClick={handleFontReset} 
        style={{ ...iconBtnStyle, color: '#e53e3e', borderColor: 'rgba(229,62,62,0.3)', marginRight: '4px' }} 
        title="기본 폰트로 되돌리기"
      >
        <FontResetIcon />
      </button>

      <button className="wiki-btn" onClick={() => executeCmd('bold')} style={iconBtnStyle} title="굵게 (Ctrl+B)">
        <BoldIcon />
      </button>
      <button className="wiki-btn" onClick={() => executeCmd('italic')} style={iconBtnStyle} title="기울임 (Ctrl+I)">
        <ItalicIcon />
      </button>
      <button className="wiki-btn" onClick={() => executeCmd('strikeThrough')} style={iconBtnStyle} title="취소선">
        <StrikethroughIcon />
      </button>

      {/* ★ 추가: Crack, Baby 텍스트 감싸기 매크로 버튼 */}
      <button className="wiki-btn" onClick={() => applyTextWrap('*', '*')} style={iconBtnStyle} title="별표 감싸기 (*텍스트*)">
        <CrackIcon />
      </button>
      <button className="wiki-btn" onClick={() => applyTextWrap('*(', ')*')} style={iconBtnStyle} title="괄호 감싸기 (*(텍스트)*)">
        <BabyIcon />
      </button>
      
      <button className="wiki-btn" onClick={insertFootnote} style={iconBtnStyle} title="각주 삽입 (Ctrl+Q)">
        <FootnoteIcon />
      </button>

      <button className="wiki-btn" onClick={insertMarkdownLink} style={iconBtnStyle} title="링크 삽입 (Alt+W)">
        <LinkIcon />
      </button>

      <button className="wiki-btn" onClick={() => insertHtml(tableHTML)} style={iconBtnStyle} title="표 삽입">
        <TableIcon />
      </button>
      <button className="wiki-btn" onClick={() => insertHtml(checkHTML)} style={iconBtnStyle} title="할 일 삽입">
        <TodoIcon />
      </button>
      <button className="wiki-btn" onClick={() => insertHtml(foldHTML)} style={iconBtnStyle} title="접기 박스 삽입">
        <FoldIcon />
      </button>
      <button className="wiki-btn" onClick={() => { setFindReplaceVisible(!findReplaceVisible); setTableCtrlVisible(false); }} style={iconBtnStyle} title="찾아 바꾸기">
        <SearchIcon />
      </button>

      <button className="wiki-btn" onClick={openTemplateList} style={iconBtnStyle} title="템플릿/양식 불러오기">
        <TemplateIcon />
      </button>
      <button className="wiki-btn" onClick={saveAsTemplate} style={iconBtnStyle} title="드래그한 영역을 템플릿으로 저장">
        <TemplateSaveIcon />
      </button>
    </div>
  );
};

export default MemoFormatMainBar;