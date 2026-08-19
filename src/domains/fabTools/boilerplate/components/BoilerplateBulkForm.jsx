// src/domains/fabTools/boilerplate/components/BoilerplateBulkForm.jsx
import React from 'react';
import { IconFileText, IconRocket } from '../../components/FabIcons';

const BoilerplateBulkForm = ({ bpData }) => {
  if (!bpData.isBpBulkMode) return null;

  return (
    <div style={{ padding: '10px', background: 'rgba(59,91,219,0.05)', border: '1px dashed var(--primary-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
      <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <IconFileText size={14} /> 상용구 벌크 매크로 세션 등록 (단축어::::본문 양식 구분)
      </span>
      <textarea 
        value={bpData.bpBulk} 
        onChange={e => bpData.setBpBulk(e.target.value)} 
        style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', resize: 'none', height: '80px', fontFamily: 'inherit', outline: 'none', background: 'var(--surface-color)', color: 'var(--text-primary)', boxSizing: 'border-box' }} 
        placeholder="예시:&#13;&#10;!주인공::::비뢰검({#})이 울부짖었다."
      ></textarea>
      <button 
        className="wiki-btn primary-btn" 
        onClick={bpData.handleBpBulk} 
        style={{ marginLeft: 0, background: 'var(--primary-color)', color: 'white', border: 'none', padding: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
      >
        <IconRocket size={14} /> 서식 일괄 릴리즈
      </button>
    </div>
  );
};

export default BoilerplateBulkForm;