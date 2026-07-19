// 파일 위치: src/domains/macro/MarkdownRenderer.jsx
// 기능 요약: 위키 커스텀 매크로(스탯/연표/관계도) 변환 및 하위 문단 자동 구분선, 문단 접기(Folding) 엔진이 통합된 마크다운 렌더러
// 버전: v1.3.0

import React, { useMemo, useEffect, useRef } from 'react';
import { marked } from 'marked';
import { parseWikiText } from '../../utils/markdownParser';

// 1. 방사형 차트 생성 헬퍼
const createRadarChartHtml = (dataStr) => {
  try {
    const pairs = dataStr.split(',').map(s => s.trim().split('='));
    const labels = []; const values = [];
    pairs.forEach(p => { if (p.length === 2) { labels.push(p[0].trim()); values.push(parseFloat(p[1]) || 0); } });
    const maxVal = Math.max(100, ...values); const size = 300; const center = size / 2; const radius = size * 0.35; const numSides = labels.length;
    if (numSides < 3) return `<div style="color:#e53e3e; font-size:12px;">[스탯 분석 실패: 항목 3개 이상 필요]</div>`;
    
    let bgPolygons = ""; let polygonPoints = ""; let labelHtml = ""; let pointsHtml = "";
    for(let level=1; level<=4; level++) {
      let pts = ""; let r = radius * (level/4);
      for(let i=0; i<numSides; i++) {
        let angle = (Math.PI * 2 * i / numSides) - (Math.PI / 2);
        pts += `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)} `;
      }
      bgPolygons += `<polygon points="${pts.trim()}" fill="none" stroke="var(--border-color)" stroke-width="1"/>`;
    }
    for(let i=0; i<numSides; i++) {
      let angle = (Math.PI * 2 * i / numSides) - (Math.PI / 2);
      let bgX = center + radius * Math.cos(angle); let bgY = center + radius * Math.sin(angle);
      bgPolygons += `<line x1="${center}" y1="${center}" x2="${bgX}" y2="${bgY}" stroke="var(--border-color)" stroke-width="1"/>`;
      let r = radius * (values[i] / maxVal);
      let dx = center + r * Math.cos(angle); let dy = center + r * Math.sin(angle);
      polygonPoints += `${dx},${dy} `;
      pointsHtml += `<circle cx="${dx}" cy="${dy}" r="4" fill="var(--primary-color)" stroke="#fff" stroke-width="1.5"/>`;
      let lx = center + (radius + 28) * Math.cos(angle); let ly = center + (radius + 20) * Math.sin(angle);
      let anchor = "middle";
      if(Math.cos(angle) > 0.1) anchor = "start"; else if(Math.cos(angle) < -0.1) anchor = "end";
      labelHtml += `<text x="${lx}" y="${ly-6}" fill="var(--text-primary)" font-size="12" font-weight="900" text-anchor="${anchor}" dominant-baseline="middle">${labels[i]}</text>`;
      labelHtml += `<text x="${lx}" y="${ly+8}" fill="var(--text-secondary)" font-size="11" font-weight="bold" text-anchor="${anchor}" dominant-baseline="middle">${values[i]}</text>`;
    }
    return `<div style="display:flex; flex-direction:column; align-items:center; margin: 25px 0; background: var(--surface-color); padding: 25px 15px; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);"><div style="font-weight:900; font-size:14px; margin-bottom:15px; color:var(--text-primary); letter-spacing: 1px;">📊 스탯 분석 차트</div><svg width="100%" height="100%" viewBox="0 0 ${size} ${size}" style="max-width: 320px; overflow:visible; font-family:inherit;">${bgPolygons}<polygon points="${polygonPoints.trim()}" fill="var(--primary-color)" fill-opacity="0.3" stroke="var(--primary-color)" stroke-width="2" stroke-linejoin="round"/>${pointsHtml}${labelHtml}</svg></div>`;
  } catch(e) { return `<div style="color:#e53e3e; font-size:12px;">[레이더 차트 오류]</div>`; }
};

