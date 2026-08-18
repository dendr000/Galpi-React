import React from 'react';
import { IconSearch } from '../../components/FabIcons';
import { inpSty } from '../utils/dictStyles';

const DictSearchBar = ({ dictSearch, setDictSearch, submitSearch }) => {
  return (
    <div style={{ position: 'relative', marginTop: '12px', marginBottom: '12px' }}>
      <button 
        onClick={submitSearch}
        style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        title="검색 (Enter)"
      >
        <IconSearch size={14} />
      </button>
      <input 
        type="text" 
        placeholder="검색어 입력 후 Enter를 누르세요..." 
        value={dictSearch} 
        onChange={e => setDictSearch(e.target.value)} 
        onKeyDown={e => e.key === 'Enter' && submitSearch()}
        style={{...inpSty, width: '100%', paddingLeft: '32px', boxSizing: 'border-box'}} 
        autoComplete="off" 
        spellCheck="false" 
      />
    </div>
  );
};

export default DictSearchBar;