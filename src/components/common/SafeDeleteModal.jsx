// 파일 위치: src/components/common/SafeDeleteModal.jsx
// 기능 요약: 글로벌 Promise 기반의 안전 삭제 모달. 복사/붙여넣기 차단 및 1문자 당 2~3개의 동적 마스킹(까만 점)을 적용하여 보안을 극대화합니다.
// 버전: v1.0.0

import React, { useState, useEffect } from 'react';

export const SafeDeleteModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [inputTokens, setInputTokens] = useState([]);
  const [resolver, setResolver] = useState(null);

  useEffect(() => {
    // 전역 window 객체에 모달 오픈 함수를 마운트하여 어디서든 await로 호출 가능하게 세팅
    window.openSafeDeleteModal = (msg) => {
      setMessage(msg);
      setInputTokens([]);
      setIsOpen(true);
      return new Promise((resolve) => {
        setResolver(() => resolve);
      });
    };
  }, []);

  const closeAndResolve = (result) => {
    setIsOpen(false);
    if (resolver) resolver(result);
  };

  const handleConfirm = () => {
    const finalString = inputTokens.map(t => t.char).join('');
    closeAndResolve(finalString);
  };

  const handleCancel = () => {
    closeAndResolve(null);
  };

  // ★ 1글자 -> 2~3개 까만 점 동적 매핑 엔진
  const handleChange = (e) => {
    const newVal = e.target.value;
    const currentDisplay = inputTokens.map(t => t.display).join('');

    // 붙여넣기 등 비정상적인 다중 입력이 감지되면 이벤트 무시
    if (Math.abs(newVal.length - currentDisplay.length) > 3) return;

    if (newVal.length < currentDisplay.length) {
      // 글자 지우기 (백스페이스 감지 시 마지막 토큰 삭제)
      setInputTokens(prev => prev.length > 0 ? prev.slice(0, -1) : []);
    } else if (newVal.length > currentDisplay.length) {
      // 글자 추가 (네이티브 이벤트에서 방금 친 순수 1글자 추출)
      const char = e.nativeEvent.data;
      if (char) {
        const dotsCount = Math.floor(Math.random() * 2) + 2; // 2 또는 3
        const dots = '●'.repeat(dotsCount);
        setInputTokens(prev => [...prev, { char, display: dots }]);
      }
    }
  };

  // 마우스로 중간 글자를 클릭하여 수정하는 꼼수를 막기 위해 커서를 무조건 맨 끝으로 강제 이동
  const forceCursorToEnd = (e) => {
    const len = e.target.value.length;
    e.target.setSelectionRange(len, len);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') handleCancel();
  };

  if (!isOpen) return null;

  const displayValue = inputTokens.map(t => t.display).join('');

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999, backdropFilter: 'blur(2px)' }} onClick={handleCancel}>
      <div style={{ background: 'var(--bg-color)', padding: '24px', borderRadius: '12px', width: '380px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e53e3e', fontWeight: '900', fontSize: '16px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          보안 삭제 경고
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
          {message}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>삭제 키워드를 직접 입력하세요 (복사/붙여넣기 불가)</label>
          <input
            type="text"
            autoFocus
            autoComplete="off"
            spellCheck="false"
            value={displayValue}
            onChange={handleChange}
            onClick={forceCursorToEnd}
            onSelect={forceCursorToEnd}
            onKeyDown={handleKeyDown}
            onPaste={e => e.preventDefault()}
            onCopy={e => e.preventDefault()}
            onCut={e => e.preventDefault()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => e.preventDefault()}
            style={{ padding: '10px 12px', fontSize: '14px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)', outline: 'none', letterSpacing: '2px', fontFamily: 'monospace' }}
            placeholder="입력 시 동적 마스킹 처리됩니다..."
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
          <button className="wiki-btn outline-btn gray" onClick={handleCancel} style={{ padding: '8px 16px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>취소</button>
          <button className="wiki-btn" onClick={handleConfirm} style={{ padding: '8px 16px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            강제 삭제
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafeDeleteModal;