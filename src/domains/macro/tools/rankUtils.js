// 파일 위치: src/components/macro/tools/rankUtils.js
// 기능 요약: 스탯 및 게이지 바 등급을 백분율(0~100) 연산 수치로 동적 치환해주는 공통 수학 유틸리티
// 버전: v1.1.0

export const parseRankValue = (valStr) => {
  if (!valStr) return 0;
  const s = String(valStr).toUpperCase().trim();
  
  // 1. 순수 숫자 추출 (예: "9서클", "50%" -> 9, 50 반환)
  const numMatch = s.match(/^-?\d+(\.\d+)?/);
  if (numMatch) return parseFloat(numMatch[0]);
  
  // 2. 특수 최상위 등급 (판타지/가챠 스케일)
  if (s.includes('EX') || s.includes('MAX') || s.includes('GOD')) return 100;
  if (s.includes('UR')) return 98;
  if (s.includes('SSR')) return 95;
  if (s.includes('SR')) return 90;

  // 3. 알파벳 등급 점수화 동적 연산 (A~Z 지원)
  let baseScore = 0;
  const firstChar = s.charAt(0);
  
  if (firstChar === 'S') {
    const sCount = (s.match(/S/g) || []).length;
    if (sCount === 1) baseScore = 80;
    else if (sCount === 2) baseScore = 90;
    else if (sCount >= 3) baseScore = 95;
  } else if (firstChar >= 'A' && firstChar <= 'Z') {
    // A~F는 15 단위로 넓게 분포, G 이하는 1~4 사이의 최하위 점수 부여
    if (firstChar === 'A') baseScore = 65;
    else if (firstChar === 'B') baseScore = 50;
    else if (firstChar === 'C') baseScore = 35;
    else if (firstChar === 'D') baseScore = 20;
    else if (firstChar === 'E') baseScore = 10;
    else if (firstChar === 'F') baseScore = 5;
    else {
      const charCode = firstChar.charCodeAt(0);
      baseScore = Math.max(1, 5 - (charCode - 70)); // G(71)=4, H(72)=3, I(73)=2...
    }
  }
  
  // 4. 기호(+, -)에 따른 미세 조정 (±5점)
  if (s.includes('+')) baseScore += 5;
  if (s.includes('-')) baseScore -= 5;
  
  // 최종 값이 0~100을 벗어나지 않도록 클램핑(Clamping)
  return Math.max(0, Math.min(100, baseScore));
};