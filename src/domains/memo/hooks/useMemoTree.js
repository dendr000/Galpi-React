// 파일 위치: src/domains/memo/hooks/useMemoTree.js
import { useState, useMemo } from 'react';
import { buildMemoTree } from '../utils/memoTreeUtils';

export const useMemoTree = ({ memoFolders, memoData, sortMap }) => {
  // 기본적으로 '전체 메모'와 루트 경로들은 열려 있도록 초기화
  const [expandedFolders, setExpandedFolders] = useState({
    '전체 메모': true,
    '기타': true,
    '설정 아이디어': true
  });

  const toggleFolder = (folderPath) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderPath]: !prev[folderPath]
    }));
  };

  // 폴더나 메모 데이터가 바뀔 때만 트리를 재연산하여 성능 최적화
  const treeData = useMemo(() => {
    return buildMemoTree(memoFolders, memoData, sortMap);
  }, [memoFolders, memoData, sortMap]);

  return { treeData, expandedFolders, toggleFolder };
};