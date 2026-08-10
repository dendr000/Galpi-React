import { useState } from 'react';

export const usePageTab = ({ memos, setMemos, currentFolder }) => {
  const [mainTabs, setMainTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);

  const [isSplitMode, setIsSplitMode] = useState(false);
  const [splitTabs, setSplitTabs] = useState([]);
  const [splitTabId, setSplitTabId] = useState(null);

  const handleOpenTab = (memo, paneType = 'main') => {
    const newId = memo ? memo.id : `local_${Date.now()}`;
    let targetMemo = memo;

    if (!memo) {
      targetMemo = { 
        id: newId, folder: currentFolder === '전체 메모' ? '기타' : currentFolder, 
        title: "새로운 메모", content: "", updatedAt: Date.now(), isTrash: false 
      };
      setMemos(prev => [targetMemo, ...prev]);
    }

    if (paneType === 'main') {
      setMainTabs(prev => {
        if (!prev.find(t => String(t.id) === String(targetMemo.id))) return [...prev, targetMemo];
        return prev;
      });
      setActiveTabId(targetMemo.id);
    } else {
      setSplitTabs(prev => {
        if (!prev.find(t => String(t.id) === String(targetMemo.id))) return [...prev, targetMemo];
        return prev;
      });
      setSplitTabId(targetMemo.id);
    }
  };

  const handleCloseTab = (e, memoId, paneType = 'main') => {
    e.stopPropagation();

    if (paneType === 'main') {
      const newTabs = mainTabs.filter(t => String(t.id) !== String(memoId));
      setMainTabs(newTabs);
      if (String(activeTabId) === String(memoId)) {
        setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
      }
    } else {
      const newTabs = splitTabs.filter(t => String(t.id) !== String(memoId));
      setSplitTabs(newTabs);
      if (String(splitTabId) === String(memoId)) {
        setSplitTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
      }
      if (newTabs.length === 0) {
        setIsSplitMode(false);
      }
    }
  };

  const toggleSplitMode = () => {
    if (isSplitMode) {
      setIsSplitMode(false);
    } else {
      setIsSplitMode(true);
      if (splitTabs.length === 0 && activeTabId) {
        const currentMemo = mainTabs.find(m => String(m.id) === String(activeTabId));
        if (currentMemo) {
          setSplitTabs([currentMemo]);
          setSplitTabId(currentMemo.id);
        }
      }
    }
  };

  return {
    mainTabs, splitTabs, activeTabId, setActiveTabId, splitTabId, setSplitTabId,
    isSplitMode, toggleSplitMode, handleOpenTab, handleCloseTab
  };
};