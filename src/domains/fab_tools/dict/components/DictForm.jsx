// src/domains/fab_tools/dict/components/DictForm.jsx
import React from 'react';
import { IconSave, IconPlus, IconChevronDown } from '../../components/FabIcons';
import { inpSty } from '../utils/dictStyles';

const DictForm = ({ dictInput, setDictInput, editingTarget, handleDictSave, handleCancelEdit, isDictBulkMode, setIsDictBulkMode }) => {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <input 
        type="text" 
        placeholder="원문" 
        value={dictInput.word} 
        onChange={e => setDictInput({...dictInput, word: e.target.value})} 
        style={{...inpSty, flex: 1, minWidth: 0}} 
        autoComplete="off" 
      />
      <input 
        type="text" 
        placeholder="한자/영문" 
        value={dictInput.trans} 
        onChange={e => setDictInput({...dictInput, trans: e.target.value})} 
        onKeyDown={e => e.key === 'Enter' && handleDictSave()} 
        style={{...inpSty, flex: 1, minWidth: 0}} 
        autoComplete="off" 
      />
      
      {editingTarget ? (
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          <button className="wiki-btn" onClick={handleDictSave} style={{ whiteSpace: 'nowrap', padding: '8px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <IconSave size={14} /> 저장
          </button>
          <button className="wiki-btn outline-btn gray" onClick={handleCancelEdit} style={{ whiteSpace: 'nowrap', padding: '8px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            취소
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          <button className="wiki-btn primary-btn" onClick={handleDictSave} style={{ whiteSpace: 'nowrap', padding: '8px 16px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <IconPlus size={14} /> 추가
          </button>
          <button className="wiki-btn outline-btn gray" onClick={() => setIsDictBulkMode(!isDictBulkMode)} style={{ whiteSpace: 'nowrap', padding: '8px 10px', background: 'var(--table-bg-alt)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            일괄 <IconChevronDown size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DictForm;