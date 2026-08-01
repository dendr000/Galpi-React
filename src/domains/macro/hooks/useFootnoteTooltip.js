// 파일 위치: src/domains/macro/hooks/useFootnoteTooltip.js
// 기능 요약: 
// - 마크다운 텍스트 내에서 파싱된 각주([*내용]) 요소에 대한 전역 마우스 이벤트를 통제하는 커스텀 훅입니다.
// - 특정 요소 호버 시 `document.body` 최상단에 물리적인 Tooltip DOM 노드를 동적으로 생성/부착합니다.
// - 부모 컨테이너의 `overflow: hidden` 제약으로 인해 팝오버가 잘려나가는 현상(Clipping)을 원천 차단합니다.
// - 화면의 가장자리 경계를 인식하여 툴팁의 좌표를 동적으로 조정하는 안전망 로직을 포함하고 있습니다.

import { useEffect } from 'react';

export const useFootnoteTooltip = () => {
  useEffect(() => {
    const handleMouseOver = (e) => {
      const target = e.target.closest('.wiki-footnote');
      if (target) {
        let tooltip = document.getElementById('wiki-footnote-tooltip');
        if (!tooltip) {
          tooltip = document.createElement('div');
          tooltip.id = 'wiki-footnote-tooltip';
          tooltip.style.cssText = "display:none; position:absolute; z-index:999999; background:var(--surface-color); border:2px solid var(--primary-color); border-radius:8px; padding:12px 16px; box-shadow:0 4px 15px rgba(0,0,0,0.2); max-width:300px; font-size:13px; font-weight:normal; line-height:1.6; word-break:keep-all; color:var(--text-primary); pointer-events:none;";
          document.body.appendChild(tooltip);
        }
        tooltip.innerHTML = target.getAttribute('data-content');
        tooltip.style.display = 'block';
        
        const rect = target.getBoundingClientRect();
        const top = rect.bottom + window.scrollY + 8;
        let left = rect.left + window.scrollX - (tooltip.offsetWidth / 2) + (rect.width / 2);
        
        if (left < 10) left = 10;
        if (left + tooltip.offsetWidth > window.innerWidth - 10) left = window.innerWidth - tooltip.offsetWidth - 10;
        
        tooltip.style.top = top + 'px';
        tooltip.style.left = left + 'px';
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target.closest('.wiki-footnote');
      if (target) {
        const tooltip = document.getElementById('wiki-footnote-tooltip');
        if (tooltip) tooltip.style.display = 'none';
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      const tooltip = document.getElementById('wiki-footnote-tooltip');
      if (tooltip) tooltip.remove();
    };
  }, []);
};