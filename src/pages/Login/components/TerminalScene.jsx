// 파일 위치: src/pages/Login/components/TerminalScene.jsx
// 기능 요약: "터미널 침입" 시안. 로그 8줄 중 두 줄을 정해진 순서로 더블클릭하면 열린다.
import React, { useMemo, useState } from 'react';
import RevealInput from './RevealInput';

const LOGS = [
  "[ok] auth handshake :: node-14 stable",
  "[warn] cache miss :: memo_index",
  "[ok] sync complete :: 613 records",
  "[info] gate_04 :: idle",
  "[ok] render thread :: 60fps",
  "[warn] retry queue :: 2 pending",
  "[info] session idle :: 00:04:12",
  "[ok] backup snapshot :: complete",
];
export const ITEM_COUNT = LOGS.length;
const RAIN_CHARS = "01アイウエオカキクケコ갈피GALPI";

const TerminalScene = ({ onHit, revealed, error, submitting, onSubmit }) => {
  const [litIdx, setLitIdx] = useState(null);
  const columns = useMemo(() => Array.from({ length: 26 }, (_, i) => ({
    left: i * 3.8,
    dur: 4 + Math.random() * 5,
    delay: -Math.random() * 6,
    text: Array.from({ length: 28 }, () => RAIN_CHARS[Math.floor(Math.random() * RAIN_CHARS.length)]).join('\n'),
  })), []);

  const handleDouble = (i) => {
    setLitIdx(i);
    setTimeout(() => setLitIdx((cur) => (cur === i ? null : cur)), 400);
    onHit(i);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'IBM Plex Mono', monospace", background: '#08090b', overflow: 'hidden' }}>
      <style>{`
        @keyframes galpiGateFall { to { transform: translateY(140vh); } }
        @keyframes galpiGateBlink { 50% { opacity: 0; } }
      `}</style>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.45 }}>
        {columns.map((col, i) => (
          <div key={i} style={{
            position: 'absolute', top: '-40%', left: `${col.left}%`, width: '16px', color: '#00e5ff', fontSize: '12px',
            lineHeight: 1.35, whiteSpace: 'pre', opacity: 0.5, animation: `galpiGateFall ${col.dur}s linear infinite`, animationDelay: `${col.delay}s`
          }}>{col.text}</div>
        ))}
      </div>
      <div style={{ position: 'absolute', top: '6%', left: '6%', color: '#00e5ff', fontSize: '12px', letterSpacing: '0.15em', opacity: 0.65 }}>
        root@galpi:~$ SYSTEM LOG — scanning stream
      </div>
      {LOGS.map((t, i) => (
        <div
          key={i}
          onDoubleClick={() => handleDouble(i)}
          style={{
            position: 'absolute', left: '6%', right: '6%', top: `${15 + i * 7.5}%`, fontSize: '12.5px',
            letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', cursor: 'pointer',
            color: litIdx === i ? '#00e5ff' : '#5a6670', textShadow: litIdx === i ? '0 0 8px rgba(0,229,255,0.6)' : 'none',
            transition: 'color 0.2s, text-shadow 0.2s'
          }}
        >{t}</div>
      ))}
      <RevealInput
        visible={revealed}
        error={error}
        submitting={submitting}
        onSubmit={onSubmit}
        caption={<>&gt; ACCESS_GRANTED... awaiting credentials<span style={{ display: 'inline-block', width: '7px', height: '14px', background: '#00e5ff', marginLeft: '3px', animation: 'galpiGateBlink 1s step-end infinite', verticalAlign: 'middle' }}></span></>}
        captionStyle={{ color: '#00e5ff', textAlign: 'left' }}
        panelStyle={{ background: 'rgba(8,9,11,0.95)', border: '1px solid #1c2a30', padding: '18px 20px', textAlign: 'left', boxShadow: '0 0 40px rgba(0,229,255,0.08)' }}
        inputStyle={{ padding: '12px 14px', background: '#0d1013', border: '1px solid #1c2a30', borderLeft: '3px solid #00e5ff', color: '#e8ecf5', fontFamily: "'IBM Plex Mono',monospace", fontSize: '13.5px' }}
      />
    </div>
  );
};

export default TerminalScene;
