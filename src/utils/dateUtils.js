// 파일 위치: src/utils/dateUtils.js
// 기능 요약: 타임스탬프를 상대적 시간(방금 전, 5분 전, 어제 등)으로 변환하는 범용 유틸리티

export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return "";
  
  const now = new Date();
  const target = new Date(timestamp);
  const diffMs = now - target;
  
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay === 1) return "어제";
  if (diffDay < 7) return `${diffDay}일 전`;

  // 7일 이상 경과 시 기존 연/월/일 포맷으로 렌더링
  return target.toLocaleDateString('ko-KR');
};