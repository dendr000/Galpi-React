// 파일 위치: src/domains/memo/hooks/useMemoTags.js
import { useMemo } from 'react';

export const useMemoTags = (memoData) => {
  const tagList = useMemo(() => {
    const counts = {};
    
    memoData.forEach(m => {
      if (m.isTrash) return; // 휴지통 데이터 제외
      if (m.tags) {
        const tags = m.tags.split(',').map(t => t.trim()).filter(Boolean);
        tags.forEach(t => {
          counts[t] = (counts[t] || 0) + 1;
        });
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count); // 많이 사용된 순서(내림차순) 정렬
  }, [memoData]);

  return { tagList };
};