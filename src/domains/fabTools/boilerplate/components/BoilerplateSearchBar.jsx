// src/domains/fabTools/boilerplate/components/BoilerplateSearchBar.jsx
import React from 'react';
import { IconSearch } from '../../components/FabIcons';
import { inpSty } from '../utils/boilerplateStyles';

const BoilerplateSearchBar = ({ bpSearch, setBpSearch, submitSearch }) => {
  return (
    <div style={{ position: 'relative', marginBottom: '12px' }}>
      <button 
        onClick={submitSearch}
        style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        title="검색 (Enter)"
      >
        <IconSearch size={14} />
      </button>
      <input 
        type="text" 
        placeholder="단축어 또는 본문 내용 검색 (Enter를 누르세요)..." 
        value={bpSearch} 
        onChange={e => setBpSearch(e.target.value)} 
        onKeyDown={e => e.key === 'Enter' && submitSearch()}
        style={{...inpSty, width: '100%', paddingLeft: '32px'}} 
        autoComplete="off" 
        spellCheck="false" 
      />
    </div>
  );
};

export default BoilerplateSearchBar;