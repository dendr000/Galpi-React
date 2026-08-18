// src/domains/fab_tools/boilerplate/hooks/useBoilerplateSearch.js
import { useState, useMemo } from 'react';

export const useBoilerplateSearch = (bpList) => {
  const [bpSearch, setBpSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');

  const matchedList = useMemo(() => {
    if (submittedSearch.trim() === '') return [];
    return bpList.filter(b => 
      b.title.toLowerCase().includes(submittedSearch.toLowerCase()) || 
      b.content.toLowerCase().includes(submittedSearch.toLowerCase())
    );
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