// 파일 위치: src/components/common/GenreCursor.jsx
// 기능 요약: 작품의 장르 테마(사이버펑크 계열 등)에 따라 지정된 영역(zoneId) 안에서만
// 커스텀 마우스 커서를 보여준다. 사용자의 전역 "마우스 커서 스무스 모션" 설정과는
// 별개로, 이 작품을 보는 동안에만 해당 테마의 커서가 나타난다.
import React, { useEffect, useRef } from 'react';

// 테마별 커서 없음(null)이면 아무것도 렌더링하지 않는다 — 무협 등은 아직 전용 커서가 없음
const CURSOR_KIND = {
  'cyberpunk-neon': 'reticle',
  'cyberpunk-terminal': 'block',
  'cyberpunk-graffiti': 'chroma',
};

const GenreCursor = ({ theme, zoneId }) => {
  const kind = CURSOR_KIND[theme];
  const cursorRef = useRef(null);
  const ghostARef = useRef(null);
  const ghostBRef = useRef(null);

  useEffect(() => {
    if (!kind) return;
    const zone = document.getElementById(zoneId);
    const cursor = cursorRef.current;
    if (!zone || !cursor) return;

    let mx = 0, my = 0, cx = 0, cy = 0, raf;

    const show = () => cursor.classList.add('gt-cursor-show');
    const hide = () => cursor.classList.remove('gt-cursor-show');

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      if (kind === 'block' || kind === 'chroma') {
        cursor.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      }
      if (kind === 'chroma') {
        const j = () => (Math.random() - 0.5) * 6;
        if (ghostARef.current) ghostARef.current.style.transform = `translate(${j()}px, ${j()}px)`;
        if (ghostBRef.current) ghostBRef.current.style.transform = `translate(${j()}px, ${j()}px)`;
      }
      const hovered = !!e.target.closest('.gt-card, .gt-hero-title, button, a, select');
      cursor.classList.toggle('gt-cursor-hover', hovered);
    };

    const tick = () => {
      if (kind === 'reticle') {
        cx += (mx - cx) * 0.22;
        cy += (my - cy) * 0.22;
        cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    zone.style.cursor = 'none';
    zone.addEventListener('mouseenter', show);
    zone.addEventListener('mouseleave', hide);
    zone.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      zone.style.cursor = '';
      zone.removeEventListener('mouseenter', show);
      zone.removeEventListener('mouseleave', hide);
      zone.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [kind, zoneId]);

  if (!kind) return null;

  return (
    <>
      {/* 영역 안의 모든 자식 요소도 네이티브 커서를 감추도록 스코프된 스타일 */}
      <style>{`#${zoneId}, #${zoneId} * { cursor: none !important; }`}</style>

      {kind === 'reticle' && (
        <div ref={cursorRef} className="gt-cursor gt-cursor-reticle" style={cursorBaseStyle} />
      )}

      {kind === 'block' && (
        <div ref={cursorRef} className="gt-cursor gt-cursor-block" style={{ ...cursorBaseStyle, left: 0, top: 0 }} />
      )}

      {kind === 'chroma' && (
        <div ref={cursorRef} className="gt-cursor gt-cursor-chroma" style={{ ...cursorBaseStyle, left: 0, top: 0 }}>
          <div ref={ghostARef} className="gt-cursor-chroma-ghost gt-cursor-chroma-red" />
          <div ref={ghostBRef} className="gt-cursor-chroma-ghost gt-cursor-chroma-cyan" />
          <div className="gt-cursor-chroma-core" />
        </div>
      )}

      <style>{`
        .gt-cursor { position: fixed; top: 0; left: 0; pointer-events: none; z-index: 999999; opacity: 0; transition: opacity .15s; }
        .gt-cursor-show { opacity: 1; }

        .gt-cursor-reticle { width: 26px; height: 26px; border: 1.5px solid #4fd3ec; border-radius: 50%; box-shadow: 0 0 14px rgba(79,211,236,0.7); transition: width .15s, height .15s, opacity .15s; }
        .gt-cursor-reticle::before, .gt-cursor-reticle::after { content: ""; position: absolute; background: #4fd3ec; }
        .gt-cursor-reticle::before { left: 50%; top: -7px; width: 1px; height: 6px; transform: translateX(-50%); }
        .gt-cursor-reticle::after { left: -7px; top: 50%; width: 6px; height: 1px; transform: translateY(-50%); }
        .gt-cursor-reticle.gt-cursor-hover { width: 40px; height: 40px; }

        .gt-cursor-block { width: 11px; height: 18px; background: #57ffa0; box-shadow: 0 0 8px rgba(87,255,160,0.8); animation: gtBlockBlink 1s step-end infinite; }
        .gt-cursor-block.gt-cursor-hover { background: #b8ffd6; width: 16px; }
        @keyframes gtBlockBlink { 50% { opacity: 0.25; } }

        .gt-cursor-chroma { width: 22px; height: 22px; }
        .gt-cursor-chroma-core { position: absolute; inset: 0; border: 2px solid #f5f5f5; }
        .gt-cursor-chroma-ghost { position: absolute; inset: 0; mix-blend-mode: screen; transition: transform .05s linear; }
        .gt-cursor-chroma-red { border: 2px solid #ff1f3d; }
        .gt-cursor-chroma-cyan { border: 2px solid #2be0ff; }
        .gt-cursor-chroma.gt-cursor-hover .gt-cursor-chroma-core { border-color: #ff1f3d; }
      `}</style>
    </>
  );
};

const cursorBaseStyle = { transform: 'translate(-50%, -50%)' };

export default GenreCursor;
