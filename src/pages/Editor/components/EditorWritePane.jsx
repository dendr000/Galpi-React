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

  // 기능: 텍스트 길이에 따라 textarea의 높이를 동적으로 조절합니다.
  const adjustTextareaHeight = useCallback((element) => {
    if (element) {
      element.style.height = 'auto'; // 높이 초기화
      element.style.height = element.scrollHeight + 'px'; // 콘텐츠 길이에 맞게 재설정
      console.log(`[EditorWritePane] 텍스트 영역 높이 자동 조절 완료: ${element.scrollHeight}px`);
    }
  }, []);

  // 기능: 에디터 렌더링 시 및 내용 외부 변경 시 초기 본문 높이를 설정합니다.
  useEffect(() => {
    if (editorRef?.current) {
      adjustTextareaHeight(editorRef.current);
    }
  }, [rawText, adjustTextareaHeight, editorRef]);

  return (
    <div className={styles.writePane} style={{ paddingLeft: '80px' }}>
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
              overflow: 'hidden', 
              minHeight: '150px', 
              resize: 'none',
              width: '100%',
              boxSizing: 'border-box',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
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
        editorRef={editorRef} 
        setRawText={setRawText} 
      />

      {/* 메인 마크다운 텍스트 에디터 영역 */}
      <textarea 
        ref={editorRef}
        className={styles.editorTextarea} 
        style={{ 
          overflow: 'hidden', 
          minHeight: '300px', 
          resize: 'none',
          width: '100%',
          boxSizing: 'border-box',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
        placeholder="마크다운으로 내용을 자유롭게 작성하세요..."
        value={rawText}
        onChange={e => {
          console.log("[EditorWritePane] 본문 텍스트 변경됨");
          setRawText(e.target.value);
          adjustTextareaHeight(e.target);
        }}
        onKeyDown={handleEditorKeyDown}
      />
    </div>
  );
};

export default EditorWritePane;