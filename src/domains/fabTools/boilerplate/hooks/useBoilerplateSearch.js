// 파일 위치: src/domains/fabTools/boilerplate/hooks/useBoilerplateSearch.js
import { useState, useMemo } from 'react';

export const useBoilerplateSearch = (bpList) => {
  const [bpSearch, setBpSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');

  const matchedList = useMemo(() => {
    if (submittedSearch.trim() === '') return [];
    
    return bpList
      .filter(b => 
        b.title.toLowerCase().includes(submittedSearch.toLowerCase()) || 
        b.content.toLowerCase().includes(submittedSearch.toLowerCase())
      )
      // ★ 검색된 결과값을 단축어 명칭(title) 기준 가나다순으로 정렬
      .sort((a, b) => a.title.localeCompare(b.title, 'ko-KR'));
  }, [bpList, submittedSearch]);

  const submitSearch = () => {
    setSubmittedSearch(bpSearch);
  };

  const clearSearch = () => {
    setBpSearch('');
    setSubmittedSearch('');
  };

  return {
    bpSearch,
    setBpSearch,
    submittedSearch,
    submitSearch,
    clearSearch,
    matchedList
  };
};