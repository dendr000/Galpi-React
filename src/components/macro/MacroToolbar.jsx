// src/components/macro/MacroToolbar.jsx

import React, { useState } from 'react';
import styles from './MacroToolbar.module.css';

import { TableEditor, RadarEditor, BarEditor, TimelineEditor } from './tools/BasicMacroTools';
import RelationEditor from './tools/RelationEditor';

const MACRO_TOOLS = [
  { id: 'table', icon: 'table.svg', tooltip: '엑셀형 표 생성/편집기' },
  { id: 'bar', icon: 'barGraph.svg', tooltip: '상태창 게이지 바 에디터' },
  { id: 'radar', icon: 'radarChart.svg', tooltip: '방사형 스탯 차트 에디터' },
  { id: 'timeline', icon: 'timeline.svg', tooltip: '타임라인(연표)' },
  { id: 'relation', icon: 'relation.svg', tooltip: '비주얼 인물 관계도 캔버스' }
];

const MacroToolbar = ({ editorRef, onInsert }) => {
  const [activeTool, setActiveTool] = useState(null);

  const handleOpenModal = (tool) => {
    let text = "";
    if (editorRef.current) {
      const start = editorRef.current.selectionStart;
      const end = editorRef.current.selectionEnd;
      text = editorRef.current.value.substring(start, end);
    }
    // ★ 클릭 시점에 드래그된 텍스트를 캡처하여 tool 객체에 담아 전달합니다.
    setActiveTool({ ...tool, selectedText: text });
  };

  const handleCloseModal = () => setActiveTool(null);

  const handleInsertSnippet = (snippet) => {
    if (!editorRef.current) return;
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    
    onInsert(currentText.substring(0, start) + snippet + currentText.substring(end), start + snippet.length);
    handleCloseModal();
  };

  const renderActiveTool = () => {
    if (!activeTool) return null;
    
    const props = { 
      selectedText: activeTool.selectedText, 
      onInsert: handleInsertSnippet, 
      onCancel: handleCloseModal 
    };

    switch (activeTool.id) {
      case 'table': return <TableEditor {...props} />;
      case 'radar': return <RadarEditor {...props} />;
      case 'bar': return <BarEditor {...props} />;
      case 'timeline': return <TimelineEditor {...props} />;
      case 'relation': return <RelationEditor {...props} />;
      default: return null;
    }
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
          <div className={styles.modalContent} style={{ width: activeTool.id === 'relation' ? '1000px' : (activeTool.id === 'timeline' ? '500px' : 'max-content') }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{activeTool.tooltip} <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{activeTool.selectedText ? '(수정 모드)' : '(생성 모드)'}</span></h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}>&times;</button>
            </div>
            {renderActiveTool()}
          </div>
        </div>
      )}
    </>
  );
};

export default MacroToolbar;