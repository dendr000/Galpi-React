// 파일 위치: src/domains/memo/fab/hooks/useFabMemoTree.js
import { useState, useMemo } from 'react';
import { buildMemoTree } from '../../shared/utils/memoTreeUtils';

export const useFabMemoTree = ({ memoFolders, memoData, sortMap }) => {
  const [expandedFolders, setExpandedFolders] = useState({
    '기타': true
  });

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