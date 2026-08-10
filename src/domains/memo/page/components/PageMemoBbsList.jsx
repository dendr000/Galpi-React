import React from 'react';
import styles from '../PageMemo.module.css';
import { LockIcon, PinIcon, EditIcon, TrashIcon } from '../../shared/components/MemoIcons';
import { formatRelativeTime } from '../../../../utils/dateUtils'; // ★ 상대 시간 유틸 임포트

const PageMemoBbsList = ({
  folders,
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
  setSelectedTag,
  checkedMemoIds,
  setCheckedMemoIds,
  handleTogglePin,
  handleDeleteMemo,
  handleBatchMove,
  handleBatchDelete
}) => {

  const isAllChecked = paginatedMemos.length > 0 && paginatedMemos.every(m => checkedMemoIds.includes(m.id));

  const handleCheckAll = (e) => {
    if (e.target.checked) setCheckedMemoIds(paginatedMemos.map(m => m.id));
    else setCheckedMemoIds([]);
  };

  const handleCheckSingle = (e, id) => {
    e.stopPropagation();
    if (e.target.checked) setCheckedMemoIds(prev => [...prev, id]);
    else setCheckedMemoIds(prev => prev.filter(memoId => memoId !== id));
  };

  const executeBatchMove = (e) => {
    const targetFolder = e.target.value;
    if (targetFolder) {
      handleBatchMove(checkedMemoIds, targetFolder);
      setCheckedMemoIds([]);
      e.target.value = "";
    }
  };

  const executeBatchDelete = () => {
    handleBatchDelete(checkedMemoIds);
    setCheckedMemoIds([]);
  };

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

      {checkedMemoIds.length > 0 && (
        <div className={styles.batchToolbar}>
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
            {checkedMemoIds.length}개 선택됨
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select className={styles.bbsSelect} onChange={executeBatchMove} style={{ borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}>
              <option value="">📂 폴더 이동...</option>
              {folders.filter(f => f !== '전체 메모').map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <button className="wiki-btn" onClick={executeBatchDelete} style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' }}>
              🗑️ 일괄 삭제
            </button>
          </div>
        </div>
      )}

      <div className={styles.bbsWrap}>
        <div className={styles.bbsHeader}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <input type="checkbox" checked={isAllChecked} onChange={handleCheckAll} style={{ cursor: 'pointer' }} />
          </div>
          <div className={styles.bbsColTitle}>제목</div>
          <div className={styles.bbsColFolder}>폴더</div>
          <div className={styles.bbsColDate}>작성일</div>
        </div>

        {filteredMemos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>조회된 메모가 없습니다.</div>
        ) : (
          paginatedMemos.map(m => (
            <div key={m.id} className={styles.bbsRow} onClick={() => handleOpenTab(m, 'main')} style={{ borderLeft: `4px solid ${m.themeColor || 'transparent'}`, opacity: m.isTrash ? 0.6 : 1, background: checkedMemoIds.includes(m.id) ? 'rgba(59, 91, 219, 0.05)' : '' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
                <input type="checkbox" checked={checkedMemoIds.includes(m.id)} onChange={(e) => handleCheckSingle(e, m.id)} style={{ cursor: 'pointer' }} />
              </div>

              <div className={styles.bbsColTitle}>
                {m.isPinned && <span className={styles.bbsPinBadge}><PinIcon size={14}/></span>}
                {m.isLocked && <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', marginRight: '6px' }}><LockIcon size={12}/></span>}
                <span className={styles.bbsItemTitle}>{m.title || '제목 없음'}</span>
                
                {m.tags && (
                  <span className={styles.bbsInlineTags}>
                    {m.tags.split(',').slice(0, 2).map((t, i) => (
                      <span key={i} className={styles.bbsTagPill} onClick={(e) => { e.stopPropagation(); setSelectedTag(t.trim()); }}>#{t.trim()}</span>
                    ))}
                  </span>
                )}
              </div>
              
              <div className={styles.bbsColFolder}>{m.folder}</div>
              
              {/* ★ 상대 시간 렌더링 적용 */}
              <div className={styles.bbsColDate} title={new Date(m.updatedAt).toLocaleString('ko-KR')}>
                {formatRelativeTime(m.updatedAt)}
              </div>

              <div className={styles.bbsRowActions} onClick={(e) => e.stopPropagation()}>
                <button className={styles.bbsActionBtn} onClick={(e) => handleTogglePin(e, m)} title={m.isPinned ? "상단 고정 해제" : "상단 고정"}>
                  <PinIcon size={14} />
                </button>
                <button className={styles.bbsActionBtn} onClick={() => handleOpenTab(m, 'main')} title="새 탭으로 열기">
                  <EditIcon />
                </button>
                <button className={`${styles.bbsActionBtn} ${styles.delete}`} onClick={(e) => handleDeleteMemo(e, m.id)} title="영구 삭제">
                  <TrashIcon />
                </button>
              </div>

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