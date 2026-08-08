// 파일 위치: src/pages/Editor/components/EditorSettingsModal.jsx
// 기능 요약: 답답했던 700px 제약을 해제하고 1000px로 대폭 확장하여 쾌적한 속성/개요 입력을 보장하는 모달 
import React from 'react';
import styles from '../EditorPage.module.css';
import WorkMetaPanel from './WorkMetaPanel';
import CharMetaPanel from './CharMetaPanel';
import { IconX } from './EditorIcons';

const EditorSettingsModal = ({
  isOpen, onClose, docType, title, 
  workMeta, setWorkMeta, 
  charProps, setCharProps, 
  themeColor, setThemeColor, 
  cardLabels, setCardLabels, 
  workContext, isHidden, setIsHidden, 
  overviewText, setOverviewText
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0, 0, 0, 0.5)', zIndex: 10000,
      display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(2px)'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-color)', 
        width: '1000px', // ★ 700px에서 1000px로 넓이 대폭 확장
        maxWidth: '95%', maxHeight: '90vh',
        borderRadius: '12px', display: 'flex', flexDirection: 'column',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)', overflow: 'hidden'
      }} onClick={e => e.stopPropagation()}>
        
        <div style={{
          padding: '20px 25px', borderBottom: '1px solid var(--border-color)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-color)'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>문서 속성 및 개요 설정</h2>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', color: 'var(--text-secondary)',
            cursor: 'pointer', display: 'flex', padding: '4px'
          }}>
            <IconX />
          </button>
        </div>

        <div style={{ padding: '25px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {docType === 'work' && (
            <WorkMetaPanel workMeta={workMeta} setWorkMeta={setWorkMeta} />
          )}

          {docType === 'char' && (
            <CharMetaPanel
              title={title} charProps={charProps} setCharProps={setCharProps}
              themeColor={themeColor} setThemeColor={setThemeColor}
              cardLabels={cardLabels} setCardLabels={setCardLabels}
              workContext={workContext} isHidden={isHidden} setIsHidden={setIsHidden}
            />
          )}

          {docType === 'work' && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: 'var(--text-primary)' }}>개요 (상세 본문)</label>
              <textarea 
                className={styles.editorTextarea} 
                style={{ minHeight: '150px', resize: 'vertical' }} 
                placeholder="개요에 들어갈 상세 내용을 마크다운으로 작성하세요..."
                value={overviewText}
                onChange={e => setOverviewText(e.target.value)}
              />
            </div>
          )}
        </div>

        <div style={{
          padding: '15px 25px', borderTop: '1px solid var(--border-color)',
          display: 'flex', justifyContent: 'flex-end', background: 'var(--surface-color)'
        }}>
          <button className="wiki-btn" onClick={onClose} style={{
            background: 'var(--primary-color)', color: 'white', fontWeight: 'bold', padding: '8px 20px'
          }}>
            완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorSettingsModal;