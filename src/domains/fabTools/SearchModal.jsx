// 파일 위치: src/domains/fabTools/SearchModal.jsx
// 기능 요약: 인물명뿐 아니라 나이/소속/능력 같은 속성, 작품명·작가·분류로도 필터링할 수 있는
// 전역 인물 검색. 예전엔 window.scrollToCharacter라는 어디에도 정의되지 않은 함수를 불러서
// 아무 동작도 하지 않았다 — 이제 실제로 해당 작품 페이지로 이동한 뒤 카드가 렌더링될 때까지
// 짧게 폴링하다가 스크롤 + 하이라이트한다(.galpi-search-highlight는 global.css에 정의됨).
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosCore';
import ModalOverlay from '../../components/common/ModalOverlay';
import { useModalStore } from '../../store/useModalStore';
import { extractMeta } from '../../utils/markdownParser';
import { IconSearch, IconBook, IconPen, IconArrowRight } from '../../components/common/icons/DomainIcons';

// 캐릭터 카드의 dynamicProperties JSON 안에는 레이아웃/내부 메타 값도 섞여 있어서, 검색 및
// 결과 하단 속성 표시에서는 실제 "인물 속성"만 남기고 걸러낸다.
const IGNORED_PROP_KEYS = ['workId', '작품명', '제작자', 'cardImgX', 'cardImgY', 'cardImgScale', 'themeColor', 'pageBody', 'sortOrder', 'imageCode', 'id', 'name'];
const SNIPPET_HIDDEN_KEYS = ['나이']; // 이름 옆에 (나이)로 이미 표시되므로 스니펫에서는 중복 제외

const parseDynamicProps = (raw) => {
  try {
    let parsed = JSON.parse(raw || '{}');
    if (typeof parsed === 'string') parsed = JSON.parse(parsed);
    return parsed || {};
  } catch (e) { return {}; }
};

