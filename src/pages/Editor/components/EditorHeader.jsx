// 파일 위치: src/pages/Editor/components/EditorHeader.jsx
// 기능 요약: 공간 낭비를 유발하던 텍스트를 제거하고 100% SVG 기반으로 경량화된 헤더 컴포넌트
import React from 'react';
import styles from '../EditorPage.module.css';
import { 
    IconArrowLeft, IconSave, IconSpinner, IconCheck, IconError, 
    IconEye, IconDual, IconPen, IconSliders 
} from './EditorIcons';

const EditorHeader = ({ badgeText, saveStatus, layoutMode, setLayoutMode, handleGoBack, handleSave, onOpenSettings }) => {
  return (
    <header className={styles.editorHeader}>
      <div 
        className={styles.headerInner}
        style={{
          width: '100%',
          maxWidth: layoutMode === 'dual' ? '100%' : '1000px',
          minWidth: 0,
          transition: 'max-width 0.3s ease'
        }}
      >
        <div className={styles.headerLeft}>
          <button 
            className="wiki-btn" 
            style={{ display: 'flex', alignItems: 'center', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '6px 10px' }} 
            onClick={handleGoBack}
            title="돌아가기"
          >
            <IconArrowLeft />
          </button>
          <span className={styles.modeBadge} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {badgeText}
          </span>
          
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 'bold', marginLeft: '10px', transition: '0.3s' }}>
              {saveStatus === 'saving' && <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}><IconSpinner /> 저장 중...</span>}
              {saveStatus === 'saved' && <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}><IconCheck /> 저장됨</span>}
              {saveStatus === 'error' && <span style={{ color: '#e53e3e', display: 'flex', alignItems: 'center', gap: '4px' }}><IconError /> 저장 실패</span>}
          </span>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0, padding: '0 15px' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'var(--table-bg-alt)', padding: '4px', borderRadius: '6px', border: '1px solid var(--border-color)', flexShrink: 0 }}>
              <button 
                  onClick={() => setLayoutMode('preview')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', background: layoutMode === 'preview' ? 'var(--surface-color)' : 'transparent', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: layoutMode === 'preview' ? 'bold' : 'normal', color: layoutMode === 'preview' ? 'var(--primary-color)' : 'var(--text-secondary)' }}
                  title="뷰어 모드 (프리뷰 100%)"
              >
                  <IconEye /> 뷰어
              </button>
              <button 
                  onClick={() => setLayoutMode('dual')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', background: layoutMode === 'dual' ? 'var(--surface-color)' : 'transparent', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: layoutMode === 'dual' ? 'bold' : 'normal', color: layoutMode === 'dual' ? 'var(--primary-color)' : 'var(--text-secondary)' }}
                  title="듀얼 뷰 (에디터 50 : 프리뷰 50)"
              >
                  <IconDual /> 듀얼
              </button>
              <button 
                  onClick={() => setLayoutMode('focus')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', background: layoutMode === 'focus' ? 'var(--surface-color)' : 'transparent', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: layoutMode === 'focus' ? 'bold' : 'normal', color: layoutMode === 'focus' ? 'var(--primary-color)' : 'var(--text-secondary)' }}
                  title="작업뷰 / 집중 모드 (에디터 100%)"
              >
                  <IconPen /> 집중
              </button>
          </div>
        </div>

        <div className={styles.headerRight}>
          <button 
            className="wiki-btn" 
            style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '6px 10px' }} 
            onClick={onOpenSettings}
            title="문서 속성 및 개요"
          >
            <IconSliders />
          </button>

          <button 
            className="wiki-btn" 
            style={{ display: 'flex', alignItems: 'center', background: 'var(--primary-color)', color: 'white', padding: '6px 10px' }} 
            onClick={() => handleSave(false)}
            title="출간하기 (수동 저장)"
          >
            <IconSave />
          </button>
        </div>
      </div>
    </header>
  );
};

export default EditorHeader;