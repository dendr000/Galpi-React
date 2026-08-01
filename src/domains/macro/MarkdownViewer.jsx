// 파일 위치: src/components/macro/viewer/MarkdownViewer.jsx
// 기능 요약: marked 라이브러리를 거친 마크다운 정제 구문을 리액트 배열 요소 트리에 격리 바인딩하고, 특수 대형 매크로 태그들을 실시간 탐색하여 리액트 전용 서브 뷰어 컴포넌트 객체들로 치환 렌더링하는 토큰 코어 통제기
// 버전: v2.5.1

import React, { useEffect } from 'react';
import { parseWikiText } from '../../utils/markdownParser'; // 기존의 인라인 서식 파서 모듈 재사용
import RadarChartViewer from './RadarChartViewer';
import BarGraphViewer from './BarGraphViewer';
import TimelineViewer from './TimelineViewer';

// 글로벌 마크다운 공통 레이아웃 스타일 가동용 훅
const useMacroStyles = () => {
  useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById('galpi-macro-styles')) return;
    console.log("[MarkdownViewer] 전역 마크다운 매크로 박스 테마 CSS 룰셋 세션 인젝션 집행");
    const style = document.createElement('style');
    style.id = 'galpi-macro-styles';
    style.innerHTML = `
        .md-box { background: var(--surface-color); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 12px; }
        .md-h1 { color: var(--primary-color); border-bottom: 2px solid var(--border-color); padding-bottom: 6px; margin-top: 24px; margin-bottom: 14px; font-size: 20px; font-weight: 900; }
    `;
    document.head.appendChild(style);
  }, []);
};

// 각주 팝오버 글로벌 툴팁 이벤트 훅
const useFootnoteTooltip = () => {
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

const MarkdownViewer = ({ text }) => {
  console.log("[MarkdownViewer] 마크다운 변환 및 리액트 컴포넌트 분기 파이프라인 세션 시작");
  useMacroStyles();
  useFootnoteTooltip(); // 각주 툴팁 훅 마운트

  if (!text) {
    console.log("[MarkdownViewer] 본문 텍스트가 부재하여 빈 노드를 출력합니다.");
    return <div className="md-box" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>본문 내용이 존재하지 않습니다.</div>;
  }

  // 1단계: 기존의 고유명사 폰트, 색상, 백링크 및 표/인용구 위키 마스터 치환 함수 가동
  let parsedWiki = parseWikiText(text);

  // 1.5단계: 누락된 대화/우대화 매크로 정규식 치환 복구
  parsedWiki = parsedWiki.replace(/\[(대화|우대화):(.*?):\]?([\s\S]*?)\]/g, (m, type, name, msg) => {
      const isRight = type === '우대화';
      const alignClass = isRight ? 'right' : '';
      return `<div class="galpi-ext-chat-room"><div class="galpi-ext-msg ${alignClass}"><div class="galpi-ext-msg-name">${name.trim()}</div><div class="galpi-ext-msg-bubble">${msg.trim().replace(/\n/g, '<br>')}</div></div></div>`;
  });

  // 2단계: 정규식 경계를 활용하여 스트링 덩어리와 특수 대형 매크로 블록 구역을 토큰 패턴으로 쪼갬
  console.log("[MarkdownViewer] 정규식 패턴 라인 스플릿 및 컴포넌트 토큰화 연산 집행");
  const tokenRegex = /(\[스탯:.*?\]|\[게이지:.*?\]|\[TIMELINE\][\s\S]*?\[\/TIMELINE\])/g;
  const tokens = parsedWiki.split(tokenRegex);

  // 3단계: 맵 루프를 순회하며 일반 문자열은 dangerouslySetInnerHTML 블록으로, 매크로는 순수 리액트 서브 뷰어 컴포넌트로 개별 격리 인스턴스화
  return (
    <div className="galpi-markdown-renderer-root" style={{ width: '100%', fontFamily: 'inherit' }}>
      {tokens.map((token, index) => {
        if (!token) return null;

        // A. 방사형 스탯 차트 매크로 차단 매핑 구역
        if (token.startsWith('[스탯:')) {
          const innerData = token.substring(4, token.length - 1);
          console.log(`[MarkdownViewer] 토큰 #${index} 레이더 차트 컴포넌트 치환 매핑 적중`);
          return <RadarChartViewer key={index} dataStr={innerData} />;
        }

        // B. 상태창 게이지 바 매크로 차단 매핑 구역
        if (token.startsWith('[게이지:')) {
          const innerData = token.substring(5, token.length - 1);
          console.log(`[MarkdownViewer] 토큰 #${index} 게이지 바 컴포넌트 치환 매핑 적중`);
          return <BarGraphViewer key={index} dataStr={innerData} />;
        }

        // C. 역사 타임라인 매크로 블록 차단 매핑 구역
        if (token.startsWith('[TIMELINE]')) {
          const innerData = token.replace(/\[\/?TIMELINE\]/g, '');
          console.log(`[MarkdownViewer] 토큰 #${index} 타임라인 연표 컴포넌트 치환 매핑 적중`);
          return <TimelineViewer key={index} innerText={innerData} />;
        }

        // D. 일반 마크다운 정제 텍스트 노드는 단일 박스 컨테이너 안에서 안전하게 삽입 출력
        console.log(`[MarkdownViewer] 토큰 #${index} 일반 위키 마크다운 텍스트 블록 렌더링`);
        return (
          <div 
            key={index} 
            className="md-box"
            style={{ color: 'var(--text-primary)', fontSize: '14px', lineHeight: '1.7', wordBreak: 'break-all' }}
            dangerouslySetInnerHTML={{ __html: token }} 
          />
        );
      })}
    </div>
  );
};

export default MarkdownViewer;