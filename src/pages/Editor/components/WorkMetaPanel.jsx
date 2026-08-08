// 절대 경로: src/pages/Editor/components/WorkMetaPanel.jsx
// 기능 요약: 작품 문서(work) 작성 시 필요한 상세 속성(제작자, 장르, 연재 상태, 이미지 변환 등)을 설정하는 UI 컴포넌트 v1.0.0

import React from 'react';
import styles from '../EditorPage.module.css';
import { IconGear, IconShirt, IconX } from './EditorIcons';

const WorkMetaPanel = ({ workMeta, setWorkMeta }) => {
  console.log("[WorkMetaPanel] 컴포넌트 렌더링 됨");

  // 기능: 새로운 이미지 변환(바리에이션) 입력 칸을 추가합니다.
  const handleAddVariant = () => {
    console.log("[WorkMetaPanel] 복장/변신 칸 추가 호출됨");
    setWorkMeta(prev => ({ ...prev, imgVariants: [...prev.imgVariants, ''] }));
  };

  // 기능: 특정 인덱스의 이미지 변환 텍스트를 수정합니다.
  const handleVariantChange = (index, value) => {
    console.log(`[WorkMetaPanel] 바리에이션 수정 - 인덱스: ${index}, 값: ${value}`);
    const newVariants = [...workMeta.imgVariants];
    newVariants[index] = value;
    setWorkMeta(prev => ({ ...prev, imgVariants: newVariants }));
  };

  // 기능: 특정 인덱스의 이미지 변환 칸을 삭제합니다. 모든 칸이 지워지면 빈 칸 하나를 남깁니다.
  const handleRemoveVariant = (index) => {
    console.log(`[WorkMetaPanel] 바리에이션 삭제 - 인덱스: ${index}`);
    const newVariants = [...workMeta.imgVariants];
    newVariants.splice(index, 1);
    setWorkMeta(prev => ({ ...prev, imgVariants: newVariants.length > 0 ? newVariants : [''] }));
  };

  return (
    <details className={styles.metaDetails} open>
      <summary style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <IconGear /> 상세 속성 설정 (클릭하여 펴기/접기)
      </summary>
      <div className={styles.metaGrid}>
        {/* 제작자 명의 입력 영역 */}
        <div className={styles.propRow}>
          <label>제작자 명의</label>
          <input 
            value={workMeta.creator} 
            onChange={e => {
              console.log(`[WorkMetaPanel] 제작자 명의 변경: ${e.target.value}`);
              setWorkMeta({...workMeta, creator: e.target.value});
            }} 
            placeholder="미상" 
          />
        </div>
        
        {/* 장르 태그 입력 영역 */}
        <div className={styles.propRow}>
          <label>장르 태그</label>
          <input 
            value={workMeta.genre} 
            onChange={e => {
              console.log(`[WorkMetaPanel] 장르 태그 변경: ${e.target.value}`);
              setWorkMeta({...workMeta, genre: e.target.value});
            }} 
            placeholder="판타지, 로맨스 등 (쉼표 구분)" 
          />
        </div>
        
        {/* 검색 약칭 입력 영역 */}
        <div className={styles.propRow}>
          <label>검색 약칭</label>
          <input 
            value={workMeta.alias} 
            onChange={e => {
              console.log(`[WorkMetaPanel] 검색 약칭 변경: ${e.target.value}`);
              setWorkMeta({...workMeta, alias: e.target.value});
            }} 
            placeholder="대문 검색용 별명" 
          />
        </div>
        
        {/* 연재 상태 선택 영역 */}
        <div className={styles.propRow}>
          <label>연재 상태</label>
          <select 
            value={workMeta.status} 
            onChange={e => {
              console.log(`[WorkMetaPanel] 연재 상태 변경: ${e.target.value}`);
              setWorkMeta({...workMeta, status: e.target.value});
            }}
          >
            <option value="진행 전">진행 전</option>
            <option value="진행 중">진행 중</option>
            <option value="완료">완료</option>
          </select>
        </div>
        
        {/* 대문 확장자 선택 영역 */}
        <div className={styles.propRow}>
          <label>대문 확장자</label>
          <select 
            value={workMeta.coverExt} 
            onChange={e => {
              console.log(`[WorkMetaPanel] 대문 확장자 변경: ${e.target.value}`);
              setWorkMeta({...workMeta, coverExt: e.target.value});
            }}
          >
            <option value="">없음</option>
            <option value="png">png</option>
            <option value="jpg">jpg</option>
            <option value="webp">webp</option>
            <option value="gif">gif</option>
          </select>
        </div>
        
        {/* 캐릭터 확장자 선택 영역 */}
        <div className={styles.propRow}>
          <label>캐릭터 확장자</label>
          <select 
            value={workMeta.charExt} 
            onChange={e => {
              console.log(`[WorkMetaPanel] 캐릭터 확장자 변경: ${e.target.value}`);
              setWorkMeta({...workMeta, charExt: e.target.value});
            }}
          >
            <option value="png">png</option>
            <option value="jpg">jpg</option>
            <option value="webp">webp</option>
            <option value="gif">gif</option>
          </select>
        </div>
        
        {/* 그룹 정렬 순서 입력 영역 */}
        <div className={styles.propRow} style={{ gridColumn: '1 / -1', alignItems: 'flex-start' }}>
          <label>그룹 정렬 순서<br/><span style={{fontSize:'10px', color:'var(--primary-color)'}}>속성명: 값1, 값2...</span></label>
          <textarea 
            rows="3" 
            value={workMeta.groupOrderStr} 
            onChange={e => {
              console.log("[WorkMetaPanel] 그룹 정렬 순서 변경됨");
              setWorkMeta({...workMeta, groupOrderStr: e.target.value});
            }} 
            placeholder="등급: S급, A급, B급..." 
          />
        </div>

        {/* 이미지 변환(바리에이션) 동적 리스트 영역 */}
        <div className={styles.propRow} style={{ gridColumn: '1 / -1', alignItems: 'flex-start', paddingTop: '15px', borderTop: '1px dashed var(--border-color)' }}>
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <IconShirt /> 이미지 변환
            </span>
            <span style={{fontSize:'10px', color:'var(--primary-color)'}}>(Shift+좌클릭용)</span>
          </label>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {workMeta.imgVariants.map((variant, vIdx) => (
              <div key={vIdx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  placeholder="바리에이션 명칭 (예: 사복, 전투복)" 
                  value={variant} 
                  onChange={e => handleVariantChange(vIdx, e.target.value)} 
                />
                <button 
                  type="button" 
                  style={{ border: 'none', background: 'transparent', color: '#e53e3e', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }} 
                  onClick={() => handleRemoveVariant(vIdx)}
                >
                  <IconX />
                </button>
              </div>
            ))}
            <button 
              type="button" 
              className="wiki-btn" 
              style={{ alignSelf: 'flex-start', padding: '4px 10px', fontSize: '12px', borderColor: 'var(--primary-color)', color: 'var(--primary-color)', background: 'transparent' }} 
              onClick={handleAddVariant}
            >
              + 복장/변신 칸 추가
            </button>
          </div>
        </div>
      </div>
    </details>
  );
};

export default WorkMetaPanel;