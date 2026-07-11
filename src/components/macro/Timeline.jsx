import React from 'react';

const Timeline = ({ innerText }) => {
  const lines = innerText.trim().split('\n');
  const validItems = [];

  lines.forEach((line, idx) => {
    const parts = line.split('::::');
    if (parts.length >= 1) {
      const dateVal = (parts[0] || "").trim();
      const titleVal = (parts[1] || "").trim();
      const descVal = (parts[2] || "").trim().replace(/<br>/g, '\n');
      if (dateVal || titleVal || descVal) {
        validItems.push({ id: idx, dateVal, titleVal, descVal });
      }
    }
  });

  if (validItems.length === 0) return null;

  return (
    <div style={{ borderLeft: '3px solid var(--primary-color)', marginLeft: '10px', paddingLeft: '15px', display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px', marginBottom: '20px' }}>
      {validItems.map(item => (
        <div key={item.id} style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '-22px', top: '2px', width: '11px', height: '11px', borderRadius: '50%', background: 'var(--primary-color)', border: '2px solid var(--bg-color)', boxSizing: 'content-box' }}></div>
          {item.dateVal && <div style={{ fontWeight: 900, color: 'var(--primary-color)', fontSize: '13px' }}>{item.dateVal}</div>}
          {item.titleVal && <div style={{ fontWeight: 'bold', fontSize: '16px', marginTop: '2px', color: 'var(--text-primary)' }}>{item.titleVal}</div>}
          {item.descVal && (
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.6 }}>
              {item.descVal.split('\n').map((str, i) => <React.Fragment key={i}>{str}<br/></React.Fragment>)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Timeline;