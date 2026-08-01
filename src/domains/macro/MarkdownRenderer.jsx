// 파일 위치: src/domains/macro/MarkdownRenderer.jsx
// 기능 요약: 
// - 위키 커스텀 매크로(스탯/연표/관계도/대화/각주) 변환, 문단 트리 번호링 및 접기(Folding) 엔진이 조립된 최종 마크다운 렌더러 컴포넌트입니다.
// - 분리된 비즈니스 훅과 매크로 빌더들을 이곳에서 모두 Import하여 조합하고, 타 컴포넌트에서는 오직 본 파일만 Import하여 사용할 수 있도록 하는 진입점(Barrel Component) 역할을 수행합니다.
// 버전: v1.3.2 (기능별 파일 격리 리팩토링)

import React, { useMemo, useRef } from 'react';
import { marked } from 'marked';
import { parseWikiText } from '../../utils/markdownParser';

// ★ 분리된 매크로 팩토리 및 DOM 컨트롤 훅 임포트
import { 
  createRadarChartHtml, 
  createBarGraphHtml, 
  createTimelineHtml, 
  createRelationGraphHtml, 
  createChatHtml 
} from './utils/macroGenerators';
import { processMarkdownHtml } from './utils/htmlProcessor';
import { useFootnoteTooltip } from './hooks/useFootnoteTooltip';
import { useHeadingFold } from './hooks/useHeadingFold';

const MarkdownRenderer = ({ rawText, onNodeClick, startH1 = 1 }) => {
  const containerRef = useRef(null);

  // 1. 순수 텍스트 -> HTML 치환 연산
  const renderedHtml = useMemo(() => {
    if (!rawText) return "";

    let parsedText = parseWikiText(rawText);
    let rawHtml = marked.parse(parsedText, { breaks: true });

    // 실시간 매크로 예약어 스캔 및 그래픽 위젯 치환
    rawHtml = rawHtml.replace(/(?:<p>)?\[스탯:(.*?)\](?:<\/p>)?/g, (m, p1) => createRadarChartHtml(p1.replace(/<[^>]*>?/gm, ''))); 
    rawHtml = rawHtml.replace(/(?:<p>)?\[게이지:(.*?)\](?:<\/p>)?/g, (m, p1) => createBarGraphHtml(p1.replace(/<[^>]*>?/gm, ''))); 
    rawHtml = rawHtml.replace(/(?:<p>)?\[TIMELINE\]([\s\S]*?)\[\/TIMELINE\](?:<\/p>)?/g, (m, content) => createTimelineHtml(content.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>?/gm, ''))); 
    rawHtml = rawHtml.replace(/(?:<p>)?\[RELATION_GRAPH\]([\s\S]*?)\[\/RELATION_GRAPH\](?:<\/p>)?/g, (m, content) => createRelationGraphHtml(content.replace(/<[^>]*>?/gm, '')));
    rawHtml = rawHtml.replace(/(?:<p>)?\[(대화|우대화):(.*?):\]?([\s\S]*?)\](?:<\/p>)?/g, (m, type, name, msg) => createChatHtml(type, name, msg));

    // 분리된 후처리 엔진(DOMParser 기반 자동 번호 매기기 및 md-box 래핑) 호출
    return processMarkdownHtml(rawHtml, startH1);
  }, [rawText, startH1]);

  // 2. 각주 팝오버 글로벌 툴팁 이벤트 훅 마운트
  useFootnoteTooltip();

  // 3. 나무위키식 문단 접기 엔진 훅 마운트
  useHeadingFold(containerRef, [renderedHtml]);

  if (!rawText) return null;

  return (
    <>
      <style>{`
        /* ★ 하위 문단(H2, H3, H4) 자동 가로 구분선 CSS 주입 */
        .markdown-body h2 {
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 6px;
          margin-bottom: 14px;
          margin-top: 24px;
        }
        .markdown-body h3, .markdown-body h4 {
          border-bottom: 1px dashed var(--border-color);
          padding-bottom: 4px;
          margin-bottom: 12px;
          margin-top: 20px;
        }
        /* 첫 제목 여백 초기화로 레이아웃 어긋남 방지 */
        .markdown-body h2:first-child, .markdown-body h3:first-child {
          margin-top: 0;
        }
      `}</style>

      <div 
        ref={containerRef}
        className="markdown-body" 
        dangerouslySetInnerHTML={{ __html: renderedHtml }} 
        onClick={(e) => {
          if (e.target.classList.contains('wiki-backlink') && onNodeClick) {
            onNodeClick(e.target.innerText);
          }
        }}
      />
    </>
  );
};

export default MarkdownRenderer;