import React from 'react';
import { IconFileText, IconRocket } from '../../components/FabIcons';

const DictBulkForm = ({ dictBulk, setDictBulk, handleDictBulk }) => {
  return (
    <div style={{ padding: '10px', background: 'rgba(59,91,219,0.05)', border: '1px dashed var(--primary-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
      <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <IconFileText size={14} /> 다량 등록 (원문(한자) 줄바꿈 분할 매크로)
      </span>
      <textarea 
        value={dictBulk} 
        onChange={e => setDictBulk(e.target.value)} 
        style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', resize: 'none', height: '80px', fontFamily: 'inherit', outline: 'none', background: 'var(--surface-color)', color: 'var(--text-primary)' }} 
        placeholder="예시:&#13;&#10;초혼(招魂)"
      ></textarea>
      <button 
        className="wiki-btn primary-btn" 
        onClick={handleDictBulk} 
        style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
      >
        <IconRocket size={14} /> 벌크 컴파일 덤프 가동
      </button>
    </div>
  );
};

export default DictBulkForm;