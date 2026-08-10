// 파일 위치: src/domains/memo/fab/hooks/useFabMemoTags.js
import { useMemo } from 'react';

export const useFabMemoTags = (memoData) => {
  const tagList = useMemo(() => {
    const counts = {};
    
    memoData.forEach(m => {
      if (m.isTrash) return;
      if (m.tags) {
        const tags = m.tags.split(',').map(t => t.trim()).filter(Boolean);
        tags.forEach(t => {
          counts[t] = (counts[t] || 0) + 1;
        });
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [memoData]);

  return { tagList };
};