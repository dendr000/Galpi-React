// src/pages/Editor/components/EditorPreviewPane.jsx
import React from 'react';
import styles from '../EditorPage.module.css';
import MarkdownRenderer from '../../../domains/macro/MarkdownRenderer';
import { IconPen } from './EditorIcons';

const EditorPreviewPane = ({
  isPreviewOpen, title, docType, workMeta, charProps, overviewText, rawText, onNodeClick // ★ 부모에게서 onNodeClick 수신
}) => {
  if (!isPreviewOpen) return null;

  return (
    <div className={`${styles.previewPane} ${!isPreviewOpen ? styles.hidden : ''}`}>
      <h1 style={{ fontSize: '28px', color: 'var(--primary-color)', marginTop: 0, marginBottom: '15px' }}>
        {title || '제목 없음'}
      </h1>
      
      <div className={styles.previewMetaBox}>
        {docType === 'work' && workMeta.genre && workMeta.genre.split(',').map((g, idx) => (
          g.trim() && <span key={idx} className={styles.previewTag}>{g.trim()}</span>
        ))}
        {docType === 'work' && workMeta.creator && (
          <span className={styles.previewInfo} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <IconPen /> {workMeta.creator}
          </span>
        )}
        {docType === 'char' && charProps.map((p, idx) => (
          p.key && p.val && p.key !== '부제목' && (
            <span key={idx} className={styles.previewInfo}><strong>{p.key}</strong>: {p.val}</span>
          )
        ))}
      </div>
      
      {docType === 'work' && overviewText && (
        <>
          <h3 className="md-h1">1. 개요</h3>
          {/* ★ 개요 렌더러에 이벤트 연결 */}
          <MarkdownRenderer rawText={overviewText} onNodeClick={onNodeClick} />
          <h3 className="md-h1" style={{ marginTop: '30px' }}>2. 설정</h3>
        </>
      )}

      {/* ★ 본문 렌더러에 이벤트 연결 */}
      <MarkdownRenderer rawText={rawText || "마크다운을 작성하면 이곳에 표시됩니다."} onNodeClick={onNodeClick} />
    </div>
  );
};

export default EditorPreviewPane;