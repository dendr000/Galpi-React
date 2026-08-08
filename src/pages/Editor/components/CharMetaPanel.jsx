// 절대 경로: src/pages/Editor/components/CharMetaPanel.jsx
// 기능 요약: 캐릭터 문서(char) 작성 시 필요한 상세 속성(테마 컬러, 스위칭, 동적 속성 등)을 설정하는 UI 컴포넌트 v1.0.0

import React from 'react';
import styles from '../EditorPage.module.css';
import { IconGear, IconX } from './EditorIcons';

const CharMetaPanel = ({ 
  title, charProps, setCharProps, themeColor, setThemeColor, 
  cardLabels, setCardLabels, workContext, isHidden, setIsHidden 
}) => {
  console.log("[CharMetaPanel] 컴포넌트 렌더링 됨");

  return (
    <details className={styles.metaDetails} open>
      <summary style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <IconGear /> 캐릭터 상세 속성 설정
      </summary>
      <div className={styles.metaGrid} style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* 테마 컬러 설정 영역 */}
        <div className={styles.propRow}>
          <label>테마 컬러</label>
          <input 
            type="color" 
            value={themeColor} 
            onChange={e => {
              console.log(`[CharMetaPanel] 테마 컬러 변경: ${e.target.value}`);
              setThemeColor(e.target.value);
            }} 
            style={{ width: '40px', padding: 0 }} 
          />
          <input type="text" value={themeColor} disabled />
        </div>
        
        {/* 캐릭터 스위칭 타겟 설정 영역 */}
        <div className={styles.propRow}>
          <label>스위칭</label>
          <select 
            value={charProps.find(p => p.key === '_switchTarget')?.val || ""} 
            onChange={e => {
              console.log(`[CharMetaPanel] 스위칭 타겟 변경: ${e.target.value}`);
              const newProps = [...charProps];
              const idx = newProps.findIndex(p => p.key === '_switchTarget');
              if (idx > -1) newProps[idx].val = e.target.value;
              else newProps.push({ key: '_switchTarget', val: e.target.value });
              setCharProps(newProps);
            }}
            style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '13px' }}
          >
            <option value="">-- 스위칭 없음 --</option>
            {workContext?.characters?.filter(c => c.name !== title).map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        
        {/* 갤러리 목록 숨김 여부 영역 */}
        <div className={styles.propRow}>
          <label>목록에서 숨기기</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}>
            <input 
              type="checkbox" 
              checked={isHidden} 
              onChange={e => {
                console.log(`[CharMetaPanel] 목록 숨기기 상태 변경: ${e.target.checked}`);
                setIsHidden(e.target.checked);
              }} 
              style={{ width: '16px', height: '16px' }} 
            />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>체크 시 갤러리 목록에 나오지 않습니다 (서브 폼 전용)</span>
          </label>
        </div>
        
        {/* 카드 라벨(상단/하단) 설정 영역 */}
        <div className={styles.propRow}>
          <label>라벨 (이름 옆)</label>
          <input 
            value={cardLabels.label1} 
            onChange={e => {
              console.log(`[CharMetaPanel] 라벨1 변경: ${e.target.value}`);
              setCardLabels({...cardLabels, label1: e.target.value});
            }} 
            placeholder="나이" 
          />
        </div>
        <div className={styles.propRow}>
          <label>라벨 (이름 아래)</label>
          <input 
            value={cardLabels.label2} 
            onChange={e => {
              console.log(`[CharMetaPanel] 라벨2 변경: ${e.target.value}`);
              setCardLabels({...cardLabels, label2: e.target.value});
            }} 
            placeholder="성격" 
          />
        </div>

        {/* 사용자 정의 동적 속성 입력 영역 */}
        {charProps.map((p, i) => (
          <div key={i} className={styles.propRow}>
            <input 
              style={{ width: '100px', flex: 'none', textAlign: 'center' }} 
              value={p.key} 
              onChange={e => {
                console.log(`[CharMetaPanel] 속성명 변경 (인덱스 ${i}): ${e.target.value}`);
                const newProps = [...charProps]; 
                newProps[i].key = e.target.value; 
                setCharProps(newProps);
              }} 
              placeholder="속성명" 
            />
            <input 
              style={{ flex: 1 }} 
              value={p.val} 
              onChange={e => {
                console.log(`[CharMetaPanel] 속성값 변경 (인덱스 ${i}): ${e.target.value}`);
                const newProps = [...charProps]; 
                newProps[i].val = e.target.value; 
                setCharProps(newProps);
              }} 
              placeholder="내용" 
            />
            <button 
              className="wiki-btn" 
              style={{ padding: '4px', display: 'flex', alignItems: 'center', color: '#e53e3e', background: 'transparent', border: 'none' }} 
              onClick={() => {
                console.log(`[CharMetaPanel] 동적 속성 삭제 (인덱스 ${i})`);
                const newProps = [...charProps]; 
                newProps.splice(i, 1); 
                setCharProps(newProps);
              }}
            >
              <IconX />
            </button>
          </div>
        ))}
        
        {/* 속성 추가 버튼 */}
        <button 
          className="wiki-btn" 
          style={{ alignSelf: 'flex-start', background: 'var(--table-bg-alt)', color: 'var(--text-primary)' }} 
          onClick={() => {
            console.log("[CharMetaPanel] 새로운 동적 속성 칸 추가됨");
            setCharProps([...charProps, { key: '', val: '' }]);
          }}
        >
          + 속성 추가
        </button>
      </div>
    </details>
  );
};

export default CharMetaPanel;