const SearchModal = ({ currentWorkId }) => {
  const { closeModal } = useModalStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [works, setWorks] = useState([]);
  const [chars, setChars] = useState([]);

  const [nameQuery, setNameQuery] = useState('');
  const [propQuery, setPropQuery] = useState('');
  const [workQuery, setWorkQuery] = useState('');

  useEffect(() => {
    Promise.all([api.get('/api/works'), api.get('/api/characters')]).then(([wRes, cRes]) => {
      setWorks(wRes.data);
      setChars(cRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const workMap = useMemo(() => {
    const m = {};
    works.forEach(w => {
      const meta = extractMeta(w.description || '');
      m[w.id] = { ...w, alias: meta?.meta?.alias || '' };
    });
    return m;
  }, [works]);

  const enriched = useMemo(() => {
    return chars.map(c => {
      const dp = parseDynamicProps(c.dynamicProperties);
      const propEntries = Object.entries(dp).filter(([k, v]) =>
        typeof v === 'string' && v.trim() !== '' && !IGNORED_PROP_KEYS.includes(k) && !k.startsWith('_')
      );
      const propText = [c.age, c.gender, c.species, ...propEntries.map(([, v]) => v)].filter(Boolean).join(' ');
      return { ...c, _propEntries: propEntries, _propText: propText, _work: workMap[c.workId] };
    }).filter(c => c._work);
  }, [chars, workMap]);

  const nq = nameQuery.trim().toLowerCase();
  const pq = propQuery.trim().toLowerCase();
  const wq = workQuery.trim().toLowerCase();
  const hasQuery = !!(nq || pq || wq);

  const results = useMemo(() => {
    if (!hasQuery) return [];
    const matched = enriched.filter(c => {
      if (nq && !c.name.toLowerCase().includes(nq)) return false;
      if (pq && !c._propText.toLowerCase().includes(pq)) return false;
      if (wq) {
        const w = c._work;
        const haystack = `${w.title} ${w.alias} ${w.creator || ''} ${w.genre || ''}`.toLowerCase();
        if (!haystack.includes(wq)) return false;
      }
      return true;
    });
    // 작품 필터링은 별도 입력창이 있으니, 기본 정렬은 작품과 무관하게 이름 가나다순으로.
    return matched.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }, [enriched, nq, pq, wq, hasQuery]);

  const LIMIT = 60;
  const shown = results.slice(0, LIMIT);

  const goToCharacter = (c) => {
    closeModal();
    const targetId = `char-card-${c.id}`;
    const tryScroll = () => {
      const el = document.getElementById(targetId);
      if (!el) return false;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('galpi-search-highlight');
      setTimeout(() => el.classList.remove('galpi-search-highlight'), 1500);
      return true;
    };
    navigate(`/work/${c.workId}`);
    // 다른 작품으로 이동한 경우 카드가 비동기로 로드되므로, 나타날 때까지 짧게 폴링한다(최대 4초).
    let attempts = 0;
    const timer = setInterval(() => {
      attempts++;
      if (tryScroll() || attempts > 40) clearInterval(timer);
    }, 100);
  };

  const clearAll = () => { setNameQuery(''); setPropQuery(''); setWorkQuery(''); };

  return (
    <>
      <style>{`
        @keyframes galpiSearchRowIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .galpi-search-row { transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease; animation: galpiSearchRowIn .25s ease both; }
        .galpi-search-row:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.1); border-color: var(--primary-color) !important; }
        .galpi-search-input:focus { border-color: var(--primary-color) !important; }
      `}</style>
      <ModalOverlay
        title={<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IconSearch size={16} /> 전역 인물 검색</span>}
        onClose={closeModal}
        width="640px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="text" value={nameQuery} onChange={e => setNameQuery(e.target.value)}
            placeholder="인물명 검색..." autoFocus autoComplete="off" spellCheck="false"
            className="galpi-search-input"
            style={{ padding: '12px 14px', fontSize: '14px', fontWeight: 700, border: '2px solid var(--primary-color)', borderRadius: '8px', width: '100%', boxSizing: 'border-box', background: 'var(--surface-color)', color: 'var(--text-primary)', outline: 'none' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text" value={propQuery} onChange={e => setPropQuery(e.target.value)}
              placeholder="속성 검색 (나이, 능력, 소속...)" autoComplete="off" spellCheck="false"
              className="galpi-search-input"
              style={{ flex: 1, minWidth: 0, padding: '9px 12px', fontSize: '12.5px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none' }}
            />
            <input
              type="text" value={workQuery} onChange={e => setWorkQuery(e.target.value)}
              placeholder="작품명 / 작가 / 분류 검색" autoComplete="off" spellCheck="false"
              className="galpi-search-input"
              style={{ flex: 1, minWidth: 0, padding: '9px 12px', fontSize: '12.5px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>
          {hasQuery && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <span>{results.length}명 검색됨{results.length > LIMIT ? ` (상위 ${LIMIT}명 표시)` : ''}</span>
              <button onClick={clearAll} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>필터 초기화</button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
            {loading && <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>불러오는 중...</div>}

            {!loading && !hasQuery && (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>
                인물명, 속성, 작품/작가/분류 중 하나 이상 입력하면<br />전체 {enriched.length}명의 인물 중에서 찾아드려요.
              </div>
            )}

            {!loading && hasQuery && shown.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>일치하는 인물이 없습니다.</div>
            )}

            {shown.map((c, i) => {
              const isCurrent = String(c.workId) === String(currentWorkId);
              const snippetEntries = c._propEntries.filter(([k]) => !SNIPPET_HIDDEN_KEYS.includes(k)).slice(0, 3);
              return (
                <div
                  key={c.id}
                  className="galpi-search-row"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', animationDelay: `${Math.min(i, 14) * 0.02}s` }}
                  onClick={() => goToCharacter(c)}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 900, color: 'var(--text-primary)', fontSize: '14.5px' }}>{c.name}</span>
                      {c.age && <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>({c.age})</span>}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10.5px', fontWeight: 700, padding: '2px 7px', borderRadius: '999px', background: isCurrent ? 'var(--primary-color)' : 'var(--table-bg-alt)', color: isCurrent ? '#fff' : 'var(--text-secondary)' }}>
                        <IconBook size={10} color={isCurrent ? '#fff' : 'var(--text-secondary)'} /> {isCurrent ? '현재 작품' : c._work.title}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px', fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      <IconPen size={10} /> {c._work.creator || '미상'}
                      {snippetEntries.map(([k, v]) => (
                        <span key={k}>· {k}: {v}</span>
                      ))}
                    </div>
                  </div>
                  <IconArrowRight size={16} color="var(--primary-color)" className="" />
                </div>
              );
            })}
          </div>
        </div>
      </ModalOverlay>
    </>
  );
};

export default SearchModal;
