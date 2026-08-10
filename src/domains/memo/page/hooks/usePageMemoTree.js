// 파일 위치: src/domains/memo/page/hooks/usePageMemoTree.js
import { useState, useMemo } from 'react';
import { buildMemoTree } from '../../shared/utils/memoTreeUtils';

export const usePageMemoTree = ({ folders, memos }) => {
  const [expandedFolders, setExpandedFolders] = useState({
    '기타': true,
    '전체 메모': true
  });

  const toggleFolder = (folderPath) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderPath]: !prev[folderPath]
    }));
  };

  const treeData = useMemo(() => {
    return buildMemoTree(folders, memos, {});
  }, [folders, memos]);

  return { treeData, expandedFolders, toggleFolder };
};