// 2. 바 그래프 생성 헬퍼
const createBarGraphHtml = (dataStr) => {
  try {
    const pairs = dataStr.split(',').map(s => s.trim().split('='));
    let html = `<div class="galpi-ext-bar-wrap">`;
    pairs.forEach(p => {
      if (p.length === 2) {
        const label = p[0].trim(); const valStr = p[1].trim(); const valParts = valStr.split('/');
        const current = parseFloat(valParts[0]) || 0; const max = valParts.length > 1 ? parseFloat(valParts[1]) : 100;
        const percent = Math.min(100, Math.max(0, (current / max) * 100));
        let barColor = "var(--primary-color)";
        if (percent <= 30) barColor = "#e53e3e"; else if (percent >= 80) barColor = "#10b981"; 
        html += `<div class="galpi-ext-bar-item"><div class="galpi-ext-bar-label">${label}</div><div class="galpi-ext-bar-track"><div class="galpi-ext-bar-fill" style="width: ${percent}%; background: ${barColor};"></div></div><div class="galpi-ext-bar-value">${valStr}</div></div>`;
      }
    });
    return html + `</div>`;
  } catch(e) { return `<div style="color:#e53e3e; font-size:12px;">[게이지 렌더링 오류]</div>`; }
};

// 3. 타임라인(연표) 생성 헬퍼
const createTimelineHtml = (innerText) => {
  let lines = innerText.trim().split('\n');
  let html = `<div class="galpi-timeline" style="border-left: 3px solid var(--primary-color); margin-left: 10px; padding-left: 15px; display: flex; flex-direction: column; gap: 15px; margin-top: 20px; margin-bottom: 20px;">\n`;
  let validCount = 0;
  lines.forEach(line => {
    let parts = line.split('::::');
    if (parts.length >= 1) {
      let dateVal = (parts[0] || "").trim();
      let titleVal = (parts[1] || "").trim();
      let descVal = (parts[2] || "").trim().replace(/<br>/g, '<br/>');
      if (dateVal || titleVal || descVal) {
        validCount++;
        html += `  <div class="tl-item" style="position: relative;">\n`;
        html += `    <div style="position: absolute; left: -22px; top: 2px; width: 11px; height: 11px; border-radius: 50%; background: var(--primary-color); border: 2px solid var(--bg-color); box-sizing: content-box;"></div>\n`;
        if (dateVal) html += `    <div class="tl-date" style="font-weight: 900; color: var(--primary-color); font-size: 13px;">${dateVal}</div>\n`;
        if (titleVal) html += `    <div class="tl-title" style="font-weight: bold; font-size: 16px; margin-top: 2px; color: var(--text-primary);">${titleVal}</div>\n`;
        if (descVal) html += `    <div class="tl-desc" style="font-size: 14px; color: var(--text-secondary); margin-top: 6px; line-height: 1.6;">${descVal}</div>\n`;
        html += `  </div>\n`;
      }
    }
  });
  html += `</div>\n`;
  return validCount > 0 ? html : "";
};

