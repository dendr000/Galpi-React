// 파일 위치: src/domains/memo/fab/hooks/useFabMemoTree.js
import { useState, useMemo, useEffect } from 'react';
import { buildMemoTree } from '../../shared/utils/memoTreeUtils';

export const useFabMemoTree = ({ memoFolders, memoData, sortMap, activeMemoId }) => {
  const [expandedFolders, setExpandedFolders] = useState({ '기타': true });

  // ★ VSC 방식: 현재 활성화된 메모의 폴더 경로를 스캔하여 트리를 자동으로 펼쳐주는 오토리빌(Auto-Reveal) 엔진
  useEffect(() => {
    if (activeMemoId && memoData && memoData.length > 0) {
      const activeMemo = memoData.find(m => String(m.id) === String(activeMemoId));
      if (activeMemo && activeMemo.folder && activeMemo.folder !== '기타' && activeMemo.folder !== '전체 메모') {
        const pathsToExpand = {};
        const parts = activeMemo.folder.split('/');
        let currentPath = '';
        
        // 경로를 쪼개어 부모부터 자식까지 모든 뎁스(Depth)의 폴더를 타겟팅
        parts.forEach(part => {
          currentPath = currentPath ? `${currentPath}/${part}` : part;
          pathsToExpand[currentPath] = true;
        });
        
        setExpandedFolders(prev => {
          // 필요한 폴더가 이미 모두 열려있다면 렌더링 낭비를 막기 위해 스킵
          const isAllExpanded = Object.keys(pathsToExpand).every(path => prev[path]);
          if (isAllExpanded) return prev;
          
          return { ...prev, ...pathsToExpand };
        });
      }
    }
  }, [activeMemoId, memoData]);

  const toggleFolder = (folderPath) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderPath]: !prev[folderPath]
    }));
  };

  const treeData = useMemo(() => {
    return buildMemoTree(memoFolders, memoData, sortMap);
  }, [memoFolders, memoData, sortMap]);

  return { treeData, expandedFolders, toggleFolder };
};