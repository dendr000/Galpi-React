// src/domains/fabTools/boilerplate/components/BoilerplateSuggestPopup.jsx
import React from 'react';

const BoilerplateSuggestPopup = ({ popupState, commitBpExpansion, updatePopupState }) => {
  if (!popupState.active || popupState.matches.length === 0) return null;

  return (
    <div className="bp-suggest-popup" style={{
      position: 'fixed', top: popupState.y, left: popupState.x,
      background: 'var(--surface-color)', border: '1px solid var(--primary-color)',
      borderRadius: '8px', boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      zIndex: 999999, display: 'flex', flexDirection: 'column',
      minWidth: '220px', maxWidth: '350px', overflow: 'hidden'
    }}>
      {popupState.matches.map((m, i) => {
        const isActive = i === popupState.selectedIdx;
        const preview = m.content.replace('{#}', '').replace(/\n/g, ' ').substring(0, 20);
        
        return (
          <div 
            key={m.id} 
            onMouseDown={(e) => { e.preventDefault(); commitBpExpansion(i); }}
            onMouseEnter={() => updatePopupState({ selectedIdx: i })}
            style={{
              padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              background: isActive ? 'var(--table-bg-alt)' : 'transparent',
              borderBottom: '1px solid var(--border-color)', transition: 'background 0.1s'
            }}
          >
            {popupState.mode === 'choice' && (
              <span style={{
                background: 'var(--primary-color)', color: 'white', fontSize: '10px',
                padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold'
              }}>{i + 1}</span>
            )}
            <span style={{ fontWeight: '900', color: 'var(--primary-color)', fontSize: '13px' }}>{m.title}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{preview}...</span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', background: 'var(--bg-color)', padding: '2px 4px', borderRadius: '4px' }}>{m.category}</span>
          </div>
        );
      })}
    </div>
  );
};

export default BoilerplateSuggestPopup;