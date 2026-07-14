// 파일 위치: src/domains/work/FloatingLeftTree.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, FileText, ChevronDown, ChevronRight, Menu, Network } from 'lucide-react';
import styles from '../../pages/WorkDetail/WorkDetail.module.css';

const FloatingLeftTree = ({ workId, pageId, wikiPages = [] }) => {
  const navigate = useNavigate();

  const [openNodes, setOpenNodes] = useState(() => JSON.parse(localStorage.getItem(`galpi-tree-open-${workId}`) || '[]'));
  const [iconPrefs, setIconPrefs] = useState(() => JSON.parse(localStorage.getItem(`galpi-tree-icons-${workId}`) || '{}'));

  const safeWikiPages = Array.isArray(wikiPages) ? wikiPages : [];
  const rootPages = safeWikiPages.filter(p => !p.parentId);

  const toggleFolder = (e, id) => {
    e.stopPropagation();
    let newOpen;
    if (openNodes.includes(id)) newOpen = openNodes.filter(n => n !== id);
    else newOpen = [...openNodes, id];
    setOpenNodes(newOpen);
    localStorage.setItem(`galpi-tree-open-${workId}`, JSON.stringify(newOpen));
  };

  const toggleIcon = (e, id, hasChildren) => {
    e.stopPropagation();
    const types = ['folder', 'tree', 'file'];
    const current = iconPrefs[id] || (hasChildren ? 'folder' : 'file');
    const nextIdx = (types.indexOf(current) + 1) % types.length;
    
    const newPrefs = { ...iconPrefs, [id]: types[nextIdx] };
    setIconPrefs(newPrefs);
    localStorage.setItem(`galpi-tree-icons-${workId}`, JSON.stringify(newPrefs));
  };

  const renderTree = (pages, level = 0) => {
    if (!pages || pages.length === 0) return null;
    
    return (
      <ul className={`${styles.treeUl} ${level === 0 ? styles.rootTree : ''}`}>
        {pages.map(page => {
          const children = safeWikiPages.filter(p => String(p.parentId) === String(page.id));
          const hasChildren = children.length > 0;
          const isActive = String(page.id) === String(pageId);
          const isOpen = openNodes.includes(page.id) || isActive;
          
          const currentIconType = iconPrefs[page.id] || (hasChildren ? 'folder' : 'file');

          return (
            <li key={page.id} className={styles.treeLi}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '2px 0' }}>
                
                <div onClick={(e) => hasChildren && toggleFolder(e, page.id)} style={{ width: '20px', display: 'flex', justifyContent: 'center', cursor: hasChildren ? 'pointer' : 'default', color: 'var(--text-secondary)' }}>
                  {hasChildren ? (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : null}
                </div>

                <div 
                  className={`${styles.treeNodeRow} ${isActive ? styles.activePage : ''}`}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => navigate(`/work/${workId}?pageId=${page.id}`)}
                >
                  <div onClick={(e) => toggleIcon(e, page.id, hasChildren)} style={{ marginRight: '6px', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }} title="클릭하여 아이콘 변경">
                    {currentIconType === 'folder' && <Folder size={14} fill="currentColor" />}
                    {currentIconType === 'tree' && <Network size={14} />}
                    {currentIconType === 'file' && <FileText size={14} />}
                  </div>
                  
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{page.title}</span>
                </div>
              </div>

              {hasChildren && isOpen && renderTree(children, level + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className={styles.floatingLeftTree}>
      
      <div className={styles.treeContent}>
        <div style={{ fontSize: '15px', fontWeight: 900, color: 'var(--primary-color)', marginBottom: '12px', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
          🗂️ 문서 트리
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {rootPages.length > 0 ? (
            renderTree(rootPages)
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '20px' }}>
              생성된 하위 문서가 없습니다.
            </div>
          )}
        </div>
      </div>

      <div className={styles.treeHandle} title="문서 트리 열기">
        <Menu size={20} />
      </div>
      
    </div>
  );
};

export default FloatingLeftTree;