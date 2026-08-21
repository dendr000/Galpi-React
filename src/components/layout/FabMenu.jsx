// 파일 위치: src/components/layout/FabMenu.jsx
// 기능 요약: 글로벌 모달 트리거들을 감싸고 있으며, 사전 및 상용구 데이터를 전역으로 패치하여 백그라운드 키보드 감시망에 연결하는 컴포넌트
// 버전: v2.7.0 (서브 모달 스택 구조 대응)

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useModalStore } from '../../store/useModalStore';
import api from '../../api/axiosCore';

import ClipboardModal from '../../domains/fabTools/ClipboardModal';
import DictModal from '../../domains/fabTools/dict/DictModal';
import SearchModal from '../../domains/fabTools/SearchModal';
import RecentModal from '../../domains/fabTools/RecentModal';
import MemoModal from '../../domains/memo/fab/FabMemoModal';

// 상용구 모듈 인젝션
import BoilerplateModal from '../../domains/fabTools/boilerplate/BoilerplateModal';
import BoilerplateSuggestPopup from '../../domains/fabTools/boilerplate/components/BoilerplateSuggestPopup';
import { useBoilerplateCore } from '../../domains/fabTools/boilerplate/hooks/useBoilerplateCore';
import { useBoilerplateListener } from '../../domains/fabTools/boilerplate/hooks/useBoilerplateListener';

const FabMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // ★ subModal 상태 추가 호출
  const { activeModal, subModal, openModal, closeModal, addClipboard } = useModalStore();
  const navigate = useNavigate();
  const location = useLocation();

  // ★ 픽스 1: ?id=15 형태의 주소에서도 정확히 작품 번호를 뽑아내도록 스캐너 업그레이드
  const searchParams = new URLSearchParams(location.search);
  const currentWorkId = searchParams.get('workId') || searchParams.get('id') || location.pathname.match(/\/work\/(\d+)/)?.[1] || 'global';

  const [globalDictList, setGlobalDictList] = useState([]);
  const [globalBpList, setGlobalBpList] = useState([]); 
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2000);
  };

  // ★ Alt+H 실시간 순환 치환용으로 "현재 작품에 등록된" 사전만 불러옴.
  // 예전엔 workId=global 전체(19만 건 이상)를 무조건 통째로 로딩해서 백엔드 OOM/브라우저 크래시의
  // 실제 원인이었음 — 전역 사전은 이제 DictModal 검색 API(서버사이드, 키워드+결과수 제한)로만 조회한다.
  useEffect(() => {
    const fetchDictionaries = async () => {
      if (!currentWorkId || currentWorkId === 'global') {
        setGlobalDictList([]);
        return;
      }
      try {
        const localRes = await api.get(`/api/dicts?workId=${currentWorkId}`);
        setGlobalDictList(localRes.data);
      } catch (e) {
        console.error("사전 데이터 로드 실패", e);
      }
    };

    fetchDictionaries();
  }, [currentWorkId]);

  // 상용구 동기화 (실시간 핑 수신 대기)
  useEffect(() => {
    const fetchBps = () => api.get('/api/boilerplates').then(res => setGlobalBpList(res.data)).catch(() => {});
    fetchBps();
    window.addEventListener('galpi-bp-sync', fetchBps);
    return () => window.removeEventListener('galpi-bp-sync', fetchBps);
  }, []);

  const bpCore = useBoilerplateCore(showToast);
  useBoilerplateListener({ globalBpList, bpCore, showToast });

  useEffect(() => {
    const handleCopy = () => {
      const text = window.getSelection().toString();
      if (text) addClipboard(text);
    };
    
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'v') {
        e.preventDefault(); e.stopPropagation();
        openModal('clipboard');
      }
      
      // ★ 이전에 작성한 열려있는 팹 모달을 닫는 전역 단축키 (Ctrl + Esc) 유지
      if ((e.ctrlKey || e.metaKey) && e.key === 'Escape') {
        e.preventDefault(); e.stopPropagation();
        closeModal();
      }
      
      // Alt + H 고유명사 한자 실시간 다중 순환 치환 연산 (한자 단독 출력 제거)
      if (e.altKey && e.key.toLowerCase() === 'h' && e.target.tagName.match(/INPUT|TEXTAREA/)) {
        e.preventDefault(); e.stopPropagation();
        const input = e.target;
        const text = input.value;
        const cursor = input.selectionStart;
        const textBefore = text.substring(0, cursor);
        
        // 중복된 원문을 하나로 묶어 긴 단어부터 스캔 방어망 구축
        const uniqueKeys = [...new Set(globalDictList.map(d => d.word))].sort((a, b) => b.length - a.length);
        
        for (let k of uniqueKeys) {
          // 해당 원문에 등록된 모든 치환 데이터(다중 한자)를 긁어옴
          const matchingDicts = globalDictList.filter(d => d.word === k);
          
          // 동적 순환 배열 생성: [ "뇌극", "뇌극(雷極)", "뇌극(雷戟)" ... ]
          const cycleList = [k];
          matchingDicts.forEach(dict => {
            const trans = dict.translation;
            const pureVal = trans.match(/\((.*?)\)/) ? trans.match(/\((.*?)\)/)[1] : trans.replace(k, '').replace(/[\(\)]/g, '');
            cycleList.push(`${k}(${pureVal})`);
          });

          let matchIndex = -1;
          let matchLength = 0;

          // 가장 긴 문자열(원문(한자))부터 매칭하여 짧은 단어가 덮어쓰는 오류 방지
          const sortedCycleList = [...cycleList].map((val, idx) => ({val, idx})).sort((a, b) => b.val.length - a.val.length);

          for (let item of sortedCycleList) {
            if (textBefore.endsWith(item.val)) {
              matchIndex = item.idx;
              matchLength = item.val.length;
              break;
            }
          }

          if (matchIndex !== -1) {
            // 현재 매칭된 인덱스에서 다음 인덱스로 이동, 배열 끝이면 다시 0번(원문 단독)으로 복귀
            const nextIndex = (matchIndex + 1) % cycleList.length;
            const rep = cycleList[nextIndex];

            input.value = text.substring(0, cursor - matchLength) + rep + text.substring(cursor);
            input.selectionStart = input.selectionEnd = cursor - matchLength + rep.length;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            break;
          }
        }
      }
    };
    
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCopy);
    document.addEventListener('keydown', handleKey, true);
    
    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCopy);
      document.removeEventListener('keydown', handleKey, true);
    };
  }, [addClipboard, openModal, closeModal, globalDictList]);

  const btnSty = { width: '48px', height: '48px', borderRadius: '50%', padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', transition: '0.2s', outline: 'none' };

  // ★ 핵심: 메인 모달이나 서브 모달 둘 중 하나라도 켜져 있으면 렌더링을 허용하는 함수
  const isModalOpen = (name) => activeModal === name || subModal === name;

  return (
    <>
      <BoilerplateSuggestPopup 
        popupState={bpCore.bpPopupState} 
        commitBpExpansion={bpCore.commitBpExpansion} 
        updatePopupState={bpCore.updatePopupState} 
      />

      <div className="galpi-fab-wrap" style={{ position: 'fixed', bottom: '40px', right: '40px', zIndex: 9000, display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', gap: '15px' }}>
        <button 
          id="galpi-fab-main"
          onClick={() => setIsOpen(!isOpen)} 
          style={{ width: '60px', height: '60px', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: '0.3s', outline: 'none' }}
        >
          <img src="/img/svg/fab.svg" alt="메뉴" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.2))', transform: isOpen ? 'rotate(90deg) scale(1.05)' : 'none', transition: '0.3s' }} />
        </button>

        <div className="galpi-fab-menu" style={{ display: 'flex', flexDirection: 'column-reverse', gap: '12px', opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none', transform: isOpen ? 'translateY(0)' : 'translateY(20px)', transition: '0.3s' }}>
          <button className="galpi-fab-item" onClick={() => { setIsOpen(false); navigate(`/bulk?workId=${currentWorkId}`); }} style={btnSty} title="일괄 수정"><img src="/img/svg/character.svg" alt="일괄수정" style={{width:'100%', height:'100%', objectFit:'contain'}}/></button>
          <button className="galpi-fab-item" onClick={() => { setIsOpen(false); openModal('memo'); }} style={btnSty} title="가상 메모장"><img src="/img/svg/memo.svg" alt="메모" style={{width:'100%', height:'100%', objectFit:'contain'}}/></button>
          {currentWorkId && currentWorkId !== 'global' && <button className="galpi-fab-item" onClick={() => openModal('search')} style={btnSty} title="현재 작품 캐릭터 검색"><img src="/img/svg/search.svg" alt="검색" style={{width:'100%', height:'100%', objectFit:'contain'}}/></button>}
          <button className="galpi-fab-item" onClick={() => openModal('dict')} style={btnSty} title="고유명사 사전 (Alt+H)"><img src="/img/svg/dictionary.svg" alt="사전" style={{width:'100%', height:'100%', objectFit:'contain'}}/></button>
          <button className="galpi-fab-item" onClick={() => openModal('boilerplate')} style={btnSty} title="스마트 상용구"><img src="/img/svg/boilerplate.svg" alt="상용구" style={{width:'100%', height:'100%', objectFit:'contain'}}/></button>
          <button className="galpi-fab-item" onClick={() => openModal('clipboard')} style={btnSty} title="클립보드 내역 (Ctrl+Shift+V)"><img src="/img/svg/clipboard.svg" alt="클립보드" style={{width:'100%', height:'100%', objectFit:'contain'}}/></button>
          <button className="galpi-fab-item" onClick={() => openModal('recent')} style={btnSty} title="최근 열람 기록"><img src="/img/svg/recents.svg" alt="최근" style={{width:'100%', height:'100%', objectFit:'contain'}}/></button>
          <button className="galpi-fab-item" onClick={() => { setIsOpen(false); window.scrollTo({top:0, behavior:'smooth'}); }} style={{...btnSty, background: 'var(--table-bg-alt)'}} title="최상단 이동"><img src="/img/svg/scrollTop.svg" alt="최상단" style={{width:'100%', height:'100%', objectFit:'contain'}}/></button>
        </div>
      </div>

      {toastMsg && (
        <div style={{ position: 'fixed', bottom: '110px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '12px 24px', borderRadius: '8px', zIndex: 999999, fontWeight: 'bold', fontSize: '14px', animation: 'fadeIn 0.3s ease' }}>
          {toastMsg}
        </div>
      )}

      {/* ★ 변경: activeModal뿐만 아니라 subModal 상태일 때도 렌더링되도록 스마트 허용 로직 적용 */}
      {isModalOpen('clipboard') && <ClipboardModal showToast={showToast} />}
      {isModalOpen('dict') && <DictModal currentWorkId={currentWorkId} showToast={showToast} />}
      {isModalOpen('boilerplate') && <BoilerplateModal showToast={showToast} />}
      {isModalOpen('search') && <SearchModal currentWorkId={currentWorkId} />}
      {isModalOpen('recent') && <RecentModal />}
      {isModalOpen('memo') && <MemoModal />}
    </>
  );
};

export default FabMenu;