// 파일 위치: src/domains/memo/page/components/PageMemoTabList.jsx
// 기능 요약: 자신이 속한 패널(Main/Split)의 탭 배열만 독립적으로 렌더링하고 관리하는 네비게이터 바
import React from 'react';
import { XIcon, FileTextIcon, FolderIcon, SplitVerticalIcon } from '../../shared/components/MemoIcons';

const PageMemoTabList = ({ openedTabs, activeTabId, setActiveTabId, handleCloseTab, isSplitMode, toggleSplitMode, paneType }) => {
  if (openedTabs.length === 0 && paneType === 'split') return null;

  return (
    <div style={{ display: 'flex', background: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)', userSelect: 'none' }}>
      <div className="galpi-sidebar-scroll" style={{ display: 'flex', flex: 1, overflowX: 'auto' }}>
        
        {paneType === 'main' && (
          <div
            onClick={() => setActiveTabId(null)}
            style={{
              padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', borderRight: '1px solid var(--border-color)',
              background: activeTabId === null ? 'var(--bg-color)' : 'transparent',
              color: activeTabId === null ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTabId === null ? '900' : 'bold',
              borderBottom: activeTabId === null ? '2px solid var(--primary-color)' : '2px solid transparent',
              transition: 'all 0.2s', flexShrink: 0
            }}
          >
            <FolderIcon /> 게시판 목록
          </div>
        )}

        {openedTabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            style={{
              padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderRight: '1px solid var(--border-color)',
              background: String(activeTabId) === String(tab.id) ? 'var(--bg-color)' : 'transparent',
              color: String(activeTabId) === String(tab.id) ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: String(activeTabId) === String(tab.id) ? '900' : 'bold',
              borderBottom: String(activeTabId) === String(tab.id) ? '2px solid var(--primary-color)' : '2px solid transparent',
              minWidth: '120px', maxWidth: '200px', transition: 'background 0.2s', flexShrink: 0
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', opacity: 0.8 }}><FileTextIcon /></span>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{tab.title || '새로운 메모'}</span>
            
            <button 
              onClick={(e) => handleCloseTab(e, tab.id, paneType)} // ★ 자신이 속한 패널 정보(paneType)를 함께 전달
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', padding: '4px', borderRadius: '4px', opacity: 0.6, transition: '0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(229,62,62,0.1)'; e.currentTarget.style.color = '#e53e3e'; e.currentTarget.style.opacity = '1'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'inherit'; e.currentTarget.style.opacity = '0.6'; }}
              title="탭 닫기"
            >
              <XIcon size={12} />
            </button>
          </div>
        ))}
      </div>

      {paneType === 'main' && (
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px', borderLeft: '1px solid var(--border-color)' }}>
          <button
            onClick={toggleSplitMode}
            style={{
              background: isSplitMode ? 'rgba(59, 91, 219, 0.1)' : 'transparent',
              color: isSplitMode ? 'var(--primary-color)' : 'var(--text-secondary)',
              border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', fontSize: '11px', transition: '0.2s'
            }}
            title="상하 화면 분할"
          >
            <SplitVerticalIcon /> {isSplitMode ? '분할 닫기' : '화면 분할'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PageMemoTabList;