// 4. 인물 관계도 SVG 생성 헬퍼
const createRelationGraphHtml = (innerText) => {
  let graphData = { nodes: [], edges: [] };
  try {
    let cleanJson = innerText.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
    graphData = JSON.parse(cleanJson);
  } catch(e) {
    return `<div style="color:#e53e3e; padding:10px; font-weight:bold; background:rgba(229,62,62,0.1); border:1px solid #e53e3e; border-radius:8px;">⚠️ 관계도 데이터가 손상되었습니다. 코드를 확인하십시오.</div>`;
  }

  let width = graphData.width || 800;
  let height = graphData.height || 450;
  
  let html = `<div style="margin:20px 0; background:var(--bg-color); border:1px solid var(--border-color); border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.03); overflow:hidden; display:flex; flex-direction:column;">`;
  html += '<div style="padding:12px 20px; background:var(--surface-color); border-bottom:1px solid var(--border-color); font-weight:900; color:var(--primary-color); font-size:15px;">📊 인물 관계도</div>';
  html += `<div style="width:100%; overflow-x:auto; overflow-y:hidden; padding:20px 0;"><svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="min-width:${width}px; display:block; margin:0 auto; user-select:none; overflow:visible; font-family:inherit;">`;
  
  html += '<defs>';
  html += '<marker id="diag-arr-normal" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-secondary)"/></marker>';
  html += '<marker id="diag-arr-active" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--primary-color)"/></marker>';
  html += '<filter id="diag-shadow"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.1"/></filter>';
  html += '</defs>';

  graphData.edges.forEach(e => {
    let n1 = graphData.nodes.find(n => n.id === e.source);
    let n2 = graphData.nodes.find(n => n.id === e.target);
    if (!n1 || !n2) return;

    let dx = n2.x - n1.x; let dy = n2.y - n1.y;
    let dist = Math.sqrt(dx*dx + dy*dy);
    if (dist === 0) return;

    let r1 = n1.shape === 'rect' ? 45 : 42;
    let r2 = n2.shape === 'rect' ? 45 : 42;

    let x1 = n1.x + (dx * r1 / dist); let y1 = n1.y + (dy * r1 / dist);
    let x2 = n2.x - (dx * r2 / dist); let y2 = n2.y - (dy * r2 / dist);

    let strokeCol = e.type === '<->' ? 'var(--primary-color)' : 'var(--text-secondary)';
    let strokeW = e.type === '<->' ? '2.5' : '1.5';
    let isDashed = e.type === '--' ? 'stroke-dasharray="5,5"' : '';
    let mEndNorm = 'url(#diag-arr-normal)';

    html += `<g class="rel-edge-grp">`;

    const drawLabel = (txt, px1, py1, px2, py2) => {
      if (!txt) return;
      let textW = txt.length * 11 + 14;
      let cx = (px1 + px2) / 2; let cy = (py1 + py2) / 2;
      let angle = Math.atan2(py2 - py1, px2 - px1) * (180 / Math.PI);
      if (angle > 90 || angle < -90) angle += 180;

      html += `<g transform="rotate(${angle}, ${cx}, ${cy})">`;
      html += `<rect x="${cx - (textW/2)}" y="${cy - 11}" width="${textW}" height="22" fill="var(--bg-color)" rx="4" ry="4" stroke="${strokeCol}" stroke-width="1"/>`;
      html += `<text x="${cx}" y="${cy + 4}" fill="${strokeCol}" font-size="11" font-weight="900" text-anchor="middle">${txt}</text>`;
      html += `</g>`;
    };

    if (e.type === '<->') {
      let gap = 12;
      let nx = -dy / dist; let ny = dx / dist;
      let l1x1 = x1 + nx * gap; let l1y1 = y1 + ny * gap;
      let l1x2 = x2 + nx * gap; let l1y2 = y2 + ny * gap;
      let l2x1 = x2 - nx * gap; let l2y1 = y2 - ny * gap;
      let l2x2 = x1 - nx * gap; let l2y2 = y1 - ny * gap;

      html += `<line x1="${l1x1}" y1="${l1y1}" x2="${l1x2}" y2="${l1y2}" stroke="${strokeCol}" stroke-width="${strokeW}" marker-end="url(#diag-arr-active)" opacity="0.85"/>`;
      html += `<line x1="${l2x1}" y1="${l2y1}" x2="${l2x2}" y2="${l2y2}" stroke="${strokeCol}" stroke-width="${strokeW}" marker-end="url(#diag-arr-active)" opacity="0.85"/>`;
      drawLabel(e.desc, l1x1, l1y1, l1x2, l1y2);
      drawLabel(e.descRev, l2x1, l2y1, l2x2, l2y2);
    } else {
      let mEnd = e.type === '->' ? mEndNorm : '';
      html += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${strokeCol}" stroke-width="${strokeW}" ${isDashed} marker-end="${mEnd}" opacity="0.85"/>`;
      drawLabel(e.desc, x1, y1, x2, y2);
    }
    html += `</g>`;
  });

  graphData.nodes.forEach(n => {
    let label = n.label || "미지정";
    let dispLabel = label.length > 6 ? label.substring(0, 5) + '..' : label;
    html += `<g transform="translate(${n.x}, ${n.y})">`;
    if (n.shape === 'rect') {
        html += `<rect x="-45" y="-22" width="90" height="44" fill="var(--surface-color)" stroke="var(--text-secondary)" stroke-width="2" rx="6" ry="6" filter="url(#diag-shadow)"/>`;
    } else {
        html += `<circle cx="0" cy="0" r="42" fill="var(--surface-color)" stroke="var(--primary-color)" stroke-width="2" filter="url(#diag-shadow)"/>`;
    }
    html += `<text x="0" y="5" fill="var(--text-primary)" font-size="13" font-weight="900" text-anchor="middle">${dispLabel}</text>`;
    html += `</g>`;
  });

  html += '</svg></div></div>';
  return html.replace(/\n\s*/g, '');
};


