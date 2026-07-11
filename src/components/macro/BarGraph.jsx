import React from 'react';

const BarGraph = ({ dataStr }) => {
  if (!dataStr) return null;

  try {
    const pairs = dataStr.split(',').map(s => s.trim().split('='));

    return (
      <div style={{ margin: '15px 0', display: 'flex', flexDirection: 'column', gap: '10px', padding: '15px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
        {pairs.map((p, idx) => {
          if (p.length !== 2) return null;
          const label = p[0].trim();
          const valStr = p[1].trim();
          const valParts = valStr.split('/');
          
          const current = parseFloat(valParts[0]) || 0;
          const max = valParts.length > 1 ? parseFloat(valParts[1]) : 100;
          const percent = Math.min(100, Math.max(0, (current / max) * 100));
          
          let barColor = "var(--primary-color)";
          if (percent <= 30) barColor = "#e53e3e";
          else if (percent >= 80) barColor = "#10b981";

          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '80px', fontWeight: 900, fontSize: '13px', color: 'var(--text-primary)', textAlign: 'right' }}>{label}</div>
              <div style={{ flex: 1, height: '14px', background: 'var(--table-bg-alt)', borderRadius: '8px', overflow: 'hidden', position: 'relative', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}>
                <div style={{ width: `${percent}%`, height: '100%', background: barColor, borderRadius: '8px', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
              </div>
              <div style={{ width: '65px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{valStr}</div>
            </div>
          );
        })}
      </div>
    );
  } catch (e) {
    return <div style={{color: '#e53e3e', fontSize: '12px'}}>[게이지 렌더링 오류]</div>;
  }
};

export default BarGraph;