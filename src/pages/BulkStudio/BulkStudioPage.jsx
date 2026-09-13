// 파일 위치: src/pages/BulkStudio/BulkStudioPage.jsx
// 기능 요약: 분리된 훅과 컴포넌트들을 종합하여 메인 레이아웃을 형성하는 허브 컨테이너

import React from 'react';
import styles from './BulkStudio.module.css';
import { useBulkStudioData } from './useBulkStudioData';
import BulkSidebar from './BulkSidebar';
import BulkToolbar from './BulkToolbar';
import BulkTable from './BulkTable';
import { BulkModals } from './BulkModals';
import { IconSave } from '../../components/common/icons/DomainIcons';

const BulkStudioPage = () => {
  const data = useBulkStudioData();

  const activeRow = data.activeRowIdx !== null ? data.rows[data.activeRowIdx] : null;
  const currentWork = data.works.find(w => String(w.id) === String(data.selectedWorkId));

  return (
    <div className={styles.layout}>
      {/* 1. 사이드바: 실시간 마크다운 프리뷰어 */}
      <BulkSidebar 
        isPreviewOpen={data.isPreviewOpen} 
        activeRow={activeRow} 
        columns={data.columns} 
        labels={data.labels} 
        workTitle={currentWork?.title} 
        workMeta={data.workMeta} 
      />

      <main className={styles.main}>
        {/* 2. 상단 툴바: 작품 선택, 데이터 제어 패널 */}
        <BulkToolbar {...data} />

        {/* 3. 엑셀 워크스페이스 그리드 */}
        <div className={styles.tableWrap}>
          <BulkTable {...data} setActiveRowIdx={data.setActiveRowIdx} setBodyModal={data.setBodyModal} />
        </div>

        {/* 4. 하단 마스터 세이브 패널 */}
        <div className={styles.footer}>
          <button className="wiki-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#10b981', padding: '15px', fontSize: '16px', fontWeight: 'bold' }} onClick={data.handleSaveAll}>
            <IconSave size={18} /> 전체 데이터베이스에 일괄 저장 및 작품으로 돌아가기
          </button>
        </div>
      </main>

      {/* 5. 편집 및 유틸리티 레이어 모달 */}
      <BulkModals {...data} />
    </div>
  );
};

export default BulkStudioPage;