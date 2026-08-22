// 파일 위치: src/components/common/GenreCursor.jsx
// 기능 요약: 작품의 장르 테마(무협·사이버펑크 각 세부 방향)에 따라 지정된 영역(zoneId) 안에서만
// 커스텀 마우스 커서를 보여준다. 사용자의 전역 "마우스 커서 스무스 모션" 설정과는
// 별개로, 이 작품을 보는 동안에만 해당 테마의 커서가 나타난다.
// 각 종류의 생김새(색/모양)는 GenreCursor.css에, 여기서는 움직임 로직만 다룬다.
import React, { useEffect, useRef } from 'react';
import './GenreCursor.css';

// 테마별 커서 없음(null)이면 아무것도 렌더링하지 않는다
const CURSOR_KIND = {
  'cyberpunk-neon': 'reticle',
  'cyberpunk-terminal': 'block',
  'cyberpunk-graffiti': 'chroma',
  'wuxia-ink': 'brush',
  'wuxia-blood': 'blade',
  'wuxia-ascend': 'orb',
};

const HOVER_SELECTOR = '.gt-card, .gt-hero-title, button, a, select';

const GenreCursor = ({ theme, zoneId }) => {
  const kind = CURSOR_KIND[theme];
  const cursorRef = useRef(null);
  const ghostARef = useRef(null);
  const ghostBRef = useRef(null);
  const brushDotRef = useRef(null);
  const brushGhostRefs = [useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    if (!kind) return;
    const zone = document.getElementById(zoneId);
    const cursor = cursorRef.current;
    if (!zone || !cursor) return;

    let mx = 0, my = 0, cx = 0, cy = 0, raf;
    let bladeAngle = 0, lastX = 0, lastY = 0;
    let brushDots = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }];
    let lastMoteSpawn = 0;

    const show = () => cursor.classList.add('gt-cursor-show');
    const hide = () => cursor.classList.remove('gt-cursor-show');

    const spawnSlash = (x, y, angle) => {
      const el = document.createElement('div');
      el.className = 'gt-cursor-slash';
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        el.style.opacity = '0';
        el.style.transform = `translate(-50%, -50%) rotate(${angle}deg) scale(1.8)`;
      });
      setTimeout(() => el.remove(), 380);
    };

    const spawnMote = (x, y) => {
      const el = document.createElement('div');
      el.className = 'gt-cursor-mote';
      const size = 3 + Math.random() * 3;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1050);
    };

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;

      if (kind === 'block' || kind === 'chroma' || kind === 'blade' || kind === 'orb') {
        // 하드 스냅 계열: 매끄러운 lerp 없이 즉시 좌표를 따라간다
        if (kind !== 'orb') {
          const angle = kind === 'blade' ? `rotate(${bladeAngle}deg)` : '';
          cursor.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%) ${angle}`;
        }
      }
      if (kind === 'chroma') {
        const j = () => (Math.random() - 0.5) * 6;
        if (ghostARef.current) ghostARef.current.style.transform = `translate(${j()}px, ${j()}px)`;
        if (ghostBRef.current) ghostBRef.current.style.transform = `translate(${j()}px, ${j()}px)`;
      }
      if (kind === 'blade') {
        const dx = e.clientX - lastX, dy = e.clientY - lastY;
        const speed = Math.hypot(dx, dy);
        if (speed > 1.5) bladeAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        lastX = e.clientX; lastY = e.clientY;
        if (speed > 26) spawnSlash(mx, my, bladeAngle);
      }

      const hovered = !!e.target.closest(HOVER_SELECTOR);
      const hoverTarget = kind === 'brush' ? brushDotRef.current : cursor;
      if (hoverTarget) hoverTarget.classList.toggle('gt-cursor-hover', hovered);
    };

    const tick = (t) => {
      if (kind === 'reticle') {
        cx += (mx - cx) * 0.22;
        cy += (my - cy) * 0.22;
        cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      } else if (kind === 'orb') {
        cx += (mx - cx) * 0.18;
        cy += (my - cy) * 0.18;
        cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
        if (t - lastMoteSpawn > 75) { lastMoteSpawn = t; spawnMote(cx, cy); }
      } else if (kind === 'brush') {
        brushDots[0].x += (mx - brushDots[0].x) * 0.28;
        brushDots[0].y += (my - brushDots[0].y) * 0.28;
        for (let i = 1; i < 4; i++) {
          brushDots[i].x += (brushDots[i - 1].x - brushDots[i].x) * 0.38;
          brushDots[i].y += (brushDots[i - 1].y - brushDots[i].y) * 0.38;
        }
        if (brushDotRef.current) brushDotRef.current.style.transform = `translate(${brushDots[0].x}px, ${brushDots[0].y}px) translate(-50%, -50%)`;
        brushGhostRefs.forEach((ref, i) => {
          if (ref.current) ref.current.style.transform = `translate(${brushDots[i + 1].x}px, ${brushDots[i + 1].y}px) translate(-50%, -50%)`;
        });
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

      {kind === 'brush' && (
        <div ref={cursorRef} className="gt-cursor">
          <div ref={brushDotRef} className="gt-cursor-part gt-cursor-brush-dot" />
          {brushGhostRefs.map((ref, i) => (
            <div key={i} ref={ref} className="gt-cursor-part gt-cursor-brush-ghost" style={{ width: 16 - i * 3, height: 16 - i * 3, opacity: 0.28 - i * 0.06 }} />
          ))}
        </div>
      )}

      {kind === 'blade' && (
        <div ref={cursorRef} className="gt-cursor gt-cursor-blade" style={{ ...cursorBaseStyle, left: 0, top: 0 }} />
      )}

      {kind === 'orb' && (
        <div ref={cursorRef} className="gt-cursor gt-cursor-orb" style={cursorBaseStyle} />
      )}
    </>
  );
};

const cursorBaseStyle = { transform: 'translate(-50%, -50%)' };

export default GenreCursor;
