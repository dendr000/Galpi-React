// 파일 위치: src/components/common/useGenreCursorMotion.js
// 기능 요약: GenreCursor.jsx가 그리는 커서의 실제 움직임(위치 추적/lerp, 회전, 파티클·잔상
// 트레일 등)을 담당하는 훅. 커서 종류가 늘어날수록 로직만 여기서 자란다 — 생김새는
// GenreCursor.css, DOM 구조 선택은 GenreCursor.jsx에서 관리한다.
import { useEffect } from 'react';

const HOVER_SELECTOR = '.gt-card, .gt-hero-title, button, a, select';

export function useGenreCursorMotion({ kind, zoneId, refs }) {
  useEffect(() => {
    if (!kind) return;
    const zone = document.getElementById(zoneId);
    const cursor = refs.cursor.current;
    if (!zone || !cursor) return;

    let mx = 0, my = 0, cx = 0, cy = 0, geigerX = 0, geigerY = 0, raf;
    let bladeAngle = 0, lastX = 0, lastY = 0, emberFlicker = 1;
    let brushDots = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }];
    let lastMoteSpawn = 0;
    let cxAngle = 0, cxAngleTarget = 0, cxHover = false;
    let lastReadoutTick = 0;

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

      if (kind === 'block' || kind === 'chroma' || kind === 'blade' || kind === 'crosshair') {
        const angle = kind === 'blade' ? `rotate(${bladeAngle}deg)` : '';
        cursor.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%) ${angle}`;
      }
      if (kind === 'chroma') {
        const j = () => (Math.random() - 0.5) * 6;
        if (refs.ghostA.current) refs.ghostA.current.style.transform = `translate(${j()}px, ${j()}px)`;
        if (refs.ghostB.current) refs.ghostB.current.style.transform = `translate(${j()}px, ${j()}px)`;
      }
      if (kind === 'blade') {
        const dx = e.clientX - lastX, dy = e.clientY - lastY;
        const speed = Math.hypot(dx, dy);
        if (speed > 1.5) bladeAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        lastX = e.clientX; lastY = e.clientY;
        if (speed > 26) spawnSlash(mx, my, bladeAngle);
      }
      if (kind === 'comicstar') { cxAngleTarget = (Math.random() - 0.5) * 30; }
      if (kind === 'hudbracket') {
        // HUD 브래킷: 바깥 래퍼(hudPos)는 transform을 절대 쓰지 않는다 — 안쪽 .gt-cursor-hud의
        // 회전 애니메이션과 transform 프로퍼티가 겹치면 CSS 애니메이션이 이겨서 위치이동이
        // 통째로 무시된다. left/top만으로 옮기고 중앙 정렬은 CSS margin으로 처리한다.
        if (refs.hudPos.current) { refs.hudPos.current.style.left = `${mx}px`; refs.hudPos.current.style.top = `${my}px`; }
        if (performance.now() - lastReadoutTick > 220) {
          lastReadoutTick = performance.now();
          if (refs.hudReadout.current) refs.hudReadout.current.textContent = `X${Math.round(mx)} Y${Math.round(my)}`;
        }
      }

      const hovered = !!e.target.closest(HOVER_SELECTOR);
      let hoverTarget = cursor;
      if (kind === 'brush') hoverTarget = refs.brushDot.current;
      else if (kind === 'geiger') hoverTarget = refs.geigerVisual.current;
      else if (kind === 'campfire') hoverTarget = refs.campfire.current;
      else if (kind === 'hudbracket') hoverTarget = refs.hudPos.current;
      if (kind === 'comicstar') cxHover = hovered;
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
        if (refs.brushDot.current) refs.brushDot.current.style.transform = `translate(${brushDots[0].x}px, ${brushDots[0].y}px) translate(-50%, -50%)`;
        refs.brushGhosts.forEach((ref, i) => {
          if (ref.current) ref.current.style.transform = `translate(${brushDots[i + 1].x}px, ${brushDots[i + 1].y}px) translate(-50%, -50%)`;
        });
      } else if (kind === 'geiger') {
        // 회전(CSS 애니메이션)과 위치이동(JS)이 같은 transform을 두고 충돌하지 않도록
        // 위치는 이 중간 래퍼(geigerPos)에만 건다 — 실제 회전 링(geigerVisual)은 건드리지 않는다.
        geigerX += (mx - geigerX) * 0.24;
        geigerY += (my - geigerY) * 0.24;
        if (refs.geigerPos.current) refs.geigerPos.current.style.transform = `translate(${geigerX}px, ${geigerY}px) translate(-50%, -50%)`;
      } else if (kind === 'campfire') {
        cx += (mx - cx) * 0.22;
        cy += (my - cy) * 0.22;
        emberFlicker += (Math.random() - 0.5) * 0.35;
        emberFlicker = Math.max(0.55, Math.min(1, emberFlicker));
        if (refs.campfire.current) {
          refs.campfire.current.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%) scale(${0.85 + emberFlicker * 0.25})`;
          refs.campfire.current.style.opacity = String(0.7 + emberFlicker * 0.3);
        }
      } else if (kind === 'comicstar') {
        cx += (mx - cx) * 0.35;
        cy += (my - cy) * 0.35;
        cxAngle += (cxAngleTarget - cxAngle) * 0.2;
        const scale = cxHover ? 1.35 : 1;
        cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%) rotate(${cxAngle}deg) scale(${scale})`;
      } else if (kind === 'beacon') {
        cx += (mx - cx) * 0.16;
        cy += (my - cy) * 0.16;
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
    // refs는 useRef로 생성된 안정적인 객체(.current만 바뀜)라 의존성 목록에 넣지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, zoneId]);
}
