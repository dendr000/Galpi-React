// 파일 위치: src/domains/work/SubPageList.jsx
// 기능 요약: 작품 상세 또는 상위 문서 뷰에서 해당 계층에 속하는 하위 위키 문서들의 그리드 목록을 렌더링하고 새 문서 추가로 라우팅하는 컴포넌트
// 버전: v1.0.0

import React from 'react';

const SubPageList = ({ wikiPages, pageId, workId, navigate, styles }) => {
  console.log("[SubPageList] 하위 문서 목록 렌더링 가동. 현재 부모 pageId:", pageId);
  
  const childPages = wikiPages.filter(p => pageId ? String(p.parentId) === String(pageId) : !p.parentId);

  const handleNewDocClick = () => {
    const targetUrl = `/edit?type=page&action=new&workId=${workId}${pageId ? `&parentId=${pageId}` : ''}`;
    console.log(`[SubPageList] 새 문서 추가 라우팅 집행: ${targetUrl}`);
    navigate(targetUrl);
  };

  const handlePageClick = (id) => {
    console.log(`[SubPageList] 하위 문서 클릭 라우팅 집행. 대상 ID: ${id}`);
    navigate(`/work/${workId}?pageId=${id}`);
  };

  return (
    <section id="sec-wiki-pages" className={styles.wikiSection}>
      <div className={styles.sectionHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 id="sec-subpages" className={`${styles.sectionHeaderTitle} auto-toc-target`}>🗂️ 하위 문서 목록</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{childPages.length}개</span>
        </div>
        <button className="wiki-btn" style={{ background: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', padding: '4px 10px', fontSize: '13px' }} onClick={handleNewDocClick}>
          + 새 문서 추가
        </button>
      </div>
      <div className={styles.wikiPageGrid}>
        {childPages.length > 0 ? childPages.map(page => (
          <div key={page.id} className={styles.wikiPageCard} onClick={() => handlePageClick(page.id)}>
            <div className={styles.wikiPageTitle}>📄 {page.title}</div>
            <div className={styles.wikiPageDesc}>
              {page.content ? page.content.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...' : '내용이 없습니다.'}
            </div>
          </div>
        )) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary)', padding: '30px', background: 'var(--table-bg-alt)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
            하위 문서가 없습니다. 우측의 '새 문서 추가' 버튼을 눌러보세요!
          </div>
        )}
      </div>
    </section>
  );
};

export default SubPageList;