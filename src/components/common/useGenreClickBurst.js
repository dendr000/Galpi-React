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

const BURST_KINDS = new Set([
  'comicstar', 'hudbracket', 'beacon', 'gatering', 'trackcross', 'talisman', 'ribbon', 'lantern', 'rec', 'pricetag', 'thinring',
  'reticle', 'block', 'chroma', 'brush', 'blade', 'orb', 'geiger', 'crosshair', 'campfire'
]);
// ★ 클릭할 때마다 배열에서 하나 뽑아 보여주기만 하므로(Math.random 인덱싱은 배열 길이와
// 무관하게 O(1)), 목록을 아무리 늘려도 느려지지 않는다 — 다양성을 위해 테마별로 크게 늘렸다.
const GATE_EXP_WORDS = [
  '+12 EXP', '+8 EXP', '+15 EXP', '+20 EXP', '+5 EXP', '+30 EXP', '+3 EXP',
  'LEVEL UP!', 'CRITICAL!', 'RANK UP!',
  '+1 GOLD', '+50 GOLD', '+100 GOLD',
  '아이템 획득', '스킬 습득', '칭호 획득', '던전 클리어',
  'S급 반응', '균열 감지', '몬스터 조우', '각성 감지'
];
const TALISMAN_GLYPHS = ['令', '符', '封', '鎭', '呪', '靈', '護', '退', '邪', '福', '安', '氣', '淨', '陣', '焰', '破'];
const RIBBON_WISHES = [
  '願', '福', '安', '幸',
  '무사히', '평안하길', '건강하길', '행복하길',
  '만사형통', '액운 소멸', '무탈하길', '이루어지길', '은혜롭길', '살펴주소서'
];
const LANTERN_WORDS = ['路', '燈', '引', '光', '明', '照', '夜', '途', '導', '影', '火', '歸'];
const RECEIPT_NORMAL = [
  '삼각김밥 x1', '커피 x1', '컵라면 x1', '담배 x1', '생수 x2', '초코바 x1',
  '핫바 x1', '아이스크림 x1', '건전지 x2', '맥주 x4', '냉동만두 x1', '즉석밥 x2', '우산 x1', '라이터 x1'
];
const RECEIPT_WEIRD = [
  '???  x1', '재고 없음 (계산됨)', '반품 불가', '교환 불가', '가격: ￦0', '수량: -1',
  '유통기한: ----', '이 거래는 취소할 수 없음', '고객님의 것 x1', '존재하지 않는 상품', '각인됨', '포인트 전액 차감'
];
const TERMINAL_COMMANDS = ['> ACCESS_GRANTED', '> EXEC ./run.sh', '> PING 0ms', '> ROOT 획득', '> 방화벽 우회', '> 로그 삭제됨', '> 연결 확인', '> DECRYPT...OK'];
const GEIGER_TICKS = ['TICK', 'TICK··TICK', '수치 상승', '피폭 주의', '위험 감지', '방사능 검출'];
const INFECT_TAGS = ['감염 확인', '격리 필요', 'SAMPLE +1', '이상 반응', '병원체 검출', '접촉 기록됨'];
const CAMP_CRACKLES = ['타닥', '타닥타닥', '지직', '화르륵'];

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

    const burstGate = (x, y) => {
      const el = document.createElement('div');
      el.className = 'gt-burst-gate';
      el.style.left = `${x}px`; el.style.top = `${y}px`;
      const word = GATE_EXP_WORDS[Math.floor(Math.random() * GATE_EXP_WORDS.length)];
      el.innerHTML = `<div class="ring1"></div><div class="ring2"></div><div class="exp">${word}</div>`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 850);
    };

    const burstScan = (x, y) => {
      const ring = document.createElement('div');
      ring.className = 'gt-burst-scan-ring';
      ring.style.left = `${x}px`; ring.style.top = `${y}px`;
      document.body.appendChild(ring);
      setTimeout(() => ring.remove(), 800);

      const tag = document.createElement('div');
      tag.className = 'gt-burst-scan-tag';
      tag.textContent = '감지됨';
      tag.style.left = `${x}px`; tag.style.top = `${y}px`;
      document.body.appendChild(tag);
      setTimeout(() => tag.remove(), 850);
    };

    const burstTalisman = (x, y) => {
      const el = document.createElement('div');
      el.className = 'gt-burst-talisman';
      el.style.left = `${x}px`; el.style.top = `${y}px`;
      const glyph = TALISMAN_GLYPHS[Math.floor(Math.random() * TALISMAN_GLYPHS.length)];
      el.innerHTML = `<div class="ring"></div><div class="glyph">${glyph}</div>`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 650);
    };

    const burstRibbon = (x, y) => {
      const el = document.createElement('div');
      el.className = 'gt-burst-ribbon';
      el.style.left = `${x}px`; el.style.top = `${y}px`;
      const wish = RIBBON_WISHES[Math.floor(Math.random() * RIBBON_WISHES.length)];
      el.innerHTML = `<div class="chime"></div><div class="wish">${wish}</div>`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 950);
    };

    const burstLantern = (x, y) => {
      const el = document.createElement('div');
      el.className = 'gt-burst-lantern';
      el.style.left = `${x}px`; el.style.top = `${y}px`;
      const word = LANTERN_WORDS[Math.floor(Math.random() * LANTERN_WORDS.length)];
      el.innerHTML = `<div class="glow"></div><div class="word">${word}</div>`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1150);
    };

    const burstRec = (x, y) => {
      const el = document.createElement('div');
      el.className = 'gt-burst-rec';
      el.style.left = `${x}px`; el.style.top = `${y}px`;
      const num = 4000 + Math.floor(Math.random() * 900);
      el.innerHTML = `<div class="stamp">사건 #${num} 기록됨</div>`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 700);
    };

    const burstReceipt = (x, y) => {
      const el = document.createElement('div');
      el.className = 'gt-burst-receipt';
      el.style.left = `${x}px`; el.style.top = `${y}px`;
      const useWeird = Math.random() < 0.3;
      const item = useWeird
        ? RECEIPT_WEIRD[Math.floor(Math.random() * RECEIPT_WEIRD.length)]
        : RECEIPT_NORMAL[Math.floor(Math.random() * RECEIPT_NORMAL.length)];
      el.textContent = item;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 950);
    };

    // 사이버펑크 · 네온 메가시티 — 조준 브래킷 4개가 클릭 지점으로 스냅되며 스캔선이 스친다
    const burstReticle = (x, y) => {
      const el = document.createElement('div');
      el.className = 'gt-burst-reticle';
      el.style.left = `${x}px`; el.style.top = `${y}px`;
      el.innerHTML = '<div class="corner c1"></div><div class="corner c2"></div><div class="corner c3"></div><div class="corner c4"></div>';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 500);

      const scan = document.createElement('div');
      scan.className = 'gt-burst-reticle-scan';
      scan.style.left = `${x}px`; scan.style.top = `${y}px`;
      document.body.appendChild(scan);
      setTimeout(() => scan.remove(), 400);
    };

    // 사이버펑크 · 터미널 해커 — 클릭한 자리에 터미널 명령어가 짧게 떴다 사라진다
    const burstTerminal = (x, y) => {
      const el = document.createElement('div');
      el.className = 'gt-burst-terminal';
      el.style.left = `${x}px`; el.style.top = `${y}px`;
      el.textContent = TERMINAL_COMMANDS[Math.floor(Math.random() * TERMINAL_COMMANDS.length)];
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 750);
    };

    // 사이버펑크 · 크롬 그래피티 — 색수차 링 + 스프레이 방울이 사방으로 튄다
    const burstChroma = (x, y) => {
      const el = document.createElement('div');
      el.className = 'gt-burst-chroma';
      el.style.left = `${x}px`; el.style.top = `${y}px`;
      el.innerHTML = '<div class="ring r"></div><div class="ring c"></div>';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 500);

      const colors = ['#ff1f3d', '#2be0ff', '#f5f5f5'];
      for (let i = 0; i < 7; i++) {
        const drip = document.createElement('div');
        drip.className = 'gt-burst-chroma-drip';
        drip.style.left = `${x}px`; drip.style.top = `${y}px`;
        drip.style.background = colors[i % colors.length];
        const ang = Math.random() * Math.PI * 2;
        const dist = 18 + Math.random() * 26;
        drip.style.setProperty('--tx', `${Math.cos(ang) * dist}px`);
        drip.style.setProperty('--ty', `${Math.sin(ang) * dist}px`);
        document.body.appendChild(drip);
        setTimeout(() => drip.remove(), 550);
      }
    };

    // 무협 · 묵화 — 붓을 튕긴 듯 먹방울이 튀고 짧은 획이 스친다
    const burstInk = (x, y) => {
      const stroke = document.createElement('div');
      stroke.className = 'gt-burst-ink-stroke';
      stroke.style.left = `${x}px`; stroke.style.top = `${y}px`;
      stroke.style.setProperty('--rot', `${Math.random() * 60 - 30}deg`);
      document.body.appendChild(stroke);
      setTimeout(() => stroke.remove(), 500);

      for (let i = 0; i < 5; i++) {
        const drop = document.createElement('div');
        drop.className = 'gt-burst-ink-drop';
        const size = 3 + Math.random() * 4;
        drop.style.width = `${size}px`; drop.style.height = `${size}px`;
        drop.style.left = `${x}px`; drop.style.top = `${y}px`;
        const ang = Math.random() * Math.PI * 2;
        const dist = 10 + Math.random() * 22;
        drop.style.setProperty('--tx', `${Math.cos(ang) * dist}px`);
        drop.style.setProperty('--ty', `${Math.sin(ang) * dist}px`);
        document.body.appendChild(drop);
        setTimeout(() => drop.remove(), 600);
      }
    };

    // 무협 · 혈로 — 붉은 충격 링과 함께 짧고 굵은 일격의 궤적이 스친다
    const burstBlade = (x, y) => {
      const ring = document.createElement('div');
      ring.className = 'gt-burst-blade-ring';
      ring.style.left = `${x}px`; ring.style.top = `${y}px`;
      document.body.appendChild(ring);
      setTimeout(() => ring.remove(), 450);

      const cut = document.createElement('div');
      cut.className = 'gt-burst-blade-cut';
      cut.style.left = `${x}px`; cut.style.top = `${y}px`;
      cut.style.setProperty('--rot', `${Math.random() * 50 - 25}deg`);
      document.body.appendChild(cut);
      setTimeout(() => cut.remove(), 400);
    };

    // 무협 · 등선 — 영기 파동 링이 퍼지고 잔알갱이가 사방으로 흩어진다
    const burstOrb = (x, y) => {
      const ring = document.createElement('div');
      ring.className = 'gt-burst-orb-ring';
      ring.style.left = `${x}px`; ring.style.top = `${y}px`;
      document.body.appendChild(ring);
      setTimeout(() => ring.remove(), 700);

      for (let i = 0; i < 8; i++) {
        const mote = document.createElement('div');
        mote.className = 'gt-burst-orb-mote';
        const size = 3 + Math.random() * 3;
        mote.style.width = `${size}px`; mote.style.height = `${size}px`;
        mote.style.left = `${x}px`; mote.style.top = `${y}px`;
        const ang = (Math.PI * 2 * i) / 8 + Math.random() * 0.4;
        const dist = 20 + Math.random() * 26;
        mote.style.setProperty('--tx', `${Math.cos(ang) * dist}px`);
        mote.style.setProperty('--ty', `${Math.sin(ang) * dist}px`);
        document.body.appendChild(mote);
        setTimeout(() => mote.remove(), 650);
      }
    };

    // 아포칼립스 · 핵진 — 계기판 링이 튀며 방사능 수치 텍스트가 짧게 표시된다
    const burstGeiger = (x, y) => {
      const ring = document.createElement('div');
      ring.className = 'gt-burst-geiger-ring';
      ring.style.left = `${x}px`; ring.style.top = `${y}px`;
      document.body.appendChild(ring);
      setTimeout(() => ring.remove(), 550);

      const tick = document.createElement('div');
      tick.className = 'gt-burst-geiger-tick';
      tick.style.left = `${x}px`; tick.style.top = `${y}px`;
      tick.textContent = GEIGER_TICKS[Math.floor(Math.random() * GEIGER_TICKS.length)];
      document.body.appendChild(tick);
      setTimeout(() => tick.remove(), 700);
    };

    // 아포칼립스 · 역병 — 얼룩이 번지듯 퍼지며 감염/오염 관련 태그가 뜬다
    const burstInfect = (x, y) => {
      const blot = document.createElement('div');
      blot.className = 'gt-burst-infect-blot';
      blot.style.left = `${x}px`; blot.style.top = `${y}px`;
      document.body.appendChild(blot);
      setTimeout(() => blot.remove(), 700);

      const tag = document.createElement('div');
      tag.className = 'gt-burst-infect-tag';
      tag.style.left = `${x}px`; tag.style.top = `${y}px`;
      tag.textContent = INFECT_TAGS[Math.floor(Math.random() * INFECT_TAGS.length)];
      document.body.appendChild(tag);
      setTimeout(() => tag.remove(), 750);
    };

    // 아포칼립스 · 잔불 — 불씨가 사방으로 튀고 타는 소리 의성어가 잠깐 떠오른다
    const burstCamp = (x, y) => {
      for (let i = 0; i < 6; i++) {
        const spark = document.createElement('div');
        spark.className = 'gt-burst-camp-spark';
        const size = 2 + Math.random() * 3;
        spark.style.width = `${size}px`; spark.style.height = `${size}px`;
        spark.style.left = `${x}px`; spark.style.top = `${y}px`;
        const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2;
        const dist = 14 + Math.random() * 24;
        spark.style.setProperty('--tx', `${Math.cos(ang) * dist}px`);
        spark.style.setProperty('--ty', `${Math.sin(ang) * dist}px`);
        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), 550);
      }

      const word = document.createElement('div');
      word.className = 'gt-burst-camp-word';
      word.style.left = `${x}px`; word.style.top = `${y}px`;
      word.textContent = CAMP_CRACKLES[Math.floor(Math.random() * CAMP_CRACKLES.length)];
      document.body.appendChild(word);
      setTimeout(() => word.remove(), 700);
    };

    const noticeZone = () => {
      zone.classList.remove('gt-zone-notice');
      void zone.offsetWidth;
      zone.classList.add('gt-zone-notice');
    };

    const onClick = (e) => {
      if (kind === 'comicstar') burstComic(e.clientX, e.clientY);
      else if (kind === 'hudbracket') surgeHud(e.clientX, e.clientY);
      else if (kind === 'beacon') burstUrban(e.clientX, e.clientY);
      else if (kind === 'gatering') burstGate(e.clientX, e.clientY);
      else if (kind === 'trackcross') burstScan(e.clientX, e.clientY);
      else if (kind === 'talisman') burstTalisman(e.clientX, e.clientY);
      else if (kind === 'ribbon') burstRibbon(e.clientX, e.clientY);
      else if (kind === 'lantern') burstLantern(e.clientX, e.clientY);
      else if (kind === 'rec') burstRec(e.clientX, e.clientY);
      else if (kind === 'pricetag') burstReceipt(e.clientX, e.clientY);
      else if (kind === 'thinring') noticeZone();
      else if (kind === 'reticle') burstReticle(e.clientX, e.clientY);
      else if (kind === 'block') burstTerminal(e.clientX, e.clientY);
      else if (kind === 'chroma') burstChroma(e.clientX, e.clientY);
      else if (kind === 'brush') burstInk(e.clientX, e.clientY);
      else if (kind === 'blade') burstBlade(e.clientX, e.clientY);
      else if (kind === 'orb') burstOrb(e.clientX, e.clientY);
      else if (kind === 'geiger') burstGeiger(e.clientX, e.clientY);
      else if (kind === 'crosshair') burstInfect(e.clientX, e.clientY);
      else if (kind === 'campfire') burstCamp(e.clientX, e.clientY);
    };

    zone.addEventListener('click', onClick);
    return () => zone.removeEventListener('click', onClick);
  }, [kind, zoneId]);
}
