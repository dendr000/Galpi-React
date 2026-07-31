// 파일 위치: src/pages/Editor/EditorPage.jsx
import React, { useState } from 'react';
import styles from './EditorPage.module.css';
import EditorSearch from './EditorSearch';
import MacroToolbar from '../../domains/macro/MacroToolbar';
import { useEditorData } from './hooks/useEditorData';
import EditorHeader from './components/EditorHeader';
import EditorPreviewPane from './components/EditorPreviewPane';
import EditorWritePane from './components/EditorWritePane';

const EditorPage = () => {
  console.log(`[EditorPage] UI 렌더링 사이클 개시`);
  
  const {
    docType, docAction, loading,
    title, setTitle, rawText, setRawText, overviewText, setOverviewText,
    workMeta, setWorkMeta, charProps, setCharProps, themeColor, setThemeColor,
    cardLabels, setCardLabels, editorRef, handleGoBack, handleSave, saveStatus,
    workContext, isHidden, setIsHidden
  } = useEditorData();

  // ★ 듀얼/집중/뷰어 레이아웃 스위칭 상태 관리
  const [layoutMode, setLayoutMode] = useState('dual');

  const badgeText = 
    docType === 'work' ? (docAction === 'new' ? '📚 새 작품 등록' : '📚 작품 설정 편집') : 
    docType === 'page' ? (docAction === 'new' ? '📄 새 위키 문서' : '📄 문서 편집') :
    (docAction === 'new' ? '👤 새 캐릭터 추가' : '👤 캐릭터 상세 편집');

  const handleEditorKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      setRawText(rawText.substring(0, start) + "    " + rawText.substring(end));
      setTimeout(() => {
        editorRef.current.selectionStart = editorRef.current.selectionEnd = start + 4;
      }, 0);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave(false);
    }
  };

  const handleMacroInsert = (newText, newCursorPos) => {
    setRawText(newText);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
        editorRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center', fontWeight: 'bold' }}>에디터 로딩 중...</div>;

  return (
    <div className={styles.editorFullBleed}>
      
      <EditorSearch editorRef={editorRef} updatePreview={() => {}} />
      <MacroToolbar editorRef={editorRef} onInsert={handleMacroInsert} />

      <EditorHeader 
        badgeText={badgeText} 
        saveStatus={saveStatus}
        layoutMode={layoutMode}
        setLayoutMode={setLayoutMode}
        handleGoBack={handleGoBack} 
        handleSave={handleSave} 
      />

      <div className={styles.editorLayout}>
        
        <div style={{ flex: 1, display: layoutMode === 'focus' ? 'none' : 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
            <EditorPreviewPane
              isPreviewOpen={true}
              title={title}
              docType={docType}
              workMeta={workMeta}
              charProps={charProps}
              overviewText={overviewText}
              rawText={rawText}
            />
        </div>

        {layoutMode === 'dual' && (
            <div className={styles.paneResizer}>
              <div style={{ width: '4px', height: '30px', background: 'var(--text-secondary)', borderRadius: '2px', opacity: 0.5 }}></div>
            </div>
        )}

        <div style={{ flex: 1, display: layoutMode === 'preview' ? 'none' : 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
            <EditorWritePane
              docType={docType}
              title={title}
              setTitle={setTitle}
              workMeta={workMeta}
              setWorkMeta={setWorkMeta}
              charProps={charProps}
              setCharProps={setCharProps}
              themeColor={themeColor}
              setThemeColor={setThemeColor}
              cardLabels={cardLabels}
              setCardLabels={setCardLabels}
              workContext={workContext}
              isHidden={isHidden}
              setIsHidden={setIsHidden}
              overviewText={overviewText}
              setOverviewText={setOverviewText}
              rawText={rawText}
              setRawText={setRawText}
              editorRef={editorRef}
              handleEditorKeyDown={handleEditorKeyDown}
            />
        </div>

      </div>
    </div>
  );
};

export default EditorPage;