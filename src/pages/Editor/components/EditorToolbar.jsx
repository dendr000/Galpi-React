// 절대 경로: src/pages/Editor/components/EditorToolbar.jsx
// 기능 요약: 텍스트 에디터의 서식 지정(글꼴, 크기, 굵기 등) 및 텍스트 정렬 기능을 제공하는 툴바 컴포넌트 v1.2.0

import React from 'react';
import styles from '../EditorPage.module.css';
import { BoldIcon, ItalicIcon, StrikethroughIcon, AlignCenterIcon, AlignRightIcon, IndentIcon, SortIcon } from './EditorIcons';

const EditorToolbar = ({ editorRef, setRawText }) => {
  console.log("[EditorToolbar] 컴포넌트 렌더링 됨");

  // 기능: 마크다운 텍스트 영역에 특정 포맷(태그)을 씌우거나 벗기는 로직을 수행합니다.
  const applyTextFormat = (prefix, suffix) => {
    console.log(`[EditorToolbar] 텍스트 서식 적용 호출됨 - prefix: ${prefix}, suffix: ${suffix}`);
    const textarea = editorRef.current;
    if (!textarea) {
      console.log("[EditorToolbar] 에디터 참조(editorRef)를 찾을 수 없습니다.");
      return;
    }

    textarea.focus();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const before = text.substring(Math.max(0, start - prefix.length), start);
    const after = text.substring(end, end + suffix.length);

    let isUnwrap = (before === prefix && after === suffix);
    let newInsertedText = isUnwrap ? selected : prefix + selected + suffix;

    setRawText(text.substring(0, isUnwrap ? start - prefix.length : start) + newInsertedText + text.substring(isUnwrap ? end + suffix.length : end));

    setTimeout(() => {
      textarea.focus();
      if (isUnwrap) {
        textarea.setSelectionRange(start - prefix.length, start - prefix.length + selected.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
      }
      console.log("[EditorToolbar] 서식 적용 후 커서 위치 재설정 완료");
    }, 0);
  };

  // 기능: 선택된 영역의 여러 줄 텍스트를 가나다순으로 정렬합니다.
  const sortSelectedLines = () => {
    console.log("[EditorToolbar] 가나다 정렬 호출됨");
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) {
      alert("정렬할 텍스트 라인들을 드래그로 선택해 주세요.");
      return;
    }

    const text = textarea.value;
    const selected = text.substring(start, end);
    const lines = selected.split('\n');
    
    lines.sort((a, b) => a.localeCompare(b, 'ko-KR'));
    const sortedText = lines.join('\n');

    setRawText(text.substring(0, start) + sortedText + text.substring(end));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + sortedText.length);
      console.log("[EditorToolbar] 텍스트 가나다순 정렬 및 커서 복구 완료");
    }, 0);
  };

  return (
    <div 
      className={styles.formatToolbar} 
      style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '8px', 
        alignItems: 'center', 
        padding: '10px 0', 
        minHeight: '44px' 
      }}
    >
      {/* 글꼴 변경 드롭다운 */}
      <select 
        className={styles.formatSelect} 
        defaultValue="" 
        onChange={(e) => { 
          if(e.target.value) { 
            applyTextFormat(`[폰트:${e.target.value}:`, ']'); 
            e.target.value = ''; 
          } 
        }}
        style={{ height: '32px', padding: '0 8px', borderRadius: '4px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
      >
        <option value="" disabled>글꼴 변경</option>
        <option value="명조">명조체</option>
        <option value="궁서">궁서체</option>
        <option value="바탕">바탕체</option>
        <option value="돋움">돋움체</option>
        <option value="굴림">굴림체</option>
      </select>
      
      {/* 크기 변경 드롭다운 */}
      <select 
        className={styles.formatSelect} 
        defaultValue="" 
        onChange={(e) => { 
          if(e.target.value) { 
            applyTextFormat(`[크기:${e.target.value}:`, ']'); 
            e.target.value = ''; 
          } 
        }}
        style={{ height: '32px', padding: '0 8px', borderRadius: '4px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
      >
        <option value="" disabled>크기 변경</option>
        <option value="12">12px</option>
        <option value="14">14px</option>
        <option value="16">16px</option>
        <option value="20">20px</option>
        <option value="24">24px</option>
        <option value="32">32px</option>
      </select>
      
      {/* 텍스트 포맷 적용 버튼들 (SVG 치환 완료) */}
      <button type="button" className={styles.formatBtn} style={{ height: '32px', padding: '0 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }} onClick={() => applyTextFormat('**', '**')} title="굵게">
        <BoldIcon />
      </button>
      <button type="button" className={styles.formatBtn} style={{ height: '32px', padding: '0 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }} onClick={() => applyTextFormat('_', '_')} title="기울임">
        <ItalicIcon />
      </button>
      <button type="button" className={styles.formatBtn} style={{ height: '32px', padding: '0 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }} onClick={() => applyTextFormat('--', '--')} title="취소선">
        <StrikethroughIcon />
      </button>
      <button type="button" className={styles.formatBtn} style={{ height: '32px', padding: '0 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }} onClick={() => applyTextFormat('[정렬:중앙:', ']')} title="중앙 정렬">
        <AlignCenterIcon />
      </button>
      <button type="button" className={styles.formatBtn} style={{ height: '32px', padding: '0 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }} onClick={() => applyTextFormat('[정렬:우측:', ']')} title="우측 정렬">
        <AlignRightIcon />
      </button>
      <button type="button" className={styles.formatBtn} style={{ height: '32px', padding: '0 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }} onClick={() => applyTextFormat('[들여쓰기:', ']')} title="들여쓰기">
        <IndentIcon />
      </button>
      <button type="button" className={styles.formatBtn} style={{ height: '32px', padding: '0 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }} onClick={sortSelectedLines} title="가나다 정렬">
        <SortIcon />
      </button>
    </div>
  );
};

export default EditorToolbar;