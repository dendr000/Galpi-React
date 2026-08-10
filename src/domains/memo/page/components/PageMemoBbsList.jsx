import React from 'react';
import styles from '../PageMemo.module.css';
import { LockIcon } from '../../shared/components/MemoIcons';

const PageMemoBbsList = ({
  filteredMemos,
  paginatedMemos,
  sortType,
  setSortType,
  itemsPerPage,
  setItemsPerPage,
  currentPage,
  setCurrentPage,
  totalPages,
  handleOpenTab,
  setSelectedTag
}) => {
  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', width: '100%', overflowY: 'auto' }} className="galpi-sidebar-scroll">
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
          총 {filteredMemos.length}건
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select className={styles.bbsSelect} value={sortType} onChange={e => setSortType(e.target.value)}>
            <option value="name">가나다순</option>
            <option value="date">최신 등록순</option>
          </select>
          <select className={styles.bbsSelect} value={itemsPerPage} onChange={e => setItemsPerPage(Number(e.target.value))}>
            <option value={20}>20개씩 보기</option>
            <option value={50}>50개씩 보기</option>
            <option value={100}>100개씩 보기</option>
          </select>
        </div>
      </div>

      <div className={styles.bbsWrap}>
        <div className={styles.bbsHeader}>
          <div className={styles.bbsColTitle}>제목</div>
          <div className={styles.bbsColFolder}>폴더</div>
          <div className={styles.bbsColDate}>작성일</div>
        </div>

        {filteredMemos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>조회된 메모가 없습니다.</div>
        ) : (
          paginatedMemos.map(m => (
            <div key={m.id} className={styles.bbsRow} onClick={() => handleOpenTab(m, 'main')}>
              <div className={styles.bbsColTitle}>
                {m.isLocked && <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', marginRight: '6px', verticalAlign: 'middle' }}><LockIcon size={12}/></span>}
                <span className={styles.bbsItemTitle}>{m.title || '제목 없음'}</span>
                {m.tags && (
                  <span className={styles.bbsInlineTags}>
                    {m.tags.split(',').slice(0, 2).map((t, i) => (
                      <span key={i} className={styles.bbsTagPill}>#{t.trim()}</span>
                    ))}
                  </span>
                )}
              </div>
              <div className={styles.bbsColFolder}>{m.folder}</div>
              <div className={styles.bbsColDate}>{new Date(m.updatedAt).toLocaleDateString('ko-KR')}</div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.paginationWrap}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button 
              key={page} 
              className={`${styles.pageBtn} ${currentPage === page ? styles.activePage : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PageMemoBbsList;