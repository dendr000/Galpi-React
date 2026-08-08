// 절대 경로: src/pages/Editor/components/EditorWritePane.jsx
// 기능 요약: 제목 입력, 메타데이터 패널, 서식 툴바, 마크다운 텍스트 에디터를 통합하여 문서를 작성하는 메인 편집 컴포넌트 v2.1.0

import React, { useEffect, useCallback } from 'react';
import styles from '../EditorPage.module.css';
import WorkMetaPanel from './WorkMetaPanel';
import CharMetaPanel from './CharMetaPanel';
import EditorToolbar from './EditorToolbar';

const EditorWritePane = ({
  docType, title, setTitle, workMeta, setWorkMeta, charProps, setCharProps,
  themeColor, setThemeColor, cardLabels, setCardLabels, workContext,
  isHidden, setIsHidden, overviewText, setOverviewText, rawText, setRawText,
  editorRef, handleEditorKeyDown
}) => {
  console.log(`[EditorWritePane] 컴포넌트 렌더링 됨 - 문서 타입: ${docType}`);

  // 기능: 마크다운 텍스트 영역에 특정 포맷(태그)을 씌우거나 벗기는 로직을 수행합니다.
  const applyTextFormat = useCallback((prefix, suffix) => {
    console.log(`[EditorWritePane] 텍스트 서식 적용 호출됨 - prefix: ${prefix}, suffix: ${suffix}`);
    const textarea = editorRef.current;
    if (!textarea) return;

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
    }, 0);
  }, [editorRef, setRawText]);

  // 기능: 선택된 영역의 여러 줄 텍스트를 가나다순으로 정렬합니다.
  const sortSelectedLines = useCallback(() => {
    console.log("[EditorWritePane] 가나다 정렬 호출됨");
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
    }, 0);
  }, [editorRef, setRawText]);

  // 기능: 키보드 단축키(Ctrl+B, Ctrl+I 등)를 감지하여 서식을 적용하고 부모의 onKeyDown을 호출합니다.
  const handleLocalKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          applyTextFormat('**', '**');
          break;
        case 'i':
          e.preventDefault();
          applyTextFormat('_', '_');
          break;
        default:
          break;
      }
    }
    // 상위(useEditorState 등)에서 전달받은 기존 키다운 로직(탭 키 등) 유지
    if (handleEditorKeyDown) {
      handleEditorKeyDown(e);
    }
  };

  // 기능: 텍스트 길이에 따라 textarea의 높이를 동적으로 조절하며 화면 스크롤 튐 현상을 방지합니다.
  const adjustTextareaHeight = useCallback((element) => {
    if (element) {
      const scrollY = window.scrollY; // 현재 화면 스크롤 위치 저장
      
      // 기존 CSS 파일에 강제(important)로 지정된 높이나 억제 속성이 있을 경우를 완벽히 돌파하기 위해
      // setProperty를 사용하여 최우선 순위로 높이를 제어합니다.
      element.style.setProperty('height', 'auto', 'important');
      
      // 텍스트 밑부분이 잘리는 현상을 방지하기 위해 계산된 높이에 5px의 여유를 둡니다.
      const targetHeight = element.scrollHeight + 5;
      element.style.setProperty('height', targetHeight + 'px', 'important');
      
      window.scrollTo(0, scrollY); // 스크롤 위치 복구
      console.log(`[EditorWritePane] 텍스트 영역 높이 강제 확장 완료: ${targetHeight}px`);
    }
  }, []);

  // 기능: 에디터 렌더링 시 및 내용 외부 변경 시 초기 본문 높이를 설정합니다.
  useEffect(() => {
    if (editorRef?.current) {
      adjustTextareaHeight(editorRef.current);
    }
  }, [rawText, adjustTextareaHeight, editorRef]);

  return (
    <div className={styles.writePane} style={{ paddingLeft: '80px', boxSizing: 'border-box', maxWidth: '100%' }}>
      {/* 제목 입력 영역 (좌측 플로팅 툴바 침범 방지를 위해 paddingLeft 추가) */}
      <input 
        className={styles.editorTitleInput} 
        placeholder="제목을 입력하세요" 
        value={title} 
        onChange={e => {
          console.log(`[EditorWritePane] 제목 변경: ${e.target.value}`);
          setTitle(e.target.value);
        }} 
      />

      {/* 속성 설정 패널 동적 렌더링 (work 또는 char 타입에 따라 분기) */}
      {docType === 'work' && (
        <WorkMetaPanel 
          workMeta={workMeta} 
          setWorkMeta={setWorkMeta} 
        />
      )}

      {docType === 'char' && (
        <CharMetaPanel 
          title={title}
          charProps={charProps}
          setCharProps={setCharProps}
          themeColor={themeColor}
          setThemeColor={setThemeColor}
          cardLabels={cardLabels}
          setCardLabels={setCardLabels}
          workContext={workContext}
          isHidden={isHidden}
          setIsHidden={setIsHidden}
        />
      )}

      {/* 작품용 개요 상세 입력 텍스트 영역 */}
      {docType === 'work' && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>
            1. 개요 (상세 본문)
          </label>
          <textarea 
            className={styles.editorTextarea} 
            style={{ 
              overflowY: 'hidden', 
              minHeight: '150px', 
              maxHeight: 'none', // 핵심: 기존 CSS의 최대 높이 제한을 무력화
              resize: 'none',
              width: '100%',
              boxSizing: 'border-box',
              flex: 'none' // 핵심: 부모 컨테이너의 flex에 의해 짓눌리는 현상 방지
            }} 
            placeholder="개요에 들어갈 상세 내용을 마크다운으로 작성하세요..."
            value={overviewText}
            onChange={e => {
              console.log("[EditorWritePane] 개요 텍스트 변경됨");
              setOverviewText(e.target.value);
              adjustTextareaHeight(e.target);
            }}
            ref={el => {
              if (el) adjustTextareaHeight(el);
            }}
          />
        </div>
      )}

      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px', marginTop: docType === 'work' ? '0' : '10px' }}>
        {docType === 'work' ? '2. 설정' : '문서 내용 작성'}
      </label>

      {/* 텍스트 포맷 툴바 영역 */}
      <EditorToolbar 
        applyTextFormat={applyTextFormat} 
        sortSelectedLines={sortSelectedLines} 
      />

      {/* 메인 마크다운 텍스트 에디터 영역 */}
      <textarea 
        ref={editorRef}
        className={styles.editorTextarea} 
        style={{ 
          overflowY: 'hidden', 
          minHeight: '300px', 
          maxHeight: 'none', // 핵심: 기존 CSS의 최대 높이 제한을 무력화
          resize: 'none',
          width: '100%',
          boxSizing: 'border-box',
          flex: 'none' // 핵심: 부모 컨테이너의 flex에 의해 짓눌리는 현상 방지
        }}
        placeholder="마크다운으로 내용을 자유롭게 작성하세요..."
        value={rawText}
        onChange={e => {
          console.log("[EditorWritePane] 본문 텍스트 변경됨");
          setRawText(e.target.value);
          adjustTextareaHeight(e.target);
        }}
        onKeyDown={handleLocalKeyDown}
      />
    </div>
  );
};

export default EditorWritePane;