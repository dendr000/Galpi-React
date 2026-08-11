// 파일 위치: src/pages/Home/components/HomeIcons.jsx
// 기능 요약: 메인 대시보드의 그리드/리스트 뷰어 스위칭에 사용되는 전용 벡터 아이콘 컴포넌트
import React from 'react';

export const IconViewGrid = ({ size = 16, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

export const IconViewSmall = ({ size = 16, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="4" height="4"></rect>
    <rect x="10" y="3" width="4" height="4"></rect>
    <rect x="17" y="3" width="4" height="4"></rect>
    <rect x="3" y="10" width="4" height="4"></rect>
    <rect x="10" y="10" width="4" height="4"></rect>
    <rect x="17" y="10" width="4" height="4"></rect>
    <rect x="3" y="17" width="4" height="4"></rect>
    <rect x="10" y="17" width="4" height="4"></rect>
    <rect x="17" y="17" width="4" height="4"></rect>
  </svg>
);

export const IconViewList = ({ size = 16, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);