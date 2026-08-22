// 파일 위치: src/components/common/useGenreClickBurst.js
// 기능 요약: 히어로 계열 테마에서 영역(zoneId) 안을 클릭할 때 터지는 1회성 이펙트
// (코믹스 팝아트의 "펑!" 스타, HUD의 파워 서지, 도심 히어로의 카메라 플래시+물웅덩이
// 파문)를 담당한다. 커서 자체의 지속적인 움직임은 useGenreCursorMotion.js가 맡고,
// 여기는 클릭이라는 1회성 이벤트에 대한 반응만 다룬다.
// 생성한 요소는 전부 document.body에 position:fixed로 붙였다가 애니메이션이 끝나면
// 스스로 제거한다 — 실제 드래그(캐릭터 카드 순서 변경)가 일어난 경우, 브라우저는
// mousedown→drag→mouseup 시퀀스에서 click을 합성하지 않으므로 이 리스너가 개입할
// 일이 없다.
import { useEffect } from 'react';

const BURST_KINDS = new Set(['comicstar', 'hudbracket', 'beacon']);

export function useGenreClickBurst({ kind, zoneId }) {
  useEffect(() => {
    if (!BURST_KINDS.has(kind)) return;
    const zone = document.getElementById(zoneId);
    if (!zone) return;

    const burstComic = (x, y) => {
      const el = document.createElement('div');
      el.className = 'gt-burst-comic';
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.innerHTML = '<svg viewBox="0 0 100 100"><polygon points="50,2 61,35 96,35 68,56 79,90 50,70 21,90 32,56 4,35 39,35" fill="#ffd400" stroke="#141110" stroke-width="4"/></svg>';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 700);
      zone.classList.remove('gt-zone-shake');
      void zone.offsetWidth;
      zone.classList.add('gt-zone-shake');
    };

    const surgeHud = (x, y) => {
      const r1 = document.createElement('div');
      r1.className = 'gt-surge-hud';
      r1.style.left = `${x}px`; r1.style.top = `${y}px`; r1.style.color = '#4ff0ff';
      document.body.appendChild(r1);
      const r2 = document.createElement('div');
      r2.className = 'gt-surge-hud ring2';
      r2.style.left = `${x}px`; r2.style.top = `${y}px`; r2.style.color = '#ff4fd8';
      document.body.appendChild(r2);
      setTimeout(() => { r1.remove(); r2.remove(); }, 900);
    };

    const burstUrban = (x, y) => {
      const flash = document.createElement('div');
      flash.className = 'gt-flash-urban';
      document.body.appendChild(flash);
      setTimeout(() => flash.remove(), 400);

      const ripple = document.createElement('div');
      ripple.className = 'gt-ripple-urban';
      ripple.style.left = `${x}px`; ripple.style.top = `${y}px`;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 850);

      for (let i = 0; i < 6; i++) {
        const drop = document.createElement('div');
        drop.className = 'gt-drop-urban';
        drop.style.left = `${x}px`; drop.style.top = `${y}px`;
        const ang = Math.random() * Math.PI * 2;
        const dist = 20 + Math.random() * 30;
        drop.style.setProperty('--tx', `${Math.cos(ang) * dist}px`);
        drop.style.setProperty('--ty', `${Math.sin(ang) * dist}px`);
        document.body.appendChild(drop);
        setTimeout(() => drop.remove(), 550);
      }
    };

    const onClick = (e) => {
      if (kind === 'comicstar') burstComic(e.clientX, e.clientY);
      else if (kind === 'hudbracket') surgeHud(e.clientX, e.clientY);
      else if (kind === 'beacon') burstUrban(e.clientX, e.clientY);
    };

    zone.addEventListener('click', onClick);
    return () => zone.removeEventListener('click', onClick);
  }, [kind, zoneId]);
}
