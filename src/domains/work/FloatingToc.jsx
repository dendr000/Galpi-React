import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../pages/WorkDetail/WorkDetail.module.css';

const FloatingToc = ({ workId, pageId, activePage, tocList }) => {
  const navigate = useNavigate();

  // ★ 편집 버튼 라우팅 로직 정밀화
  const handleEditClick = () => {
    if (activePage) {
      // 하위 위키 문서 편집 모드
      navigate(`/edit?type=page&action=edit&workId=${workId}&id=${pageId}`);
    } else {
      // 작품 메인 설정 편집 모드 (id 파라미터가 작품 ID여야 함)
      navigate(`/edit?type=work&action=edit&id=${workId}`);
    }
  };

  return (
    <div className={styles.floatingToc}>
      <div className={styles.tocHandle} title="목차 열기">
        <div className={styles.dash}></div><div className={styles.dash}></div><div className={styles.dash}></div>
      </div>
      <div className={styles.tocContent}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>
          <span style={{ fontWeight: 900, color: 'var(--primary-color)' }}>📑 목차</span>
          <button 
            type="button" 
            className="wiki-btn" 
            style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 900, background: 'var(--table-bg-alt)', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', borderRadius: '4px', cursor: 'pointer' }} 
            onClick={handleEditClick}
          >
            ✏️ 편집
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
          <ul className={styles.tocList}>
            {tocList.map(t => (
              <li key={t.id} style={{ marginBottom: '4px', paddingLeft: `${(t.level - 1) * 12}px` }}>
                <span className={styles.tocLink} style={{ fontSize: t.level === 1 ? '13px' : '12px', fontWeight: t.level === 1 ? '900' : 'bold' }} onClick={(e) => {
                  e.preventDefault();
                  const targetEl = document.getElementById(t.targetId);
                  if(targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    console.error("DOM 타겟을 찾을 수 없습니다: " + t.targetId);
                  }
                }}>
                  {t.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FloatingToc;