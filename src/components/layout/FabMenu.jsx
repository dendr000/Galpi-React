// ==========================================================================
// 파일 위치: src/components/layout/FabMenu.jsx
// 기능 요약: 전역 플로팅 액션 버튼(FAB) 및 사전, 상용구, 클립보드 히스토리, 캐릭터 빠른 검색, 최근 열람 목록 통합 제어 시스템 (v1.2.0)
// 상세 설명: 화면 우측 하단에 고정되어 다양한 편의 도구 모달창을 토글하고, 사용자의 복사 이벤트 감지 및 단축키(Alt+H, Ctrl+Shift+V) 연동 물리 엔진을 총괄하는 컴포넌트입니다.
// ==========================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useModalStore } from '../../store/useModalStore';
import api from '../../api/axiosCore';

// --- 공통 모달 팝업 오버레이 컴포넌트 ---
const ModalOverlay = ({ title, onClose, children, width = '500px', actions }) => {
  useEffect(() => {
    console.log(`[ModalOverlay] "${title}" 모달 레이어가 성공적으로 화면에 마운트 완료되었습니다.`);
    return () => {
      console.log(`[ModalOverlay] "${title}" 모달 레이어가 안전하게 화면에서 언마운트 종료되었습니다.`);
    };
  }, [title]);

  return (
    <div 
      className="modal-overlay" 
      onClick={() => {
        console.log(`[ModalOverlay] "${title}" 배경 영역 바깥 컨텍스트 클릭이 감지되어 모달 닫기를 트리거합니다.`);
        onClose();
      }} 
      style={{ zIndex: 100000, position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}
    >
      <div 
        className="modal-content" 
        onClick={(e) => {
          console.log(`[ModalOverlay] "${title}" 내부 플레이스홀더 영역 클릭 - 컨텍스트 버블링 폭발을 차단합니다.`);
          e.stopPropagation();
        }} 
        style={{ background: 'var(--bg-color)', width: '90%', maxWidth: width, maxHeight: '80vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', border: '1px solid var(--border-color)' }}
      >
        <div style={{ padding: '15px 25px', background: 'var(--table-bg-alt)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '16px' }}>{title}</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {actions}
            <button 
              onClick={() => {
                console.log(`[ModalOverlay] "${title}" 상단 우측 우회 엑스 버튼 세션이 가동되었습니다.`);
                onClose();
              }} 
              style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-secondary)', lineHeight: 1 }}
            >
              &times;
            </button>
          </div>
        </div>
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// --- 메인 플로팅 액션 버튼 및 모달 제어 시스템 코어 ---
const FabMenu = () => {
  console.log("[FabMenu] 글로벌 플로팅 메뉴 라이프사이클 초기 스캔 진행");
  
  const [isOpen, setIsOpen] = useState(false);
  const { activeModal, openModal, closeModal, clipboardHistory, addClipboard, clearClipboard } = useModalStore();
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 작품 컨텍스트 ID 분석 및 파싱
  const currentWorkId = new URLSearchParams(location.search).get('workId') || location.pathname.match(/\/work\/(\d+)/)?.[1] || 'global';

  // 사전(Dictionary) 상태 관리 정의
  const [dictList, setDictList] = useState([]);
  const [dictInput, setDictInput] = useState({ word: '', trans: '' });
  const [dictSearch, setDictSearch] = useState('');
  const [dictBulk, setDictBulk] = useState('');
  const [isDictBulkMode, setIsDictBulkMode] = useState(false);

  // 상용구(Boilerplate) 상태 관리 정의
  const [bpList, setBpList] = useState([]);
  const [bpInput, setBpInput] = useState({ title: '', content: '' });
  const [bpBulk, setBpBulk] = useState('');
  const [isBpBulkMode, setIsBpBulkMode] = useState(false);

  // 인물 빠른 검색망 상태 관리 정의
  const [searchChars, setSearchChars] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 메타 히스토리 저장소 상태 정의
  const [recentWorks, setRecentWorks] = useState([]);
  const [toastMsg, setToastMsg] = useState('');

  // 시스템 실시간 토스트 디스플레이 출력 유틸
  const showToast = (msg) => {
    console.log(`[FabMenu] 전역 실시간 토스트 메시지 렌더링 호출: ${msg}`);
    setToastMsg(msg);
    setTimeout(() => {
      console.log("[FabMenu] 토스트 출력 제한 주기가 만료되어 디스플레이 소각 연산을 집행합니다.");
      setToastMsg('');
    }, 2000);
  };

  // 전역 클립보드 스크랩 인프라 및 단축키 인터랙션 가로채기 파이프라인
  useEffect(() => {
    console.log("[FabMenu] 전역 마우스 이벤트 및 단축키 하드웨어 모니터링 엔진 가동 시작");
    
    const handleCopy = () => {
      const text = window.getSelection().toString();
      if (text) {
        console.log(`[FabMenu - Event] 브라우저 드래그 클립보드 복사 트래킹 적중. 스크랩 파일 캐싱을 집행합니다. 데이터 길이: ${text.length}`);
        addClipboard(text);
      }
    };
    
    const handleKey = (e) => {
      // 1단계: Ctrl + Shift + V 스크랩 히스토리 개방 검증
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'v') {
        console.log('[FabMenu - Event] Ctrl + Shift + V 전역 클립보드 히스토리 모달 개방 단축키가 적중되었습니다.');
        e.preventDefault();
        e.stopPropagation();
        openModal('clipboard');
      }
      
      // 2단계: Alt + H 고유명사 한자 실시간 벡터 순환 치환 연산 가동 검증
      if (e.altKey && e.key.toLowerCase() === 'h' && e.target.tagName.match(/INPUT|TEXTAREA/)) {
        console.log('[FabMenu - Event] Alt + H 지능형 고유명사 사전 역치환 기믹이 에디터 영역 내에서 트리거되었습니다.');
        e.preventDefault();
        e.stopPropagation();
        const input = e.target;
        const text = input.value;
        const cursor = input.selectionStart;
        const textBefore = text.substring(0, cursor);
        const keys = dictList.map(d => d.word).sort((a, b) => b.length - a.length);
        
        console.log(`[FabMenu - Dict] 정렬 완료된 사전 키 데이터셋 기준 정밀 하향식 역추적 스캔 개시. 총 검증 대상 수: ${keys.length}개`);
        for (let k of keys) {
          const trans = dictList.find(d => d.word === k)?.translation || '';
          const pureVal = trans.match(/\((.*?)\)/) ? trans.match(/\((.*?)\)/)[1] : trans.replace(k, '').replace(/[\(\)]/g, '');
          const step1 = k;
          const step2 = `${k}(${pureVal})`;
          const step3 = pureVal;
          let rep = null;
          let mLen = 0;
          
          if (textBefore.endsWith(step1)) {
            rep = step2;
            mLen = step1.length;
            console.log(`[FabMenu - Dict] 지능형 치환망 1단계 적중: [${step1}] ➔ [${step2}]`);
          } else if (textBefore.endsWith(step2)) {
            rep = step3;
            mLen = step2.length;
            console.log(`[FabMenu - Dict] 지능형 치환망 2단계 적중: [${step2}] ➔ [${step3}]`);
          } else if (textBefore.endsWith(step3)) {
            rep = step1;
            mLen = step3.length;
            console.log(`[FabMenu - Dict] 지능형 치환망 3단계 적중: [${step3}] ➔ [${step1}]`);
          }

          if (rep) {
            input.value = text.substring(0, cursor - mLen) + rep + text.substring(cursor);
            input.selectionStart = input.selectionEnd = cursor - mLen + rep.length;
            console.log("[FabMenu - Dict] 물리 가상 input 이벤트 디스패치를 발송하여 리액트 원장 미리보기를 강제 강동합니다.");
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
      console.log("[FabMenu] 전역 하드웨어 모니터링 엔진의 리스너 찌꺼기 청소 가동 (클린업)");
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCopy);
      document.removeEventListener('keydown', handleKey, true);
    };
  }, [addClipboard, openModal, dictList]);

  // 활성화된 모달 변경 감지 및 비동기 데이터 동기화 네트워크 처리
  useEffect(() => {
    console.log(`[FabMenu - Fetch] 상태 변화 모니터링 파이프라인 가동. 액티브 모달 타겟: ${activeModal}`);
    
    if (activeModal === 'dict') {
      console.log(`[FabMenu - Fetch] 고유명사 사전 데이터 통신 스캔 개시. 타겟 작품 일련번호: ${currentWorkId}`);
      api.get(`/api/dicts?workId=${currentWorkId}`)
         .then(res => {
           console.log(`[FabMenu - Fetch] 사전 수신 연산 성공. 확보 개수: ${res.data.length}건`);
           setDictList(res.data);
         });
    }
    
    if (activeModal === 'boilerplate') {
      console.log('[FabMenu - Fetch] 스마트 상용구 압축 원고 목록 패치 트래픽 발송');
      api.get('/api/boilerplates')
         .then(res => {
           console.log(`[FabMenu - Fetch] 상용구 패킷 수신 성공. 확보 개수: ${res.data.length}건`);
           setBpList(res.data);
         });
    }
    
    if (activeModal === 'search') {
      if (currentWorkId !== 'global') {
        console.log(`[FabMenu - Fetch] 빠른 탐색용 등장인물 메타 리스트 동적 패치 개시. 작품 ID: ${currentWorkId}`);
        api.get(`/api/characters?workId=${currentWorkId}`)
           .then(res => {
             console.log(`[FabMenu - Fetch] 인물 목록 수신 성공. 확보 개수: ${res.data.length}건`);
             setSearchChars(res.data);
           });
      } else {
        console.warn('[FabMenu - Filter] 전역 index.html 대문 구조 환경에서는 단일 세계관 인물 스캔이 거부됩니다.');
        alert("특정 작품 스페이스 상세 위키 내부로 진입하여 인물 검색망을 가동하십시오.");
        closeModal();
      }
    }
    
    if (activeModal === 'recent') {
      console.log('[FabMenu - LocalStorage] 최근 열람 브라우저 세션 타임라인 원장 복원 개시');
      const ids = JSON.parse(localStorage.getItem('galpi-recent-works') || '[]');
      if (ids.length > 0) {
        api.get('/api/works').then(res => {
          const list = ids.map(id => res.data.find(w => w.id === id)).filter(Boolean);
          console.log(`[FabMenu - LocalStorage] 타임라인 대조 복원 정렬 완료 성공 건수: ${list.length}`);
          setRecentWorks(list);
        });
      } else {
        console.log('[FabMenu - LocalStorage] 로컬 스토리지 데이터 원장이 부재합니다.');
        setRecentWorks([]);
      }
    }
  }, [activeModal, currentWorkId, closeModal]);

  // 단어 단건 추가 액션 핸들러
  const handleDictAdd = async () => {
    const word = dictInput.word.trim();
    const trans = dictInput.trans.trim();
    console.log(`[FabMenu - Dict] 사전 단건 등록 트랜잭션 개시. 타겟 원래단어: ${word}, 매핑어구: ${trans}`);
    if (!word || !trans) {
      console.warn("[FabMenu - Dict] 필수 인자값 누락으로 인서트 처리를 기각합니다.");
      alert("원문 단어와 치환 한자/영문 데이터를 빠짐없이 채워넣어 주십시오.");
      return;
    }
    try {
      await api.post('/api/dicts', { workId: currentWorkId, word, translation: trans });
      console.log('[FabMenu - Dict] 비동기 데이터베이스 단건 인서트 반영 성공. 로컬 상태 배열 병합 처리 개시.');
      setDictList(prev => [...prev, { workId: currentWorkId, word, translation: trans }]);
      setDictInput({ word: '', trans: '' });
      showToast("✨ 사전 데이터베이스에 안전하게 동기화 저장 완료되었습니다.");
    } catch (e) {
      console.error('[FabMenu - Dict] 단어 단건 인서트 API 네트워크 실패: ', e);
    }
  };

  // 사전 다량 벌크 파싱 등록 핸들러
  const handleDictBulk = async () => {
    console.log('[FabMenu - Dict] 고유명사 괄호 패턴 매크로 일괄 파싱 덤프 트랜잭션 개시');
    if (!dictBulk.trim()) return alert("대량 등록용 텍스트 파일 블록이 공백 상태입니다.");
    const lines = dictBulk.split('\n');
    const payloads = [];
    const newDict = [...dictList];
    
    lines.forEach(line => {
      const match = line.trim().match(/^([^\(\)]+)\(([^\(\)]+)\)$/);
      if (match) {
        let key = match[1].trim();
        let val = match[2].trim();
        if (/[가-힣]/.test(val) && !/[가-힣]/.test(key)) {
          key = match[2].trim();
          val = match[1].trim();
        }
        if (!newDict.some(d => d.word === key)) {
          newDict.push({ workId: currentWorkId, word: key, translation: val });
          payloads.push({ workId: currentWorkId, word: key, translation: val });
        }
      }
    });

    if (payloads.length > 0) {
      console.log(`[FabMenu - Dict] 벌크 정규식 필터링 필터 통과 성공 건수: ${payloads.length}건. 네트워크 벌크 API로 토스합니다.`);
      await api.post('/api/dicts/bulk', payloads);
      setDictList(newDict);
      setDictBulk('');
      setIsDictBulkMode(false);
      showToast(`✨ 총 ${payloads.length}개의 어휘 묶음 처리가 종료되었습니다.`);
    } else {
      console.warn('[FabMenu - Dict] 유효 구조 해시 매칭 실패. 예외를 반환합니다.');
      alert("추출 가능한 유효 문법 구문 패턴이 부재하거나 이미 시스템 원장에 다 등록된 단어들입니다.");
    }
  };

  // 상용구 단건 추가 핸들러
  const handleBpAdd = async () => {
    const title = bpInput.title.trim();
    const content = bpInput.content;
    console.log(`[FabMenu - BP] 스마트 단축 양식 수동 등록 요청 수신. 매크로 키: ${title}`);
    if (!title || !content.trim()) {
      alert("발동 단축어 키워드와 실제 확장될 원고 본문 문장 구조를 입력하세요.");
      return;
    }
    try {
      const res = await api.post('/api/boilerplates', { title, content, category: '공통' });
      console.log('[FabMenu - BP] 서버 세이브 인서트 연산 정상 수신 완료. 로컬 캐시 스토리지 갱신 진행.');
      setBpList(prev => [...prev, res.data]);
      setBpInput({ title: '', content: '' });
      showToast("smart 오토 상용구 서식 등록에 성공했습니다.");
    } catch (e) {
      console.error('[FabMenu - BP] 상용구 추가 API 네트워크 실패: ', e);
    }
  };

  // 상용구 대량 벌크 매크로 파싱 등록 핸들러
  const handleBpBulk = async () => {
    console.log('[FabMenu - BP] 문장형/한자 분기 복합 오토 매크로 일괄 적재 팩토리 구동 시작');
    if (!bpBulk.trim()) return alert("상용구 대량 등록용 파일 본문 텍스트가 비어있습니다.");
    const lines = bpBulk.split('\n');
    let count = 0;
    
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      let title = "";
      let content = "";
      
      if (line.includes('::::')) {
        const p = line.split('::::');
        title = p[0].trim();
        content = p.slice(1).join('::::').trim();
      } else {
        const match = line.match(/^([^\(\)]+)\(([^\(\)]+)\)$/);
        if (match) {
           let k = match[1].trim();
           let v = match[2].trim();
           if (/[가-힣]/.test(v) && !/[가-힣]/.test(k)) {
             k = match[2].trim();
             v = match[1].trim();
           }
           title = k;
           content = `${k}(${v})`;
        }
      }
      
      if (title && content && !bpList.some(b => b.title === title)) {
        await api.post('/api/boilerplates', { title, content, category: '공통' });
        count++;
      }
    }

    if (count > 0) {
      console.log(`[FabMenu - BP] 대량 저장 동기화 완료 루프 정상 탈출. 저장 완료 개수: ${count}`);
      const res = await api.get('/api/boilerplates');
      setBpList(res.data);
      setBpBulk('');
      setIsBpBulkMode(false);
      showToast(`✨ 총 ${count}개의 문장형 상용구 인프라 배포 완료!`);
    } else {
      console.warn('[FabMenu - BP] 유효 줄바꿈 파싱 타겟 행이 감지되지 않았습니다.');
      alert("배포 가능한 가메 가용 라인이 존재하지 않거나 모두 기존 마스터 원장과 중복된 단축어명입니다.");
    }
  };

  const btnSty = { width: '48px', height: '48px', borderRadius: '50%', padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', transition: '0.2s', outline: 'none' };
  const inpSty = { padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', background: 'var(--surface-color)', color: 'var(--text-primary)', outline: 'none' };

  return (
    <>
      {/* 화면 우측 하단 고정 플로팅 액션 컨트롤 기둥 본체 */}
      <div className="galpi-fab-wrap" style={{ position: 'fixed', bottom: '40px', right: '40px', zIndex: 9000, display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', gap: '15px' }}>
        <button 
          id="galpi-fab-main"
          onClick={() => {
            console.log(`[FabMenu - UI] 메인 코어 FAB 버튼 인터랙션 작동. 상태 변환: ${isOpen} ➔ ${!isOpen}`);
            setIsOpen(!isOpen);
          }} 
          style={{ width: '60px', height: '60px', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: '0.3s', outline: 'none' }}
        >
          <img src="/img/svg/fab.svg" alt="메뉴" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.2))', transform: isOpen ? 'rotate(90deg) scale(1.05)' : 'none', transition: '0.3s' }} />
        </button>

        <div className="galpi-fab-menu" style={{ display: 'flex', flexDirection: 'column-reverse', gap: '12px', opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none', transform: isOpen ? 'translateY(0)' : 'translateY(20px)', transition: '0.3s' }}>
          <button className="galpi-fab-item" onClick={() => { console.log('[FabMenu - Action] 캐릭터 통합 스프레드시트 일괄 관리 라우팅 실행'); setIsOpen(false); navigate(`/bulk?workId=${currentWorkId}`); }} style={btnSty} title="일괄 수정"><img src="/img/svg/character.svg" alt="일괄수정" style={{width:'100%', height:'100%', objectFit:'contain'}}/></button>
          <button className="galpi-fab-item" onClick={() => { console.log('[FabMenu - Action] 가상 무한 메모 캔버스 라우팅 실행'); setIsOpen(false); navigate('/memo'); }} style={btnSty} title="메모 캔버스"><img src="/img/svg/memo.svg" alt="메모" style={{width:'100%', height:'100%', objectFit:'contain'}}/></button>
          {currentWorkId && currentWorkId !== 'global' && <button className="galpi-fab-item" onClick={() => { console.log('[FabMenu - Action] 작중 인물 빠른 검색 창고 개방'); openModal('search'); }} style={btnSty} title="현재 작품 캐릭터 검색"><img src="/img/svg/search.svg" alt="검색" style={{width:'100%', height:'100%', objectFit:'contain'}}/></button>}
          <button className="galpi-fab-item" onClick={() => { console.log('[FabMenu - Action] 고유 명사 한자 사전 인덱서 개방'); openModal('dict'); }} style={btnSty} title="고유명사 사전 (Alt+H)"><img src="/img/svg/dictionary.svg" alt="사전" style={{width:'100%', height:'100%', objectFit:'contain'}}/></button>
          <button className="galpi-fab-item" onClick={() => { console.log('[FabMenu - Action] 오토 상용구 서식 보관 창고 개방'); openModal('boilerplate'); }} style={btnSty} title="스마트 상용구"><img src="/img/svg/boilerplate.svg" alt="상용구" style={{width:'100%', height:'100%', objectFit:'contain'}}/></button>
          <button className="galpi-fab-item" onClick={() => { console.log('[FabMenu - Action] 임시 복사 스크랩 클립보드 내역 개방'); openModal('clipboard'); }} style={btnSty} title="클립보드 내역 (Ctrl+Shift+V)"><img src="/img/svg/clipboard.svg" alt="클립보드" style={{width:'100%', height:'100%', objectFit:'contain'}}/></button>
          <button className="galpi-fab-item" onClick={() => { console.log('[FabMenu - Action] 최근 세션 타임라인 로그 기록 개방'); openModal('recent'); }} style={btnSty} title="최근 열람 기록"><img src="/img/svg/recents.svg" alt="최근" style={{width:'100%', height:'100%', objectFit:'contain'}}/></button>
          <button className="galpi-fab-item" onClick={() => { console.log('[FabMenu - Action] 화면 브라우저 절대 상단 탑 스크롤 강제 구동'); setIsOpen(false); window.scrollTo({top:0, behavior:'smooth'}); }} style={{...btnSty, background: 'var(--table-bg-alt)'}} title="최상단 이동"><img src="/img/svg/scrollTop.svg" alt="최상단" style={{width:'100%', height:'100%', objectFit:'contain'}}/></button>
        </div>
      </div>

      {/* ==========================================================================
          [하위 소유 인젝션 모달 UI 구조체 컴포넌트 묶음 연산]
          ========================================================================== */}
      
      {/* 1. 클립보드 내역 모달 */}
      {activeModal === 'clipboard' && (
        <ModalOverlay title="📋 클립보드 히스토리" onClose={closeModal} actions={<button onClick={() => { console.log('[FabMenu - Click] 로컬 스토리지 클립보드 히스토리 데이터 전역 강제 소각'); clearClipboard(); }} style={{ border: '1px solid #e53e3e', color: '#e53e3e', background: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', padding: '4px 8px' }}>전체 삭제</button>}>
          {clipboardHistory.length === 0 ? (
            <div className="modal-empty" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>스크랩하거나 복사한 텍스트 임시 파편 내역이 존재하지 않습니다.</div>
          ) : (
            clipboardHistory.map((text, i) => (
              <div key={i} style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--primary-color)', background: 'var(--table-bg-alt)', padding: '2px 6px', borderRadius: '4px' }}>#{i+1}</span>
                  <button 
                    className="bp-action-btn edit" 
                    style={{ fontSize: '11px', padding: '4px 10px', background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', cursor: 'pointer' }} 
                    onClick={() => { 
                      console.log(`[FabMenu - Click] 특정 임시 블록 #${i+1} 재복사 명령 실행 및 원장 업데이트`);
                      navigator.clipboard.writeText(text); 
                      showToast("📋 클립보드 인프라에 재할당 완료!"); 
                      closeModal(); 
                    }}
                  >
                    다시 복사
                  </button>
                </div>
                <div style={{ fontSize: '13px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{text}</div>
              </div>
            ))
          )}
        </ModalOverlay>
      )}

      {/* 2. 고유명사 한자/영문 사전 모달 */}
      {activeModal === 'dict' && (
        <ModalOverlay title="📖 고유명사 한자/영문 사전" onClose={closeModal} width="550px">
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" placeholder="원문" value={dictInput.word} onChange={e => setDictInput({...dictInput, word: e.target.value})} style={{...inpSty, flex: 1}} autoComplete="off" />
            <input 
              type="text" 
              placeholder="한자/영문" 
              value={dictInput.trans} 
              onChange={e => setDictInput({...dictInput, trans: e.target.value})} 
              onKeyDown={async (e) => {
                if (e.key === 'Enter') {
                  console.log('[FabMenu - KeyDown] 단어 입력 폼 필드 엔터 동작 포착.');
                  e.preventDefault();
                  handleDictAdd();
                }
              }} 
              style={{...inpSty, flex: 1}} 
              autoComplete="off"
            />
            <button className="wiki-btn primary-btn" onClick={handleDictAdd} style={{ padding: '8px 16px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>추가</button>
            <button className="wiki-btn outline-btn gray" onClick={() => setIsDictBulkMode(!isDictBulkMode)} style={{ padding: '8px 12px', background: 'var(--table-bg-alt)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>일괄 ▾</button>
          </div>
          
          {isDictBulkMode && (
             <div style={{ padding: '10px', background: 'rgba(59,91,219,0.05)', border: '1px dashed var(--primary-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
               <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>📝 다량 등록 (원문(한자) 줄바꿈 분할 매크로)</span>
               <textarea value={dictBulk} onChange={e => setDictBulk(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', resize: 'none', height: '80px', fontFamily: 'inherit', outline: 'none', background: 'var(--surface-color)', color: 'var(--text-primary)' }} placeholder="예시:&#13;&#10;초혼(招魂)&#13;&#10;제귀청(除鬼廳)"></textarea>
               <button className="wiki-btn primary-btn" onClick={handleDictBulk} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🚀 벌크 컴파일 덤프 가동</button>
             </div>
          )}
          
          <input type="text" placeholder="🔍 사전에 보존된 등록 데이터 실시간 매칭 검색..." value={dictSearch} onChange={e => setDictSearch(e.target.value)} style={{...inpSty, width: '100%', boxSizing: 'border-box'}} autoComplete="off" spellcheck="false" />
          
          <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', maxHeight: '300px' }}>
            <table className="bulk-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
              <thead style={{ background: 'var(--table-bg-alt)', position: 'sticky', top: 0, zIndex: 2 }}>
                <tr>
                  <th style={{padding:'10px', borderBottom:'1px solid var(--border-color)', color: 'var(--text-primary)'}}>원문 문자열</th>
                  <th style={{padding:'10px', borderBottom:'1px solid var(--border-color)', color: 'var(--text-primary)'}}>치환용 데이터</th>
                  <th style={{padding:'10px', borderBottom:'1px solid var(--border-color)', width:'50px', color: 'var(--text-primary)'}}>파괴</th>
                </tr>
              </thead>
              <tbody>
                {dictList.filter(d => d.word.includes(dictSearch) || d.translation.includes(dictSearch)).map((d, i) => (
                  <tr key={i}>
                    <td style={{padding:'8px', borderBottom:'1px solid var(--border-color)', color: 'var(--text-primary)'}}><b>{d.word}</b></td>
                    <td style={{padding:'8px', borderBottom:'1px solid var(--border-color)', color:'var(--primary-color)', fontWeight:'bold'}}>{d.translation}</td>
                    <td style={{padding:'8px', borderBottom:'1px solid var(--border-color)'}}>
                      <button 
                        onClick={async () => { 
                          if (confirm(`[${d.word}] 고유 어휘를 사전에서 소각하시겠습니까?`)) {
                            console.log(`[FabMenu - Dict] 어휘 제거 영구 파괴 명령 접수: ${d.word}`);
                            await api.delete(`/api/dicts?workId=${currentWorkId}&word=${encodeURIComponent(d.word)}`); 
                            setDictList(prev => prev.filter(x => x.word !== d.word)); 
                            showToast("🗑️ 사전 색인에서 말소 처리되었습니다.");
                          }
                        }} 
                        style={{ border:'none', background:'none', color:'#e53e3e', cursor:'pointer', fontWeight:'bold', fontSize: '14px' }}
                      >
                        ✖
                      </button>
                    </td>
                  </tr>
                ))}
                {dictList.filter(d => d.word.includes(dictSearch) || d.translation.includes(dictSearch)).length === 0 && (
                  <tr><td colSpan="3" style={{ padding: '20px', color: 'var(--text-secondary)' }}>필터링 조건과 일치하는 용어 마스터 사전 내역이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </ModalOverlay>
      )}

      {/* 3. 스마트 상용구 모달 */}
      {activeModal === 'boilerplate' && (
        <ModalOverlay title="⚡ 스마트 상용구 관리 원장" onClose={closeModal} width="600px">
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" placeholder="단축어 명칭 (!검성)" value={bpInput.title} onChange={e => setBpInput({...bpInput, title: e.target.value})} style={{...inpSty, flex: 1}} autoComplete="off" />
            <textarea placeholder="치환 본문 내용 (커서 이동 타겟 매크로 기호: {#})" value={bpInput.content} onChange={e => setBpInput({...bpInput, content: e.target.value})} style={{...inpSty, flex: 2, resize: 'none', height: '36px', fontFamily: 'inherit'}} autoComplete="off" />
            <button className="wiki-btn primary-btn" onClick={handleBpAdd} style={{ padding: '8px 16px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>추가</button>
            <button className="wiki-btn outline-btn gray" onClick={() => setIsBpBulkMode(!isBpBulkMode)} style={{ padding: '8px 12px', background: 'var(--table-bg-alt)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>일괄 ▾</button>
          </div>
          
          {isBpBulkMode && (
             <div style={{ padding: '10px', background: 'rgba(59,91,219,0.05)', border: '1px dashed var(--primary-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
               <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>📝 상용구 벌크 매크로 세션 등록 (단축어::::본문 양식 구분)</span>
               <textarea value={bpBulk} onChange={e => setBpBulk(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', resize: 'none', height: '80px', fontFamily: 'inherit', outline: 'none', background: 'var(--surface-color)', color: 'var(--text-primary)' }} placeholder="예시:&#13;&#10;!주인공::::비뢰검({#})이 울부짖었다.&#13;&#10;야차(夜叉)"></textarea>
               <button className="wiki-btn primary-btn" onClick={handleBpBulk} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🚀 서식 일괄 릴리즈</button>
             </div>
          )}
          
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '300px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {bpList.map(b => (
              <div key={b.id} className="bp-item" style={{ display: 'flex', padding: '12px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '6px', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: '120px', fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</div>
                <div style={{ flex: 1, color: 'var(--text-primary)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingOute: '0 15px' }} title={b.content}>{b.content.replace('{#}', '[커서]')}</div>
                <button 
                  className="bp-action-btn del"
                  onClick={async () => { 
                    if (confirm(`[${b.title}] 상용구 포맷을 원고 서식함에서 완전히 제거합니까?`)) {
                      console.log(`[FabMenu - BP] 상용구 레코드 파괴 접수. 물리 ID: ${b.id}`);
                      await api.delete(`/api/boilerplates/${b.id}`); 
                      setBpList(prev => prev.filter(x => x.id !== b.id)); 
                      showToast("🗑️ 단축 상용구 양식이 정상적으로 제거되었습니다.");
                    }
                  }} 
                  style={{ border: 'none', background: 'none', color: '#e53e3e', cursor: 'pointer', fontStyle: 'normal', fontWeight: 'bold' }}
                >
                  삭제
                </button>
              </div>
            ))}
            {bpList.length === 0 && <div className="modal-empty" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>양식 스토리지 창고에 동기화 저장된 전역 서식이 존재하지 않습니다.</div>}
          </div>
        </ModalOverlay>
      )}

      {/* 4. 캐릭터 검색 모달 */}
      {activeModal === 'search' && (
        <ModalOverlay title="🔍 작중 등장인물 메타 데이터 빠른 검색" onClose={closeModal}>
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="스캔 검색 조준할 작중 인물의 고유 성명을 입력하세요..." style={{ ...inpSty, width: '100%', boxSizing: 'border-box', border: '2px solid var(--primary-color)', padding: '12px' }} autoFocus autoComplete="off" spellcheck="false" />
          <div style={{ flex: 1, overflowY: 'auto', marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px' }}>
            {searchChars.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
              <div 
                key={c.id} 
                className="modal-work-row" 
                style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 18px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }} 
                onClick={() => { 
                  console.log(`[FabMenu - Search] 인물 카드 타겟 트랙 앵커 텔레포트 이동 신호 발송: ${c.name}`);
                  closeModal(); 
                  if (window.scrollToCharacter) {
                    window.scrollToCharacter(c.name);
                  } else {
                    console.error('[FabMenu - Search] 전역 윈도우 스페이스 내 scrollToCharacter 프로토콜 통로 유실.');
                    alert(`현재 화면에서 [${c.name}] 위치로 물리적 스크롤 워프 처리를 대행할 수 없습니다. 위키 본문이 마운트된 구역인지 확인하세요.`);
                  }
                }}
              >
                <span style={{ fontWeight: 900, color: 'var(--text-primary)' }}>{c.name}</span>
                <span style={{ color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '13px' }}>포커스 이동 ➔</span>
              </div>
            ))}
            {searchChars.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
              <div className="modal-empty" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>필터 검색 조건과 부합하는 작중 설정 카드가 부재합니다.</div>
            )}
          </div>
        </ModalOverlay>
      )}

      {/* 5. 최근 열람 기록 모달 */}
      {activeModal === 'recent' && (
        <ModalOverlay title="🕒 최근 액세스 세계관 인덱스 세션 타임라인" onClose={closeModal}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentWorks.length === 0 ? (
              <div className="modal-empty" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>최근 추적된 클라이언트 세계관 브라우징 이력이 부재합니다.</div>
            ) : (
              recentWorks.map(w => (
                <div key={w.id} className="modal-work-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }} onClick={() => { console.log(`[FabMenu - Recent] 최근 이동 노선 활성화 연산 실행: ${w.title}`); closeModal(); navigate(`/work/${w.id}`); }}>
                  <div>
                    <h4 className="modal-work-title" style={{ margin: '0 0 4px 0', fontSize: '15px' }}>{w.title}</h4>
                    <div className="modal-work-creator" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>✍️ 마스터 창작 프로듀서: {w.creator || '미상'}</div>
                  </div>
                  <span style={{ color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '18px' }}>➔</span>
                </div>
              ))
            )}
          </div>
        </ModalOverlay>
      )}
    </>
  );
};

export default FabMenu;