// 메인 마크다운 렌더링 컴포넌트
const MarkdownRenderer = ({ rawText, onNodeClick, startH1 = 1 }) => {
  const containerRef = useRef(null);

  const renderedHtml = useMemo(() => {
    if (!rawText) return "";

    let parsedText = parseWikiText(rawText);
    let rawHtml = marked.parse(parsedText, { breaks: true });

    // 실시간 매크로 렌더링 함수 연동 교체 완료
    rawHtml = rawHtml.replace(/(?:<p>)?\[스탯:(.*?)\](?:<\/p>)?/g, (m, p1) => createRadarChartHtml(p1.replace(/<[^>]*>?/gm, ''))); 
    rawHtml = rawHtml.replace(/(?:<p>)?\[게이지:(.*?)\](?:<\/p>)?/g, (m, p1) => createBarGraphHtml(p1.replace(/<[^>]*>?/gm, ''))); 
    rawHtml = rawHtml.replace(/(?:<p>)?\[TIMELINE\]([\s\S]*?)\[\/TIMELINE\](?:<\/p>)?/g, (m, content) => createTimelineHtml(content.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>?/gm, ''))); 
    rawHtml = rawHtml.replace(/(?:<p>)?\[RELATION_GRAPH\]([\s\S]*?)\[\/RELATION_GRAPH\](?:<\/p>)?/g, (m, content) => createRelationGraphHtml(content.replace(/<[^>]*>?/gm, '')));

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
            counters.h1 = parseInt(match[1], 10);
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

  // ★ 나무위키식 문단 접기 엔진 마운트
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');

    headings.forEach((heading) => {
      if (heading.querySelector('.wiki-fold-btn')) return;

      const btn = document.createElement('span');
      btn.className = 'wiki-fold-btn';
      btn.innerHTML = '▼';
      btn.title = "문단 접기/펼치기";
      btn.style.cssText = "cursor: pointer; font-size: 0.7em; margin-left: 8px; color: var(--text-secondary); user-select: none; transition: color 0.2s; vertical-align: middle;";

      btn.onmouseover = () => btn.style.color = 'var(--primary-color)';
      btn.onmouseout = () => { 
        if (!heading.classList.contains('is-collapsed')) btn.style.color = 'var(--text-secondary)'; 
      };

      heading.appendChild(btn);

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        const isCollapsed = heading.classList.toggle('is-collapsed');
        btn.innerHTML = isCollapsed ? '◀' : '▼';
        btn.style.color = isCollapsed ? 'var(--primary-color)' : 'var(--text-secondary)';

        // 1. H1 태그를 클릭한 경우: 바로 뒤에 붙어있는 md-box 전체를 통째로 토글
        if (heading.tagName === 'H1') {
          const mdBox = heading.nextElementSibling;
          if (mdBox && mdBox.classList.contains('md-box')) {
            if (isCollapsed) {
              mdBox.dataset.originalDisplay = mdBox.style.display || '';
              mdBox.style.display = 'none';
            } else {
              mdBox.style.display = mdBox.dataset.originalDisplay || '';
            }
          }
        } 
        // 2. H2, H3 등 하위 태그를 클릭한 경우: md-box 내부에 있으므로 동급 태그가 나오기 전까지의 형제 요소들을 토글
        else {
          const currentLevel = parseInt(heading.tagName.substring(1));
          let sibling = heading.nextElementSibling;

          while (sibling) {
            const siblingLevelMatch = sibling.tagName.match(/^H(\d)$/);
            if (siblingLevelMatch) {
              const siblingLevel = parseInt(siblingLevelMatch[1]);
              if (siblingLevel <= currentLevel) break;
            }

            if (isCollapsed) {
              if (sibling.style.display !== 'none') {
                sibling.dataset.originalDisplay = sibling.style.display || '';
                sibling.style.display = 'none';
              }
            } else {
              sibling.style.display = sibling.dataset.originalDisplay || '';
            }
            sibling = sibling.nextElementSibling;
          }
        }
      });
    });
  }, [renderedHtml]);

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