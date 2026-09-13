// 파일 위치: src/pages/Login/components/StarChartScene.jsx
// 기능 요약: "성좌표" 시안. 별을 화면 전체에 순수 랜덤 좌표로 흩뿌리면 정답 위치를 사람이
// 설명/기억할 방법이 없어서(예전 시안 피드백), 6행×10열 격자에 살짝 흔들어 배치한다 —
// "위에서 2번째 줄, 왼쪽에서 5번째 별"처럼 서고/터미널/흔적과 같은 방식으로 셀 수 있다.
import React, { useMemo, useState } from 'react';
import RevealInput from './RevealInput';

const ROWS = 6, COLS = 10;
export const ITEM_COUNT = ROWS * COLS;

const StarChartScene = ({ onHit, revealed, error, submitting, onSubmit }) => {
  const [litIdx, setLitIdx] = useState(null);
  const stars = useMemo(() => {
    return Array.from({ length: ITEM_COUNT }, (_, i) => {
      const r = Math.floor(i / COLS), c = i % COLS;
      const cellW = 84 / COLS, cellH = 60 / ROWS;
      const jitterX = (Math.random() - 0.5) * cellW * 0.7;
      const jitterY = (Math.random() - 0.5) * cellH * 0.7;
      return {
        x: 8 + cellW * c + cellW / 2 + jitterX,
        y: 18 + cellH * r + cellH / 2 + jitterY,
        size: 1.4 + Math.random() * 2.2,
        delay: Math.random() * 3,
      };
    });
  }, []);

  const handleDouble = (i) => {
    setLitIdx(i);
    setTimeout(() => setLitIdx((cur) => (cur === i ? null : cur)), 500);
    onHit(i);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Gowun Batang', serif", background: 'radial-gradient(ellipse at 50% 30%, #131a3d 0%, #060814 70%)' }}>
      <style>{`
        @keyframes galpiGateTwinkle { 0%,100%{opacity:0.3;} 50%{opacity:0.95;} }
        .galpi-gate-star { animation: galpiGateTwinkle 3.2s ease-in-out infinite; }
      `}</style>
      <div style={{ position: 'absolute', top: '7%', left: 0, right: 0, textAlign: 'center', color: '#c9c6e8', letterSpacing: '0.3em', fontSize: '12.5px', opacity: 0.5 }}>
        별을 아는 자만 자리를 찾는다
      </div>
      {stars.map((s, i) => (
        <div
          key={i}
          className="galpi-gate-star"
          onDoubleClick={() => handleDouble(i)}
          style={{
            position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, width: `${litIdx === i ? s.size + 2.5 : s.size}px`, height: `${litIdx === i ? s.size + 2.5 : s.size}px`,
            borderRadius: '50%', background: '#e8ecf5', cursor: 'pointer', animationDelay: `${s.delay}s`,
            boxShadow: litIdx === i ? '0 0 10px 3px rgba(232,176,63,0.7)' : 'none', transition: 'box-shadow 0.3s, width 0.3s, height 0.3s'
          }}
        />
      ))}
      <RevealInput
        visible={revealed}
        error={error}
        submitting={submitting}
        onSubmit={onSubmit}
        caption="별자리가 완성되었습니다"
        captionStyle={{ color: '#c9c6e8', letterSpacing: '0.2em' }}
        panelStyle={{ padding: '20px' }}
        inputStyle={{ padding: '14px 16px', background: 'rgba(10,12,30,0.75)', border: '1px solid #4a4470', borderRadius: '2px', color: '#e8ecf5', fontFamily: "'Gowun Batang',serif", fontSize: '14px', textAlign: 'center', letterSpacing: '0.15em' }}
      />
    </div>
  );
};

export default StarChartScene;
