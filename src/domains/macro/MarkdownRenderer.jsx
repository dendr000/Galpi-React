// 파일 위치: src/domains/macro/MarkdownRenderer.jsx
// 기능 요약: 위키 커스텀 매크로(스포일러, 대화 초상화, 스탯 비교, 성향 매트릭스, 탭 등 신규 5종 포함)를 순수 HTML로 파싱하고 DOM 컨트롤 훅을 래핑하는 최종 렌더러
// 버전: v1.4.0 (다중 확장 매크로 통합 파이프라인 대응)

import React, { useMemo, useRef } from 'react';
import { marked } from 'marked';
import { parseWikiText } from '../../utils/markdownParser';

import { 
  createRadarChartHtml, 
  createRadarCompareHtml,
  createBarGraphHtml, 
  createTimelineHtml, 
  createRelationGraphHtml, 
  createChatHtml,
  createSpoilerHtml,
  createAlignmentChartHtml,
  createTabHtml
} from './utils/macroGenerators';
import { processMarkdownHtml } from './utils/htmlProcessor';
import { useFootnoteTooltip } from './hooks/useFootnoteTooltip';
import { useHeadingFold } from './hooks/useHeadingFold';

const MarkdownRenderer = ({ rawText, onNodeClick, startH1 = 1 }) => {
  const containerRef = useRef(null);

  const renderedHtml = useMemo(() => {
    if (!rawText) return "";

    let parsedText = parseWikiText(rawText);
    let rawHtml = marked.parse(parsedText, { breaks: true });

    // 신규 확장: 스포일러 블록 및 아바타 챗버블(표정 포함) 매핑
    rawHtml = rawHtml.replace(/(?:<p>)?\[스포일러\]([\s\S]*?)\[\/스포일러\](?:<\/p>)?/g, (m, content) => createSpoilerHtml(content));
    rawHtml = rawHtml.replace(/(?:<p>)?\[(대화|우대화):\s*(.*?)(?:\((.*?)\))?:\s*\]?([\s\S]*?)\[\/(?:대화|우대화)\](?:<\/p>)?/g, (m, type, name, expr, msg) => createChatHtml(type, name, expr, msg));

    // 기존 및 신규 그래픽 위젯(스탯 비교, 성향 매트릭스, 인라인 탭) 매핑
    rawHtml = rawHtml.replace(/(?:<p>)?\[스탯:(.*?)\](?:<\/p>)?/g, (m, p1) => createRadarChartHtml(p1.replace(/<[^>]*>?/gm, ''))); 
    rawHtml = rawHtml.replace(/(?:<p>)?\[스탯비교:(.*?)\](?:<\/p>)?/g, (m, p1) => createRadarCompareHtml(p1.replace(/<[^>]*>?/gm, ''))); 
    rawHtml = rawHtml.replace(/(?:<p>)?\[성향:(.*?)\](?:<\/p>)?/g, (m, p1) => createAlignmentChartHtml(p1.replace(/<[^>]*>?/gm, ''))); 
    rawHtml = rawHtml.replace(/(?:<p>)?\[게이지:(.*?)\](?:<\/p>)?/g, (m, p1) => createBarGraphHtml(p1.replace(/<[^>]*>?/gm, ''))); 
    rawHtml = rawHtml.replace(/(?:<p>)?\[TIMELINE\]([\s\S]*?)\[\/TIMELINE\](?:<\/p>)?/g, (m, content) => createTimelineHtml(content.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>?/gm, ''))); 
    rawHtml = rawHtml.replace(/(?:<p>)?\[RELATION_GRAPH\]([\s\S]*?)\[\/RELATION_GRAPH\](?:<\/p>)?/g, (m, content) => createRelationGraphHtml(content.replace(/<[^>]*>?/gm, '')));
    rawHtml = rawHtml.replace(/(?:<p>)?(\[TAB:.*?\][\s\S]*?\[\/TAB\])(?:<\/p>)?/g, (m, content) => createTabHtml(content));

    return processMarkdownHtml(rawHtml, startH1);
  }, [rawText, startH1]);

  useFootnoteTooltip();
  useHeadingFold(containerRef, [renderedHtml]);

  if (!rawText) return null;

  return (
    <>
      <style>{`
        .markdown-body h2 { border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 14px; margin-top: 24px; }
        .markdown-body h3, .markdown-body h4 { border-bottom: 1px dashed var(--border-color); padding-bottom: 4px; margin-bottom: 12px; margin-top: 20px; }
        .markdown-body h2:first-child, .markdown-body h3:first-child { margin-top: 0; }
        .galpi-spoiler { background-color: #111; color: #111; cursor: pointer; padding: 2px 6px; border-radius: 4px; font-weight: bold; transition: color 0.3s ease; }
        .galpi-spoiler:hover { color: #fff; }
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