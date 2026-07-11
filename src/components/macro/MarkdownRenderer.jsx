import React from 'react';
import { marked } from 'marked';
import { parseWikiText } from '../../utils/markdownParser';

const MarkdownRenderer = ({ rawText, onNodeClick }) => {
  if (!rawText) return null;
  const parsedText = parseWikiText(rawText);
  let rawHtml = marked.parse(parsedText);

  // 임시 플레이스홀더 (나중에 실제 컴포넌트로 교체할 예정)
  rawHtml = rawHtml.replace(/(?:<p>)?\[스탯:(.*?)\](?:<\/p>)?/g, () => `<div style="padding:15px; background:var(--surface-color); border:1px solid var(--border-color); border-radius:8px; margin:15px 0; font-weight:bold; color:var(--primary-color); text-align:center;">📊 스탯 차트 렌더링 영역</div>`); 
  rawHtml = rawHtml.replace(/(?:<p>)?\[게이지:(.*?)\](?:<\/p>)?/g, () => `<div style="padding:15px; background:var(--surface-color); border:1px solid var(--border-color); border-radius:8px; margin:15px 0; font-weight:bold; color:var(--primary-color);">🔋 게이지 바 렌더링 영역</div>`); 
  rawHtml = rawHtml.replace(/(?:<p>)?\[TIMELINE\]([\s\S]*?)\[\/TIMELINE\](?:<\/p>)?/g, () => `<div style="padding:15px; background:var(--surface-color); border:1px solid var(--border-color); border-radius:8px; margin:15px 0; font-weight:bold; color:var(--primary-color);">⏳ 타임라인 연표 렌더링 영역</div>`); 
  rawHtml = rawHtml.replace(/\[RELATION_GRAPH\]([\s\S]*?)\[\/RELATION_GRAPH\]/g, () => `<div style="padding:20px; background:var(--table-bg-alt); border:1px solid var(--border-color); border-radius:8px; color:var(--primary-color); font-weight:bold; margin:20px 0; text-align:center;">🔗 인물 관계도 다이어그램 렌더링 영역</div>`);

  return (
    <div 
      className="markdown-body" 
      dangerouslySetInnerHTML={{ __html: rawHtml.replace(/\n/g, '<br/>') }} 
      onClick={(e) => {
        // 위키 백링크 클릭 시 이동 처리
        if (e.target.classList.contains('wiki-backlink') && onNodeClick) {
          onNodeClick(e.target.innerText);
        }
      }}
    />
  );
};

export default MarkdownRenderer;