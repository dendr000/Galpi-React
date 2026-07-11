import React from 'react';
import { marked } from 'marked';
import { parseWikiText } from '../../utils/markdownParser';
import RelationGraph from './RelationGraph';
import RadarChart from './RadarChart'; // 필요 시 이전 답변 참고하여 파일 생성
import BarGraph from './BarGraph';     // 필요 시 이전 답변 참고하여 파일 생성
import Timeline from './Timeline';     // 필요 시 이전 답변 참고하여 파일 생성

const MarkdownRenderer = ({ rawText, onNodeClick }) => {
  if (!rawText) return null;
  const parsedText = parseWikiText(rawText);
  
  // 매크로 블록을 기준으로 텍스트를 분할 (정규식을 괄호로 묶으면 분할된 문자열도 배열에 포함됩니다)
  const regex = /(\[RELATION_GRAPH\][\s\S]*?\[\/RELATION_GRAPH\]|\[스탯:.*?\]|\[게이지:.*?\]|\[TIMELINE\][\s\S]*?\[\/TIMELINE\])/g;
  const parts = parsedText.split(regex).filter(Boolean);
  
  return (
    <div className="markdown-body">
      {parts.map((part, idx) => {
        if (part.startsWith('[RELATION_GRAPH]')) {
          const jsonStr = part.replace(/\[\/?RELATION_GRAPH\]/g, '').trim();
          return <RelationGraph key={idx} dataStr={jsonStr} onNodeClick={onNodeClick} />;
        }
        // 나머지 스탯, 게이지 등 매크로 컴포넌트가 없다면 임시로 div 출력
        if (part.startsWith('[스탯:')) return <div key={idx} style={{color:'var(--primary-color)'}}>[📊 스탯 차트 렌더링 영역]</div>;
        if (part.startsWith('[게이지:')) return <div key={idx} style={{color:'var(--primary-color)'}}>[🔋 게이지 바 렌더링 영역]</div>;
        if (part.startsWith('[TIMELINE]')) return <div key={idx} style={{color:'var(--primary-color)'}}>[⏳ 타임라인 연표 렌더링 영역]</div>;

        // 일반 텍스트는 Marked 파서로 렌더링
        return <div key={idx} dangerouslySetInnerHTML={{ __html: marked.parse(part).replace(/\n/g, '<br/>') }} />;
      })}
    </div>
  );
};

export default MarkdownRenderer;