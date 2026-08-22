// 파일 위치: src/domains/work/genreTheme.js
// 작품 분류(genre) 문자열을 보고, 순환 가능한 테마 후보 목록을 만들고 최종 적용 테마를 판별한다.
// 테마는 CSS에서 [data-genre-theme="..."] 속성 선택자로 소비된다.
// 작가가 GNB 팔레트 버튼으로 직접 고른 테마(themeOverride)가 있으면 장르 자동 추천보다 우선한다.
import api from '../../api/axiosCore';
import { extractMeta, buildMetaStr } from '../../utils/markdownParser';

// 분류 키워드 그룹 → 그 키워드가 하나라도 있으면 순환 후보에 들어가는 테마 값 목록.
// 새 테마를 실제로 구현하면 여기 themes 배열에 한 줄만 추가하면 팔레트 순환에 자동으로 들어간다.
const GENRE_THEME_GROUPS = [
  { keywords: ['무협', '무림', '강호'], themes: ['wuxia', 'wuxia-ink', 'wuxia-blood', 'wuxia-ascend'] },
  { keywords: ['사이버펑크', '사펑', 'SF'], themes: ['cyberpunk-neon', 'cyberpunk-terminal', 'cyberpunk-graffiti'] },
];

export const THEME_LABELS = {
  auto: '자동(분류 추천)',
  wuxia: '무협 · 묵향',
  'wuxia-ink': '무협 · 묵화',
  'wuxia-blood': '무협 · 혈로',
  'wuxia-ascend': '무협 · 등선',
  'cyberpunk-neon': '사이버펑크 · 네온 메가시티',
  'cyberpunk-terminal': '사이버펑크 · 터미널 해커',
  'cyberpunk-graffiti': '사이버펑크 · 크롬 그래피티',
};

// 이 작품 분류에서 순환 가능한 테마 값 목록 ('auto' 포함, 매칭 없으면 빈 배열)
export const getThemeCycle = (genreString) => {
  if (!genreString) return [];
  const tags = genreString.split(',').map(g => g.trim()).filter(Boolean);
  const matched = [];
  GENRE_THEME_GROUPS.forEach(group => {
    if (tags.some(tag => group.keywords.includes(tag))) matched.push(...group.themes);
  });
  if (matched.length === 0) return [];
  return ['auto', ...matched];
};

// 장르만으로 자동 추천되는 테마 (그룹의 첫 번째 테마)
export const detectGenreTheme = (genreString) => {
  const cycle = getThemeCycle(genreString);
  return cycle.length > 1 ? cycle[1] : null;
};

// 최종적으로 적용할 테마: 수동 지정(override)이 있으면 그걸 쓰고, 없거나 'auto'면 장르 추천값을 쓴다.
export const resolveGenreTheme = (genreString, override) => {
  if (override && override !== 'auto') return override;
  return detectGenreTheme(genreString);
};

// GNB 팔레트 버튼용: 현재 work의 분류에서 순환 가능한 다음 테마로 넘기고 서버에 저장까지 한다.
// 순환 후보가 없으면 null을 반환(호출 측에서 "이 작품엔 테마가 없음" 안내용으로 사용).
export const cycleWorkTheme = async (work) => {
  const cycle = getThemeCycle(work.genre);
  if (cycle.length === 0) return null;

  const parsed = extractMeta(work.description || '');
  const current = parsed.meta.themeOverride || 'auto';
  const idx = cycle.indexOf(current);
  const next = cycle[(idx === -1 ? 0 : idx + 1) % cycle.length];

  const newMeta = { ...parsed.meta };
  if (next === 'auto') delete newMeta.themeOverride;
  else newMeta.themeOverride = next;
  const newDescription = buildMetaStr(parsed.clean, newMeta);

  await api.put(`/api/works/${work.id}`, { ...work, description: newDescription });
  return { theme: next, description: newDescription };
};
