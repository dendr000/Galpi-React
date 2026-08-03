// 파일 위치: src/components/macro/viewer/MarkdownViewer.jsx
// 기능 요약: 특수 대형 매크로 태그들을 실시간 탐색하여 리액트 전용 서브 뷰어 컴포넌트들(스탯, 비교, 성향, 탭, 스포일러 등)로 치환 렌더링하는 토큰 코어 통제기
// 버전: v2.6.0 (스포일러, 아바타 챗버블, 스탯비교, 성향 매트릭스, 탭 뷰어 지원)

import React, { useEffect } from 'react';
import { parseWikiText } from '../../utils/markdownParser'; 
import RadarChartViewer from './RadarChartViewer';
import RadarCompareViewer from './RadarCompareViewer';
import BarGraphViewer from './BarGraphViewer';
import TimelineViewer from './TimelineViewer';
import AlignmentViewer from './AlignmentViewer';
import TabViewer from './TabViewer';
import { createChatHtml, createSpoilerHtml } from '../../domains/macro/utils/macroGenerators';

const useMacroStyles = () => {
  useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById('galpi-macro-styles')) return;
    const style = document.createElement('style');
    style.id = 'galpi-macro-styles';
    style.innerHTML = `
        .md-box { background: var(--surface-color); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 12px; }
        .md-h1 { color: var(--primary-color); border-bottom: 2px solid var(--border-color); padding-bottom: 6px; margin-top: 24px; margin-bottom: 14px; font-size: 20px; font-weight: 900; }
        .galpi-spoiler { background-color: #111; color: #111; cursor: pointer; padding: 2px 6px; border-radius: 4px; font-weight: bold; transition: color 0.3s ease; }
        .galpi-spoiler:hover { color: #fff; }
    `;
    document.head.appendChild(style);
  }, []);
};

const useFootnoteTooltip = () => {
  // (기존 툴팁 훅 로직 100% 동일 유지)
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
  console.log("[MarkdownViewer] 확장 매크로(스포일러, 아바타 챗, 탭뷰어 포함) 토큰 변환 파이프라인 세션 시작");
  useMacroStyles();
  useFootnoteTooltip(); 

  if (!text) {
    return <div className="md-box" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>본문 내용이 존재하지 않습니다.</div>;
  }

  // 1단계: 기존 파서 가동
  let parsedWiki = parseWikiText(text);

  // 1.5단계: 인라인 텍스트 매크로(대화방 초상화 연동 및 스포일러 블록) 정규식 치환 복구
  parsedWiki = parsedWiki.replace(/\[(대화|우대화):\s*(.*?)(?:\((.*?)\))?:\s*\]?([\s\S]*?)\[\/(?:대화|우대화)\]/g, (m, type, name, expr, msg) => {
      return createChatHtml(type, name, expr, msg);
  });
  
  parsedWiki = parsedWiki.replace(/\[스포일러\]([\s\S]*?)\[\/스포일러\]/g, (m, content) => {
      return createSpoilerHtml(content);
  });

  // 2단계: 대형 React 컴포넌트용 토큰 스플릿 (스탯비교, 성향, 탭 레이아웃 추가)
  const tokenRegex = /(\[스탯:.*?\]|\[스탯비교:.*?\]|\[게이지:.*?\]|\[성향:.*?\]|\[TIMELINE\][\s\S]*?\[\/TIMELINE\]|\[TAB:.*?\][\s\S]*?\[\/TAB\])/g;
  const tokens = parsedWiki.split(tokenRegex);

  // 3단계: 토큰 순회 및 컴포넌트 격리 바인딩
  return (
    <div className="galpi-markdown-renderer-root" style={{ width: '100%', fontFamily: 'inherit' }}>
      {tokens.map((token, index) => {
        if (!token) return null;

        if (token.startsWith('[스탯:')) {
          const innerData = token.substring(4, token.length - 1);
          return <RadarChartViewer key={index} dataStr={innerData} />;
        }
        
        if (token.startsWith('[스탯비교:')) {
          const innerData = token.substring(6, token.length - 1);
          return <RadarCompareViewer key={index} dataStr={innerData} />;
        }

        if (token.startsWith('[게이지:')) {
          const innerData = token.substring(5, token.length - 1);
          return <BarGraphViewer key={index} dataStr={innerData} />;
        }
        
        if (token.startsWith('[성향:')) {
          const innerData = token.substring(4, token.length - 1);
          return <AlignmentViewer key={index} dataStr={innerData} />;
        }

        if (token.startsWith('[TIMELINE]')) {
          const innerData = token.replace(/\[\/?TIMELINE\]/g, '');
          return <TimelineViewer key={index} innerText={innerData} />;
        }

        if (token.startsWith('[TAB:')) {
          // 전체 블록을 TabViewer로 전송
          return <TabViewer key={index} innerText={token} />;
        }

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