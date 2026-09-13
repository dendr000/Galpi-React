// 파일 위치: src/domains/fabTools/RecentModal.jsx
// 기능 요약: 최근 열람한 작품 목록. localStorage의 galpi-recent-works를 읽기만 하고 아무도
// 쓰질 않아서 예전엔 항상 빈 목록이었다 — 실제 기록은 WorkDetailPage.jsx가 작품 진입 시마다
// 남긴다. 개별 작품을 이 목록에 표시할지는 Shift+우클릭으로 켜고 끌 수 있는데, 그 처리는
// 이 컴포넌트가 아니라 GlobalContextMenu.jsx가 한다 — Shift+우클릭은 이미 전역 단축 메뉴가
// document capture 단계에서 선점하고 있어서, 여기서 따로 리스너를 달아도 절대 못 받는다.
// 대신 각 행에 data-galpi-recent-id를 심어두면 GlobalContextMenu가 그걸 읽어 메뉴 항목을
// 얹고, 토글이 끝나면 galpi-recent-excluded-changed 이벤트를 쏴서 여기서 목록만 새로고침한다.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosCore';
import ModalOverlay from '../../components/common/ModalOverlay';
import { useModalStore } from '../../store/useModalStore';
import { IconClock, IconPen, IconArrowRight, IconEyeOff } from '../../components/common/icons/DomainIcons';

const EXCLUDED_KEY = 'galpi-recent-excluded';

const readExcluded = () => {
  try { return JSON.parse(localStorage.getItem(EXCLUDED_KEY) || '[]'); } catch (e) { return []; }
};

const RecentModal = () => {
  const { closeModal } = useModalStore();
  const navigate = useNavigate();
  const [shownWorks, setShownWorks] = useState([]);
  const [hiddenWorks, setHiddenWorks] = useState([]);
  const [showHiddenSection, setShowHiddenSection] = useState(false);

  useEffect(() => {
    const loadList = () => {
      const ids = JSON.parse(localStorage.getItem('galpi-recent-works') || '[]');
      if (ids.length === 0) { setShownWorks([]); setHiddenWorks([]); return; }
      api.get('/api/works').then(res => {
        const excluded = readExcluded();
        const list = ids.map(id => res.data.find(w => String(w.id) === String(id))).filter(Boolean);
        setShownWorks(list.filter(w => !excluded.includes(String(w.id))));
        setHiddenWorks(list.filter(w => excluded.includes(String(w.id))));
      });
    };
    loadList();
    window.addEventListener('galpi-recent-excluded-changed', loadList);
    return () => window.removeEventListener('galpi-recent-excluded-changed', loadList);
  }, []);

  const goToWork = (id) => { closeModal(); navigate(`/work/${id}`); };

  const renderRow = (w, idx, dimmed) => (
    <div
      key={w.id}
      className="galpi-recent-row"
      data-galpi-recent-id={w.id}
      data-galpi-recent-title={w.title}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 18px', background: 'var(--surface-color)', border: '1px solid var(--border-color)',
        borderRadius: '8px', cursor: 'pointer', opacity: dimmed ? 0.55 : 1,
        animation: 'galpiRecentIn .35s ease both', animationDelay: `${Math.min(idx, 12) * 0.035}s`,
      }}
      onClick={() => goToWork(w.id)}
      title="Shift+우클릭: 목록 표시 여부 전환"
    >
      <div>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--text-primary)' }}>{w.title}</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <IconPen size={11} /> {w.creator || '미상'}
        </div>
      </div>
      <IconArrowRight size={18} color="var(--primary-color)" />
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes galpiRecentIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .galpi-recent-row { transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease; }
        .galpi-recent-row:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.1); border-color: var(--primary-color) !important; }
        .galpi-hidden-list { overflow: hidden; transition: max-height .25s ease; }
      `}</style>

      <ModalOverlay
        title={<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IconClock size={16} /> 최근 열람한 작품</span>}
        onClose={closeModal}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {shownWorks.length === 0 && hiddenWorks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>아직 열람한 작품이 없습니다.</div>
          )}
          {shownWorks.length === 0 && hiddenWorks.length > 0 && (
            <div style={{ textAlign: 'center', padding: '10px', color: 'var(--text-secondary)', fontSize: '13px' }}>표시하도록 설정된 최근 작품이 없습니다.</div>
          )}
          {shownWorks.map((w, i) => renderRow(w, i, false))}

          {hiddenWorks.length > 0 && (
            <div style={{ marginTop: '4px' }}>
              <button
                onClick={() => setShowHiddenSection(v => !v)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 0' }}
              >
                <IconEyeOff size={13} /> 숨긴 작품 {hiddenWorks.length}개 {showHiddenSection ? '접기' : '보기'}
              </button>
              <div className="galpi-hidden-list" style={{ maxHeight: showHiddenSection ? '600px' : '0px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
                  {hiddenWorks.map((w, i) => renderRow(w, i, true))}
                </div>
              </div>
            </div>
          )}

          {(shownWorks.length > 0 || hiddenWorks.length > 0) && (
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2px' }}>
              항목에서 Shift+우클릭하면 이 목록에 표시할지 정할 수 있어요.
            </div>
          )}
        </div>
      </ModalOverlay>
    </>
  );
};

export default RecentModal;
