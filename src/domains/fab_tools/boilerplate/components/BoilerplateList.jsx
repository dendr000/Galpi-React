// src/domains/fab_tools/boilerplate/components/BoilerplateList.jsx
import React from 'react';

const BoilerplateList = ({ submittedSearch, matchedList, handleBpEdit, handleBpDelete }) => {
  return (
    <div style={{ flex: 1, overflowY: 'auto', maxHeight: '300px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {submittedSearch.trim() === '' ? (
        <div className="modal-empty" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
          검색어를 입력하고 Enter 키를 누르면 해당 폴더의 결과가 출력됩니다.
        </div>
      ) : matchedList.length === 0 ? (
        <div className="modal-empty" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
          일치하는 상용구 검색 결과가 없습니다.
        </div>
      ) : (
        matchedList.map(b => (
          <div key={b.id} className="bp-item" style={{ display: 'flex', padding: '10px 12px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '6px', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'var(--bg-color)', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>{b.category}</div>
            <div style={{ width: '100px', fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</div>
            <div style={{ flex: 1, color: 'var(--text-primary)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.content.replace('{#}', '[커서]')}</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => handleBpEdit(b)} style={{ border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>수정</button>
              <button onClick={() => handleBpDelete(b.id, b.title)} style={{ border: 'none', background: 'none', color: '#e53e3e', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>삭제</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default BoilerplateList;