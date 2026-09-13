// 파일 위치: src/domains/fabTools/dict/hooks/useDictSearch.js
// 서버사이드 검색으로 전면 개편: Enter를 누를 때만 백엔드에 키워드를 보내 일부 결과만 받아온다.
// (기존에는 globalDictList 전체를 useMemo로 클라이언트 필터링 — 19만 건 이상에서 브라우저/서버 크래시 유발)
// ★ 사전이 작품별로 나뉘지 않는 전역 단일 사전으로 바뀌면서 workId 파라미터도 제거했다 —
// 등록한 작품이 아니면 검색이 안 되던 혼란의 원인이 바로 이 workId 스코프였다.
import { useState, useCallback } from 'react';
import api from '../../../../api/axiosCore';

export const useDictSearch = () => {
  const [dictSearch, setDictSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [filteredList, setFilteredList] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const runSearch = useCallback(async (keyword) => {
    if (!keyword) {
      setFilteredList([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.get('/api/dicts/search', {
        params: { keyword }
      });
      setFilteredList(res.data);
    } catch (e) {
      console.error('사전 검색 실패', e);
      setFilteredList([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const submitSearch = useCallback(() => {
    const keyword = dictSearch.trim();
    setSubmittedSearch(keyword);
    runSearch(keyword);
  }, [dictSearch, runSearch]);

  // 저장/수정/삭제 후 현재 검색 결과를 최신 상태로 다시 불러올 때 사용 (입력창 값이 아니라 마지막 제출된 검색어 기준)
  const refreshSearch = useCallback(() => {
    runSearch(submittedSearch);
  }, [runSearch, submittedSearch]);

  return {
    dictSearch,
    setDictSearch,
    submittedSearch,
    submitSearch,
    refreshSearch,
    filteredList,
    isSearching
  };
};
