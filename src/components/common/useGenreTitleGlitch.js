// 파일 위치: src/components/common/useGenreTitleGlitch.js
// 기능 요약: 괴담 테마들의 "드물고 불규칙해서 더 무서운" 제목 글리치 연출.
// - horror-archive: 4~10초 사이 랜덤 간격으로 반복되는 트래킹 노이즈 글리치.
// - horror-corridor: 진입 2.6초 후 딱 한 번뿐인 0.12초짜리 번짐.
// 계속 번쩍이면 무서운 게 아니라 시끄러워지기만 해서, 둘 다 "가끔 한 번"에 집중한다.
// 실제 글리치 레이어(attr(data-title) 복제)는 CSS(horror-archive.css/horror-corridor.css)가
// 그리고, 여기는 언제 그 클래스를 켰다 끌지 타이밍만 잡는다.
import { useEffect } from 'react';

export function useGenreTitleGlitch({ theme, zoneId }) {
  useEffect(() => {
    if (theme !== 'horror-archive' && theme !== 'horror-corridor') return;
    const zone = document.getElementById(zoneId);
    const title = zone && zone.querySelector('.gt-hero-title');
    if (!title) return;

    let timer;
    if (theme === 'horror-archive') {
      const scheduleGlitch = () => {
        timer = setTimeout(() => {
          title.classList.add('gt-title-glitched');
          setTimeout(() => title.classList.remove('gt-title-glitched'), 400);
          scheduleGlitch();
        }, 4000 + Math.random() * 6000);
      };
      scheduleGlitch();
    } else {
      timer = setTimeout(() => {
        title.classList.add('gt-title-blip');
        setTimeout(() => title.classList.remove('gt-title-blip'), 300);
      }, 2600);
    }

    return () => clearTimeout(timer);
  }, [theme, zoneId]);
}
