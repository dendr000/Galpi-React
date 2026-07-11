import React, { useMemo } from 'react';
import { marked } from 'marked';
import { parseWikiText } from '../../utils/markdownParser';

const MarkdownRenderer = ({ rawText, onNodeClick, startH1 = 1 }) => {
  const renderedHtml = useMemo(() => {
    if (!rawText) return "";

    let parsedText = parseWikiText(rawText);
    let rawHtml = marked.parse(parsedText, { breaks: true });

    // 매크로 껍데기 치환
    rawHtml = rawHtml.replace(/(?:<p>)?\[스탯:(.*?)\](?:<\/p>)?/g, () => `<div style="padding:15px; background:var(--surface-color); border:1px solid var(--border-color); border-radius:8px; margin:15px 0; font-weight:bold; color:var(--primary-color); text-align:center;">📊 스탯 차트 렌더링 영역</div>`); 
    rawHtml = rawHtml.replace(/(?:<p>)?\[게이지:(.*?)\](?:<\/p>)?/g, () => `<div style="padding:15px; background:var(--surface-color); border:1px solid var(--border-color); border-radius:8px; margin:15px 0; font-weight:bold; color:var(--primary-color);">🔋 게이지 바 렌더링 영역</div>`); 
    rawHtml = rawHtml.replace(/(?:<p>)?\[TIMELINE\]([\s\S]*?)\[\/TIMELINE\](?:<\/p>)?/g, () => `<div style="padding:15px; background:var(--surface-color); border:1px solid var(--border-color); border-radius:8px; margin:15px 0; font-weight:bold; color:var(--primary-color);">⏳ 타임라인 연표 렌더링 영역</div>`); 
    rawHtml = rawHtml.replace(/\[RELATION_GRAPH\]([\s\S]*?)\[\/RELATION_GRAPH\]/g, () => `<div style="padding:20px; background:var(--table-bg-alt); border:1px solid var(--border-color); border-radius:8px; color:var(--primary-color); font-weight:bold; margin:20px 0; text-align:center;">🔗 인물 관계도 다이어그램 렌더링 영역</div>`);

    // ★ 문단 번호 넘버링 및 카운터 동기화 알고리즘
    let counters = { h1: startH1 - 1, h2: 0, h3: 0 };
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3');

    headings.forEach((heading, globalIndex) => {
      const tag = heading.tagName.toLowerCase();
      let numStr = "";
      const currentText = heading.textContent || "";

      if (tag === 'h1') {
        const match = currentText.match(/^(\d+)\./);
        if (match) {
            counters.h1 = parseInt(match[1], 10); // 수동 입력 번호로 카운터 동기화
        } else {
            counters.h1++;
            numStr = `${counters.h1}.`;
        }
        counters.h2 = 0;
        counters.h3 = 0;
        heading.classList.add('md-h1');
      } else if (tag === 'h2') {
        const match = currentText.match(/^(\d+)\.(\d+)\./);
        if (match) {
            counters.h1 = parseInt(match[1], 10);
            counters.h2 = parseInt(match[2], 10);
        } else {
            counters.h2++;
            numStr = `${counters.h1}.${counters.h2}.`;
        }
        counters.h3 = 0;
      } else if (tag === 'h3') {
        const match = currentText.match(/^(\d+)\.(\d+)\.(\d+)\./);
        if (match) {
            counters.h1 = parseInt(match[1], 10);
            counters.h2 = parseInt(match[2], 10);
            counters.h3 = parseInt(match[3], 10);
        } else {
            counters.h3++;
            numStr = `${counters.h1}.${counters.h2}.${counters.h3}.`;
        }
      }

      if (numStr) {
        heading.innerHTML = `<span style="color:var(--text-secondary); margin-right:8px;">${numStr}</span>${heading.innerHTML}`;
      }
      heading.id = `galpi-toc-target-${globalIndex}`;
    });

    // ★ H1을 기준으로 하얀 테두리 박스(.md-box) 분할 조립
    const newBody = document.createElement('body');
    let currentBox = null;

    Array.from(doc.body.childNodes).forEach(node => {
      if (node.nodeType === 1 && node.tagName.toLowerCase() === 'h1') {
        newBody.appendChild(node.cloneNode(true));
        currentBox = document.createElement('div');
        currentBox.className = 'md-box';
        newBody.appendChild(currentBox);
      } else {
        if (!currentBox) {
          currentBox = document.createElement('div');
          currentBox.className = 'md-box';
          newBody.appendChild(currentBox);
        }
        currentBox.appendChild(node.cloneNode(true));
      }
    });

    Array.from(newBody.querySelectorAll('.md-box')).forEach(box => {
      if (box.innerHTML.trim() === '') box.remove();
    });

    return newBody.innerHTML;
  }, [rawText, startH1]);

  if (!rawText) return null;

  return (
    <div 
      className="markdown-body" 
      dangerouslySetInnerHTML={{ __html: renderedHtml }} 
      onClick={(e) => {
        if (e.target.classList.contains('wiki-backlink') && onNodeClick) {
          onNodeClick(e.target.innerText);
        }
      }}
    />
  );
};

export default MarkdownRenderer;