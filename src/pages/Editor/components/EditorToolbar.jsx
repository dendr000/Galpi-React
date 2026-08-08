// 절대 경로: src/pages/Editor/components/EditorToolbar.jsx
// 기능 요약: 텍스트 에디터의 서식 지정(글꼴, 크기, 굵기 등) 및 텍스트 정렬 기능을 제공하는 툴바 컴포넌트 v1.2.0

import React from 'react';
import styles from '../EditorPage.module.css';

const EditorToolbar = ({ applyTextFormat, sortSelectedLines }) => {
  console.log("[EditorToolbar] 컴포넌트 렌더링 됨");

  return (
    <div 
      className={styles.formatToolbar} 
      style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '8px', 
        alignItems: 'center', 
        padding: '10px 0', 
        minHeight: '44px' 
      }}
    >
      {/* 글꼴 변경 드롭다운 */}
      <select 
        className={styles.formatSelect} 
        defaultValue="" 
        onChange={(e) => { 
          if(e.target.value) { 
            applyTextFormat(`[폰트:${e.target.value}:`, ']'); 
            e.target.value = ''; 
          } 
        }}
        style={{ height: '32px', padding: '0 8px', borderRadius: '4px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
      >
        <option value="" disabled>글꼴 변경</option>
        <option value="명조">명조체</option>
        <option value="궁서">궁서체</option>
        <option value="바탕">바탕체</option>
        <option value="돋움">돋움체</option>
        <option value="굴림">굴림체</option>
      </select>
      
      {/* 크기 변경 드롭다운 */}
      <select 
        className={styles.formatSelect} 
        defaultValue="" 
        onChange={(e) => { 
          if(e.target.value) { 
            applyTextFormat(`[크기:${e.target.value}:`, ']'); 
            e.target.value = ''; 
          } 
        }}
        style={{ height: '32px', padding: '0 8px', borderRadius: '4px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
      >
        <option value="" disabled>크기 변경</option>
        <option value="12">12px</option>
        <option value="14">14px</option>
        <option value="16">16px</option>
        <option value="20">20px</option>
        <option value="24">24px</option>
        <option value="32">32px</option>
      </select>
      
      {/* 텍스트 포맷 적용 버튼들 */}
      <button type="button" className={styles.formatBtn} style={{ height: '32px', padding: '0 12px', boxSizing: 'border-box' }} onClick={() => applyTextFormat('**', '**')}>굵게</button>
      <button type="button" className={styles.formatBtn} style={{ height: '32px', padding: '0 12px', boxSizing: 'border-box' }} onClick={() => applyTextFormat('_', '_')}>기울임</button>
      <button type="button" className={styles.formatBtn} style={{ height: '32px', padding: '0 12px', boxSizing: 'border-box' }} onClick={() => applyTextFormat('--', '--')}>취소선</button>
      <button type="button" className={styles.formatBtn} style={{ height: '32px', padding: '0 12px', boxSizing: 'border-box' }} onClick={() => applyTextFormat('[정렬:중앙:', ']')}>중앙정렬</button>
      <button type="button" className={styles.formatBtn} style={{ height: '32px', padding: '0 12px', boxSizing: 'border-box' }} onClick={() => applyTextFormat('[정렬:우측:', ']')}>우측정렬</button>
      <button type="button" className={styles.formatBtn} style={{ height: '32px', padding: '0 12px', boxSizing: 'border-box' }} onClick={() => applyTextFormat('[들여쓰기:', ']')}>들여쓰기</button>
      <button type="button" className={styles.formatBtn} style={{ height: '32px', padding: '0 12px', boxSizing: 'border-box' }} onClick={sortSelectedLines}>가나다정렬</button>
    </div>
  );
};

export default EditorToolbar;