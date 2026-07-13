import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../pages/WorkDetail/WorkDetail.module.css';

const FloatingLeftTree = ({ workId, pageId, wikiPages }) => {
  const navigate = useNavigate();
  const [openFolders, setOpenFolders] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`galpi-tree-open-${workId}`) || '{}'); } catch(e) { return {}; }
  });

  const rootPages = wikiPages.filter(p => !p.parentId).sort((a,b) => (a.orderNum||0) - (b.orderNum||0));
  const childrenMap = {};
  wikiPages.forEach(p => {
    if (p.parentId) {
      if (!childrenMap[p.parentId]) childrenMap[p.parentId] = [];
      childrenMap[p.parentId].push(p);
    }
  });

  Object.values(childrenMap).forEach(arr => arr.sort((a,b) => (a.orderNum||0) - (b.orderNum||0)));

  const toggleFolder = (e, id) => {
    e.stopPropagation();
    const newOpen = { ...openFolders, [id]: !openFolders[id] };
    setOpenFolders(newOpen);
    localStorage.setItem(`galpi-tree-open-${workId}`, JSON.stringify(newOpen));
  };

  const renderTree = (pages) => {
    return (
      <ul className={styles.treeUl}>
        {pages.map(p => {
          const hasChildren = childrenMap[p.id] && childrenMap[p.id].length > 0;
          const isActive = String(pageId) === String(p.id);
          const isOpen = openFolders[p.id] || isActive;
          
          return (
            <li key={p.id} className={styles.treeLi}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                {hasChildren ? (
                  <span onClick={(e) => toggleFolder(e, p.id)} style={{ width: '14px', height: '14px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-secondary)', cursor: 'pointer', transition: '0.2s', userSelect: 'none', transform: isOpen ? 'none' : 'rotate(-90deg)' }}>▼</span>
                ) : (
                  <span style={{ width: '14px', height: '14px', flexShrink: 0 }}></span>
                )}
                <div className={`${styles.treeNodeRow} ${isActive ? styles.activePage : ''}`} style={{ flex: 1 }} onClick={() => navigate(`/work/${workId}?pageId=${p.id}`)}>
                  <img src={hasChildren ? '/img/svg/folder.svg' : '/img/svg/folderTree.svg'} style={{ width: '14px', height: '14px', marginRight: '6px', objectFit: 'contain' }} alt="icon" />
                  <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{p.title}</span>
                </div>
              </div>
              {hasChildren && isOpen && (
                <div style={{ display: 'block' }}>
                  {renderTree(childrenMap[p.id])}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className={styles.floatingLeftTree}>
      <div className={styles.treeContent}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <img src="/img/svg/folder.svg" style={{ width: '16px', height: '16px', objectFit: 'contain' }} alt="탐색" />
            <span style={{ fontWeight: 900, color: 'var(--primary-color)', fontSize: '14px' }}>문서 탐색</span>
          </div>
          <button className="wiki-btn" style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 900, background: 'var(--table-bg-alt)', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', borderRadius: '4px', cursor: 'pointer' }} onClick={() => alert('관계도 모달 기능은 개발 중입니다.')}>🌌 관계도</button>
        </div>
        <div style={{ fontSize: '13px', lineHeight: 1.6, flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingRight: '5px' }}>
          <ul className={`${styles.treeUl} ${styles.rootTree}`}>
            <li className={styles.treeLi}>
              <div className={`${styles.treeNodeRow} ${!pageId ? styles.activePage : ''}`} onClick={() => navigate(`/work/${workId}`)}>
                <img src="/img/svg/folder.svg" style={{ width: '14px', height: '14px', flexShrink: 0, marginRight: '6px', objectFit: 'contain' }} alt="root-icon" />
                <span style={{ fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>작품 메인 설정</span>
              </div>
            </li>
            {rootPages.length > 0 && renderTree(rootPages)}
          </ul>
        </div>
      </div>
      <div className={styles.treeHandle} title="탐색기 열기">
        <div className={styles.dash}></div><div className={styles.dash}></div><div className={styles.dash}></div>
      </div>
    </div>
  );
};

export default FloatingLeftTree;