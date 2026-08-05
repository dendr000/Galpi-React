import { useState, useMemo } from 'react';
import { buildMemoTree } from '../utils/memoTreeUtils';

export const useMemoTree = ({ memoFolders, memoData, sortMap }) => {
  // ★ 레거시 폴더 상태 제거, '기타'만 기본 확장
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