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
    let cxAngle = 0, cxAngleTarget = 0, cxHover = false, lastSwayX = 0;
    let lastReadoutTick = 0;
    const mountTime = performance.now();
    let jumpTimer;

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

      if (kind === 'block' || kind === 'chroma' || kind === 'blade' || kind === 'crosshair' || kind === 'trackcross' || kind === 'rec' || kind === 'pricetag') {
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
      if (kind === 'talisman' || kind === 'ribbon') {
        // 예전엔 이 둘도 매 이동마다 완전 무작위 각도를 새로 뽑았는데, 위에 매달린 축(top-center)과
        // 만나면서 실제 마우스 이동과 무관하게 끝부분이 좌우로 튀어 "커서 위치가 이상하다"는
        // 버그로 보였다. 실제 이동 방향(dx)에 비례해 기울여서 손으로 살랑 흔든 것처럼 보이게 한다.
        const dx = e.clientX - lastSwayX;
        cxAngleTarget = Math.max(-15, Math.min(15, dx * 1.6));
        lastSwayX = e.clientX;
      }
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
      if (kind === 'gatering') {
        // hudbracket과 같은 이유로 위치는 wrap에 left/top만 걸고, 회전은 안쪽 점선 링에만
        // CSS 애니메이션으로 건다 — 같은 요소에서 위치이동(JS)과 회전(CSS)이 transform을
        // 두고 충돌하는 걸 피한다.
        if (refs.gatePos.current) { refs.gatePos.current.style.left = `${mx}px`; refs.gatePos.current.style.top = `${my}px`; }
      }
      if (kind === 'trackcross') {
        if (performance.now() - lastReadoutTick > 220) {
          lastReadoutTick = performance.now();
          if (refs.trackReadout.current) refs.trackReadout.current.textContent = `X${Math.round(mx)} Y${Math.round(my)}`;
        }
      }

      const hovered = !!e.target.closest(HOVER_SELECTOR);
      let hoverTarget = cursor;
      if (kind === 'brush') hoverTarget = refs.brushDot.current;
      else if (kind === 'geiger') hoverTarget = refs.geigerVisual.current;
      else if (kind === 'campfire') hoverTarget = refs.campfire.current;
      else if (kind === 'hudbracket') hoverTarget = refs.hudPos.current;
      else if (kind === 'gatering') hoverTarget = refs.gatePos.current;
      if (kind === 'comicstar' || kind === 'talisman' || kind === 'ribbon') cxHover = hovered;
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
      } else if (kind === 'talisman' || kind === 'ribbon') {
        // 위에 매달린 것처럼 상단 중앙을 축으로 살랑거려야 해서 -50%,0으로 정렬한다
        // (다른 커서 대부분이 쓰는 -50%,-50% 중앙 정렬과 다름).
        cx += (mx - cx) * 0.3;
        cy += (my - cy) * 0.3;
        cxAngle += (cxAngleTarget - cxAngle) * 0.08;
        cxAngleTarget *= 0.94; // 마우스가 멈추면 목표각도 자체도 서서히 0으로 가라앉아, 매달린 것처럼 제자리로 돌아온다
        cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, 0) rotate(${cxAngle}deg)`;
      } else if (kind === 'lantern') {
        // 마우스를 따라가는 목표점 대신 sin파를 목표로 lerp해서, 마우스가 멈춰 있어도
        // 초롱불이 계속 잔잔히 흔들리게 한다.
        cx += (mx - cx) * 0.16;
        cy += (my - cy) * 0.16;
        cxAngle += (Math.sin(t / 900) * 8 - cxAngle) * 0.05;
        const bob = Math.sin(t / 480) * 5;
        cursor.style.transform = `translate(${cx}px, ${cy + bob}px) translate(-50%, 0) rotate(${cxAngle}deg)`;
      } else if (kind === 'thinring') {
        cx += (mx - cx) * 0.12;
        cy += (my - cy) * 0.12;
        cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      } else if (kind === 'rec') {
        if (t - lastReadoutTick > 480) {
          lastReadoutTick = t;
          const s = Math.floor((performance.now() - mountTime) / 1000);
          const pad = (n) => String(n).padStart(2, '0');
          if (refs.recTimecode.current) refs.recTimecode.current.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    zone.style.cursor = 'none';
    zone.addEventListener('mouseenter', show);
    zone.addEventListener('mouseleave', hide);
    zone.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(tick);

    if (kind === 'pricetag') {
      // 가격표 스티커가 아주 가끔 순간이동하듯 튄다 — 무서운 게 계속 이어지면 안 무서워서
      // 5~12초 사이 랜덤한 간격으로 딱 한 번씩만 튄다.
      const scheduleJump = () => {
        jumpTimer = setTimeout(() => {
          cursor.classList.add('gt-cursor-glitch-jump');
          setTimeout(() => cursor.classList.remove('gt-cursor-glitch-jump'), 150);
          scheduleJump();
        }, 5000 + Math.random() * 7000);
      };
      scheduleJump();
    }

    return () => {
      zone.style.cursor = '';
      zone.removeEventListener('mouseenter', show);
      zone.removeEventListener('mouseleave', hide);
      zone.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
      clearTimeout(jumpTimer);
    };
    // refs는 useRef로 생성된 안정적인 객체(.current만 바뀜)라 의존성 목록에 넣지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, zoneId]);
}
