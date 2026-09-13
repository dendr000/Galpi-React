// 파일 위치: src/pages/Login/components/TraceScene.jsx
// 기능 요약: "흔적" 시안(괴담류). 액자 7개 중 두 개를 순서대로 더블클릭하면 화면이 잠깐
// 밝아졌다 암전되고, 그 다음에야 쪽지 문구와 함께 입력창이 뜬다.
import React, { useEffect, useMemo, useState } from 'react';
import RevealInput from './RevealInput';

export const ITEM_COUNT = 7;

const TraceScene = ({ onHit, revealed, error, submitting, onSubmit }) => {
  const [phase, setPhase] = useState('idle'); // idle -> glitch -> blackout -> shown
  const rotations = useMemo(() => Array.from({ length: ITEM_COUNT }, () => (Math.random() * 6 - 3)), []);

  useEffect(() => {
    if (!revealed || phase !== 'idle') return;
    setPhase('glitch');
    const t1 = setTimeout(() => setPhase('blackout'), 90);
    const t2 = setTimeout(() => setPhase('shown'), 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [revealed, phase]);

  return (
    <div style={{
      position: 'absolute', inset: 0, fontFamily: "'Nanum Myeongjo', serif",
      background: 'radial-gradient(ellipse 70% 55% at 50% 40%, #16151a 0%, #08070a 75%)',
      filter: phase === 'glitch' ? 'contrast(1.4) brightness(1.6)' : 'none'
    }}>
      <style>{`
        @keyframes galpiGateGrain { 0%{transform:translate(0,0);} 50%{transform:translate(-1px,1px);} 100%{transform:translate(1px,-1px);} }
        @keyframes galpiGateFlicker { 0%,19%,21%,23%,55%,57%,100%{opacity:1;} 20%,22%,56%{opacity:0.25;} }
        .galpi-gate-grain::before{ content:""; position:absolute; inset:0; pointer-events:none; z-index:5;
          background-image: radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px); background-size:3px 3px;
          animation: galpiGateGrain 0.4s steps(2) infinite; }
        .galpi-gate-bulb::after{ content:""; position:absolute; bottom:-14px; left:50%; transform:translateX(-50%); width:26px; height:26px; border-radius:50%;
          background: radial-gradient(circle, rgba(255,225,160,0.55), rgba(255,225,160,0.05) 70%); animation: galpiGateFlicker 4.5s infinite; }
      `}</style>
      <div className="galpi-gate-grain" style={{ position: 'absolute', inset: 0 }}>
        <div style={{ position: 'absolute', top: '7%', left: 0, right: 0, textAlign: 'center', color: '#8a8375', letterSpacing: '0.3em', fontSize: '11.5px', opacity: 0.55 }}>흔  적</div>
        <div style={{ position: 'absolute', top: '8%', right: '6%', fontSize: '11px', letterSpacing: '0.1em', color: '#6b6558', opacity: 0.6 }}>11 : 47</div>
        <div className="galpi-gate-bulb" style={{ position: 'absolute', top: '9%', left: '50%', transform: 'translateX(-50%)', width: '3px', height: '60px', background: 'linear-gradient(#3a3630,#1a1712)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '26px', flexWrap: 'wrap', padding: '0 8%' }}>
          {rotations.map((r, i) => (
            <div
              key={i}
              onDoubleClick={() => onHit(i)}
              style={{
                width: '92px', height: '118px', background: '#1c1a17', border: '6px solid #2e2a24',
                boxShadow: '0 10px 26px rgba(0,0,0,0.6), inset 0 0 12px rgba(0,0,0,0.5)', cursor: 'pointer',
                position: 'relative', transform: `rotate(${r}deg)`, transition: 'transform 0.3s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = `rotate(${r}deg) translateY(-4px)`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = `rotate(${r}deg)`; }}
            >
              <div style={{ position: 'absolute', inset: '8px', background: 'linear-gradient(160deg, #26241f, #100f0d)', opacity: 0.9 }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: phase === 'blackout' || phase === 'shown' ? 1 : 0, pointerEvents: 'none', transition: 'opacity 0.5s ease', zIndex: 25 }} />
      <RevealInput
        visible={phase === 'shown'}
        error={error}
        submitting={submitting}
        onSubmit={onSubmit}
        caption={<>"...여기, 아무도 모르게 두고 갑니다.<br/>알아볼 사람만 알아보겠지요."</>}
        captionStyle={{ color: '#c9c2ac', fontSize: '13px', lineHeight: 1.7 }}
        panelStyle={{ background: 'rgba(14,12,9,0.92)', border: '1px solid #3a3428', padding: '26px 24px', boxShadow: '0 0 60px rgba(0,0,0,0.7)' }}
        inputStyle={{ padding: '13px 15px', background: '#0c0b09', border: '1px solid #3a3428', color: '#c9c2ac', fontFamily: "'Nanum Myeongjo',serif", fontSize: '13.5px', textAlign: 'center' }}
      />
    </div>
  );
};

export default TraceScene;
