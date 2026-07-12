import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axiosCore';
import ModalOverlay from './ModalOverlay';
import { useModalStore } from '../../../store/useModalStore';

const RecentModal = () => {
  const { closeModal } = useModalStore();
  const navigate = useNavigate();
  const [recentWorks, setRecentWorks] = useState([]);

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem('galpi-recent-works') || '[]');
    if (ids.length > 0) {
      api.get('/api/works').then(res => {
        const list = ids.map(id => res.data.find(w => String(w.id) === String(id))).filter(Boolean);
        setRecentWorks(list);
      });
    }
  }, []);

  return (
    <ModalOverlay title="🕒 최근 액세스 세계관 타임라인" onClose={closeModal}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {recentWorks.length === 0 ? (
          <div className="modal-empty" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>최근 추적된 브라우징 이력이 부재합니다.</div>
        ) : (
          recentWorks.map(w => (
            <div key={w.id} className="modal-work-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }} onClick={() => { closeModal(); navigate(`/work/${w.id}`); }}>
              <div>
                <h4 className="modal-work-title" style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--text-primary)' }}>{w.title}</h4>
                <div className="modal-work-creator" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>✍️ 마스터 창작 프로듀서: {w.creator || '미상'}</div>
              </div>
              <span style={{ color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '18px' }}>➔</span>
            </div>
          ))
        )}
      </div>
    </ModalOverlay>
  );
};

export default RecentModal;