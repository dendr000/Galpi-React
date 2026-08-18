import { useState, useMemo } from 'react';

export const useDictSearch = (globalDictList) => {
  const [dictSearch, setDictSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState(''); 

  const filteredList = useMemo(() => {
    if (submittedSearch.trim() === '') return [];
    return globalDictList.filter(d => 
      d.word.includes(submittedSearch) || d.translation.includes(submittedSearch)
    );
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