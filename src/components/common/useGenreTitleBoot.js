// 파일 위치: src/components/common/useGenreTitleBoot.js
// 기능 요약: cyberpunk-terminal 테마에서 표지 제목(.gt-hero-title)을 부팅 시퀀스처럼
// 한 글자씩 타이핑해서 보여주는 1회성 진입 연출. 이미 렌더링된 제목의 실제 텍스트를
// DOM에서 그대로 읽어 다시 타이핑하므로 WorkCover.jsx는 건드리지 않는다.
// 커서 지속 움직임은 useGenreCursorMotion.js, 클릭 반응은 useGenreClickBurst.js가 맡고
// 여기는 페이지 진입 시 한 번뿐인 텍스트 연출만 다룬다.
import { useEffect } from 'react';

export function useGenreTitleBoot({ theme, zoneId }) {
  useEffect(() => {
    if (theme !== 'cyberpunk-terminal') return;
    const zone = document.getElementById(zoneId);
    const title = zone && zone.querySelector('.gt-hero-title');
    if (!title || title.dataset.gtBooted === '1') return;

    // "booted" 표시와 텍스트 지우기는 실제로 타이핑이 시작되는 순간(타이머 콜백 안)에만
    // 한다 — StrictMode 개발 모드는 이펙트를 마운트→클린업→마운트로 두 번 태우는데,
    // 여기서 바로 플래그를 세워버리면 첫 번째(버려지는) 실행이 플래그만 남기고 텅 빈
    // 제목을 그대로 둔 채 취소되어, 진짜 마운트가 "이미 부팅됨"으로 오판해 아무것도
    // 타이핑하지 않는 채로 끝나버린다.
    const fullText = title.textContent;
    let i = 0;
    let timer;
    let started = false;
    const type = () => {
      if (!started) {
        started = true;
        title.dataset.gtBooted = '1';
        title.textContent = '';
      }
      i++;
      title.textContent = fullText.slice(0, i);
      const caret = document.createElement('span');
      caret.className = 'gt-boot-caret';
      title.appendChild(caret);
      if (i < fullText.length) timer = setTimeout(type, 45 + Math.random() * 40);
    };
    timer = setTimeout(type, 200);

    return () => clearTimeout(timer);
  }, [theme, zoneId]);
}
