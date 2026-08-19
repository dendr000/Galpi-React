// 파일 위치: src/domains/fab_tools/dict/hooks/useDictSearch.js
import { useState, useMemo } from 'react';

export const useDictSearch = (globalDictList) => {
  const [dictSearch, setDictSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState(''); 

  const filteredList = useMemo(() => {
    if (submittedSearch.trim() === '') return [];
    
    return globalDictList
      .filter(d => 
        d.word.includes(submittedSearch) || d.translation.includes(submittedSearch)
      )
      // ★ 검색된 결과값을 원문(word) 기준 가나다순으로 정렬
      .sort((a, b) => a.word.localeCompare(b.word, 'ko-KR'));
  }, [globalDictList, submittedSearch]);

  const submitSearch = () => {
    setSubmittedSearch(dictSearch);
  };

  return {
    dictSearch,
    setDictSearch,
    submittedSearch,
    submitSearch,
    filteredList
  };
};