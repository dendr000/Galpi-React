// src/domains/fab_tools/boilerplate/components/BoilerplateForm.jsx
import React from 'react';
import { IconSave, IconPlus, IconChevronDown } from '../../components/FabIcons';
import { inpSty } from '../utils/boilerplateStyles';

const BoilerplateForm = ({ bpData }) => {
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', height: '36px' }}>
      <input type="text" placeholder="단축어 명칭 (!검성)" value={bpData.bpInput.title} onChange={e => bpData.setBpInput({...bpData.bpInput, title: e.target.value})} style={{...inpSty, width: '120px'}} autoComplete="off" />
      <textarea placeholder="치환 본문 (커서: {#})" value={bpData.bpInput.content} onChange={e => bpData.setBpInput({...bpData.bpInput, content: e.target.value})} style={{...inpSty, flex: 1, resize: 'none', height: '100%', fontFamily: 'inherit'}} autoComplete="off" />
      
      {bpData.editingId ? (
        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="wiki-btn" onClick={bpData.handleBpSave} style={{ padding: '8px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><IconSave size={14} /> 저장</button>
          <button className="wiki-btn outline-btn gray" onClick={bpData.handleBpCancelEdit} style={{ padding: '8px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>취소</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="wiki-btn primary-btn" onClick={bpData.handleBpSave} style={{ padding: '8px 16px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><IconPlus size={14} /> 추가</button>
          <button className="wiki-btn outline-btn gray" onClick={() => bpData.setIsBpBulkMode(!bpData.isBpBulkMode)} style={{ padding: '8px 10px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>일괄 <IconChevronDown size={14} /></button>
        </div>
      )}
    </div>
  );
};

export default BoilerplateForm;