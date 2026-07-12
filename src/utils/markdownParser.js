// src/utils/markdownParser.js

import { marked } from 'marked';

export const extractMeta = (text) => {
    if (!text) return { clean: "", meta: {} };
    let meta = {};
    let clean = text.replace(/^[\}\]\s,]+/, '').trim();
    let nlIdx = clean.indexOf('\n');
    let firstLine = nlIdx !== -1 ? clean.substring(0, nlIdx).trim() : clean;
    
    if (firstLine.startsWith("[META_DATA:") && firstLine.endsWith("]")) {
        let jsonStr = firstLine.substring(11, firstLine.length - 1);
        try { meta = JSON.parse(jsonStr); } catch(e) {}
        clean = (nlIdx !== -1) ? clean.substring(nlIdx + 1).trim() : "";
    } else {
        let fallbackMatch = clean.match(/\[META_DATA:(.*?)\]/);
        if (fallbackMatch) {
            try { meta = JSON.parse(fallbackMatch[1]); } catch(e) {}
            clean = clean.replace(fallbackMatch[0], '').trim();
        }
    }
    return { clean, meta };
};

export const buildMetaStr = (desc, meta) => {
    if (!meta || Object.keys(meta).length === 0) return desc;
    return `[META_DATA:${JSON.stringify(meta)}]\n${desc ? desc.trim() : ""}`;
};

// ★ 바닐라 UI 스타일 100% 복원: 글로벌 CSS 인젝터 (리액트 보안 모듈 회피용)
const injectMacroStyles = () => {
    if (typeof document === 'undefined' || document.getElementById('galpi-macro-styles')) return;
    const style = document.createElement('style');
    style.id = 'galpi-macro-styles';
    style.innerHTML = `
        .wiki-footnote:hover { background-color: var(--table-bg-alt); border-radius: 4px; }
        .wiki-backlink { color: var(--primary-color); font-weight: 900; text-decoration: none; border-bottom: 2px solid rgba(59,91,219,0.3); padding: 0 3px; transition: 0.2s; cursor: pointer; border-radius: 2px; }
        .wiki-backlink:hover { background: rgba(59,91,219,0.1); border-bottom-color: var(--primary-color); }
        .galpi-ext-fold { border: 1px solid var(--border-color); border-radius: 8px; margin: 15px 0; background: var(--surface-color); box-shadow: 0 4px 15px rgba(0,0,0,0.03); overflow: hidden; transition: all 0.3s ease; }
        .galpi-ext-fold summary { padding: 14px 18px; font-weight: 900; cursor: pointer; background: var(--table-bg-alt); color: var(--primary-color); list-style: none; user-select: none; font-size: 14px; outline: none; display: flex; align-items: center; }
        .galpi-ext-fold summary:hover { background: rgba(59,91,219,0.05); }
        .galpi-ext-fold summary::-webkit-details-marker { display: none; }
        .galpi-ext-fold summary::before { content: '>'; display: inline-block; margin-right: 12px; font-size: 18px; font-family: monospace; transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); line-height: 1; padding-bottom: 2px; color: var(--text-secondary); font-weight: 900; }
        .galpi-ext-fold[open] summary::before { transform: rotate(90deg); color: var(--primary-color); }
        .galpi-ext-fold .fold-content { padding: 18px; border-top: 1px dashed var(--border-color); font-size: 14px; line-height: 1.6; color: var(--text-primary); background: var(--bg-color); animation: fadeIn 0.3s ease; }
        .galpi-ext-quote { border: 1px solid var(--border-color); border-left: 4px solid var(--primary-color); background: var(--table-bg-alt); padding: 14px 20px; margin: 15px 0; border-radius: 4px 8px 8px 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); color: var(--text-primary); line-height: 1.7; font-size: 14px; word-break: keep-all; width: fit-content; max-width: 100%; }
        .galpi-ext-bar-wrap { margin: 15px 0; display: flex; flex-direction: column; gap: 10px; padding: 15px; background: var(--surface-color); border: 1px solid var(--border-color); border-radius: 12px; box-shadow: var(--shadow-sm); }
        .galpi-ext-bar-item { display: flex; align-items: center; gap: 15px; }
        .galpi-ext-bar-label { width: 80px; font-weight: 900; font-size: 13px; color: var(--text-primary); text-align: right; }
        .galpi-ext-bar-track { flex: 1; height: 14px; background: var(--table-bg-alt); border-radius: 8px; overflow: hidden; position: relative; box-shadow: inset 0 1px 3px rgba(0,0,0,0.05); border: 1px solid var(--border-color); }
        .galpi-ext-bar-fill { height: 100%; border-radius: 8px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }
        .galpi-ext-bar-value { width: 65px; font-size: 12px; font-weight: bold; color: var(--text-secondary); }
        .galpi-ext-chat-room { margin: 15px 0; display: flex; flex-direction: column; gap: 10px; padding: 15px; background: var(--table-bg-alt); border-radius: 12px; border: 1px solid var(--border-color); }
        .galpi-ext-msg { display: flex; flex-direction: column; gap: 4px; max-width: 80%; }
        .galpi-ext-msg-name { font-size: 11px; font-weight: bold; color: var(--text-secondary); margin-left: 5px; }
        .galpi-ext-msg-bubble { padding: 8px 12px; border-radius: 14px; font-size: 13px; line-height: 1.5; color: white; background: var(--primary-color); border-top-left-radius: 4px; word-break: break-all; box-shadow: 0 1px 2px rgba(0,0,0,0.1); display: inline-block; }
        .galpi-ext-msg.right { align-self: flex-end; align-items: flex-end; }
        .galpi-ext-msg.right .galpi-ext-msg-name { margin-left: 0; margin-right: 5px; }
        .galpi-ext-msg.right .galpi-ext-msg-bubble { background: var(--surface-color); color: var(--text-primary); border: 1px solid var(--border-color); border-top-left-radius: 14px; border-top-right-radius: 4px; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    `;
    document.head.appendChild(style);
};

export const parseWikiText = (text) => {
    if (!text) return "";
    injectMacroStyles(); // 글로벌 CSS 안전 주입
    let preText = text;

    preText = preText.replace(/\[RELATION_GRAPH\]/g, '▤REL_START▤');
    preText = preText.replace(/\[\/RELATION_GRAPH\]/g, '▤REL_END▤');
    preText = preText.replace(/\[META_DATA:/g, '▤META_START▤:');

    preText = preText.replace(/\[폰트:(.*?):([\s\S]*?)\]/g, (match, fontName, content) => {
        const fontMap = { '궁서': "'Gungsuh', '궁서', serif", '바탕': "'Batang', '바탕', serif", '돋움': "'Dotum', '돋움', sans-serif", '굴림': "'Gulim', '굴림', sans-serif", '명조': "'Noto Serif KR', serif" };
        return `<span style="font-family: ${fontMap[fontName.trim()] || "inherit"};">${content}</span>`;
    });
    preText = preText.replace(/\[크기:([0-9]+):([\s\S]*?)\]/g, (match, size, content) => `<span style="font-size: ${size}px;">${content}</span>`);
    preText = preText.replace(/\[정렬:(좌측|중앙|우측):([\s\S]*?)\]/g, (match, alignName, content) => {
        let align = alignName === "중앙" ? "center" : (alignName === "우측" ? "right" : "left");
        return `<div style="text-align: ${align}; width: 100%; margin: 10px 0;">${content}</div>`;
    });
    preText = preText.replace(/\[들여쓰기:([\s\S]*?)\]/g, (match, content) => {
        let indented = content.split('\n').map(line => line.trim() ? `<div style="text-indent: 1.5em; margin: 4px 0;">${line}</div>` : line).join('\n');
        return `<div style="margin: 10px 0;">${indented}</div>`;
    });

    preText = preText.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    preText = preText.replace(/(^|\s)_([^\s_][^_]*[^\s_]|[^\s_])_(\s|[.,!?]|$)/g, '$1<em>$2</em>$3');
    preText = preText.replace(/(^|[^\\])--(?!\s)(.+?)(?<!\s)--/gm, '$1<del style="opacity:0.6;">$2</del>');
    preText = preText.replace(/\[([a-zA-Z0-9#-]+):([\s\S]*?)\]/g, (match, colorKey, content) => {
        let color = colorKey; let bg = "transparent"; let k = colorKey.toLowerCase();
        if (k === 'red') color = '#e53e3e'; else if (k === 'blue') color = 'var(--primary-color)'; else if (k === 'black') color = 'var(--text-primary)'; else if (k === 'white') color = '#ffffff';
        else if (k.startsWith('bg-')) { color = 'var(--text-primary)'; bg = k.replace('bg-', '') === 'yellow' ? 'rgba(253, 224, 71, 0.6)' : k.replace('bg-', ''); }
        return `<span style="color:${color}; background-color:${bg}; font-weight:bold; border-radius:2px; padding:0 2px;">${content}</span>`;
    });

    let lines = preText.split('\n');
    let inQuote = false; let quoteBuffer = [];
    let inTable = false; let tableBuffer = [];
    let newLines = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i]; let trimmed = line.trim();

        if (trimmed.startsWith('||') && trimmed.endsWith('||') && !trimmed.match(/->|=>|→/)) {
            if (inQuote) { newLines.push(`\n<div class="galpi-ext-quote">${quoteBuffer.join('<br>')}</div>\n`); inQuote = false; quoteBuffer = []; }
            if (!inTable) { 
                inTable = true; 
                tableBuffer.push('<div style="overflow-x:auto; margin: 15px 0;"><table style="width:100%; border-collapse:collapse; background:var(--surface-color); font-size:13px; text-align:center; border-radius:8px; border-style:hidden; box-shadow:0 0 0 1px var(--border-color), 0 2px 8px rgba(0,0,0,0.02);"><tbody>'); 
            }
            let cells = trimmed.substring(2, trimmed.length - 2).split('||');
            let isHeader = tableBuffer.length === 1;
            tableBuffer.push('<tr style="border-bottom: 1px solid var(--border-color); transition: background 0.2s;">');
            cells.forEach(cell => {
                let bg = isHeader ? 'background:var(--table-bg-alt); font-weight:900; color:var(--primary-color);' : 'color:var(--text-primary);';
                let tag = isHeader ? 'th' : 'td';
                tableBuffer.push(`<${tag} style="border:1px solid var(--border-color); padding:10px 14px; ${bg}">${cell.trim()}</${tag}>`);
            });
            tableBuffer.push('</tr>');
            continue;
        } else {
            if (inTable) { tableBuffer.push('</tbody></table></div>\n'); newLines.push(tableBuffer.join('')); inTable = false; tableBuffer = []; }
        }

        if (line.match(/^\|[ \t]*(.*)/) && !trimmed.startsWith('||')) {
            inQuote = true; quoteBuffer.push(line.replace(/^\|[ \t]*/, ''));
        } else {
            if (inQuote) { newLines.push(`\n<div class="galpi-ext-quote">${quoteBuffer.join('<br>')}</div>\n`); inQuote = false; quoteBuffer = []; }
            newLines.push(line);
        }
    }
    if (inTable) { tableBuffer.push('</tbody></table></div>\n'); newLines.push(tableBuffer.join('')); }
    if (inQuote) { newLines.push(`\n<div class="galpi-ext-quote">${quoteBuffer.join('<br>')}</div>\n`); }
    preText = newLines.join('\n');

    preText = preText.replace(/▤REL_START▤/g, '[RELATION_GRAPH]');
    preText = preText.replace(/▤REL_END▤/g, '[\/RELATION_GRAPH]');
    preText = preText.replace(/▤META_START▤:/g, '[META_DATA:');

    return preText;
};

// ★ 내부 매크로 HTML 생성 팩토리 (바닐라 CSS 클래스 완벽 복원)
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
                // ★ DOMPurify 삭제 방어핵: &nbsp; 추가
                html += `<div class="galpi-ext-bar-item"><div class="galpi-ext-bar-label">${label}</div><div class="galpi-ext-bar-track"><div class="galpi-ext-bar-fill" style="width: ${percent}%; background: ${barColor};">&nbsp;</div></div><div class="galpi-ext-bar-value">${valStr}</div></div>`;
            }
        });
        return html + `</div>`;
    } catch(e) { return `<div style="color:#e53e3e; font-size:12px;">[게이지 렌더링 오류]</div>`; }
};

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
                html += `    <div style="position: absolute; left: -22px; top: 2px; width: 11px; height: 11px; border-radius: 50%; background: var(--primary-color); border: 2px solid var(--bg-color); box-sizing: content-box;">&nbsp;</div>\n`; // 점 삭제 방어
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

const createRelationGraphHtml = (innerText) => {
    let graphData = { nodes: [], edges: [] };
    try {
        let cleanJson = innerText.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
        graphData = JSON.parse(cleanJson);
    } catch(e) {
        return `<div style="color:#e53e3e; padding:10px; font-weight:bold; background:rgba(229,62,62,0.1); border:1px solid #e53e3e; border-radius:8px;">⚠️ 관계도 데이터가 손상되었습니다.</div>`;
    }

    let width = graphData.width || 800; let height = graphData.height || 450;
    
    let html = `<div class="galpi-diagram-board" style="margin:20px 0; background:var(--bg-color); border:1px solid var(--border-color); border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.03); overflow:hidden; display:flex; flex-direction:column;">`;
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

        let r1 = n1.shape === 'rect' ? 45 : 42; let r2 = n2.shape === 'rect' ? 45 : 42;
        let x1 = n1.x + (dx * r1 / dist); let y1 = n1.y + (dy * r1 / dist);
        let x2 = n2.x - (dx * r2 / dist); let y2 = n2.y - (dy * r2 / dist);

        let strokeCol = e.type === '<->' ? 'var(--primary-color)' : 'var(--text-secondary)';
        let strokeW = e.type === '<->' ? '2.5' : '1.5';
        let isDashed = e.type === '--' ? 'stroke-dasharray="5,5"' : '';
        let mEndAct = 'url(#diag-arr-active)'; let mEndNorm = 'url(#diag-arr-normal)';

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
            let gap = 12; let nx = -dy / dist; let ny = dx / dist;
            let l1x1 = x1 + nx * gap; let l1y1 = y1 + ny * gap;
            let l1x2 = x2 + nx * gap; let l1y2 = y2 + ny * gap;
            let l2x1 = x2 - nx * gap; let l2y1 = y2 - ny * gap;
            let l2x2 = x1 - nx * gap; let l2y2 = y1 - ny * gap;

            html += `<line x1="${l1x1}" y1="${l1y1}" x2="${l1x2}" y2="${l1y2}" stroke="${strokeCol}" stroke-width="${strokeW}" marker-end="${mEndAct}" opacity="0.85"/>`;
            html += `<line x1="${l2x1}" y1="${l2y1}" x2="${l2x2}" y2="${l2y2}" stroke="${strokeCol}" stroke-width="${strokeW}" marker-end="${mEndAct}" opacity="0.85"/>`;
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

// ★ 최종 렌더링 파이프라인
export const renderMarkdown = (markdownText) => {
    if (!markdownText) return "";

    try {
        let parsedText = parseWikiText(markdownText); // 내부에 injectMacroStyles() 탑재되어 자동 실행됨
        let rawHtml = marked.parse(parsedText, { breaks: true });
        
        rawHtml = rawHtml.replace(/(?:<p>)?\[스탯:(.*?)\](?:<\/p>)?/g, (m, p1) => createRadarChartHtml(p1.replace(/<[^>]*>?/gm, ''))); 
        rawHtml = rawHtml.replace(/(?:<p>)?\[게이지:(.*?)\](?:<\/p>)?/g, (m, p1) => createBarGraphHtml(p1.replace(/<[^>]*>?/gm, ''))); 
        
        rawHtml = rawHtml.replace(/(?:<p>)?\[TIMELINE\]([\s\S]*?)\[\/TIMELINE\](?:<\/p>)?/g, (m, content) => {
            return createTimelineHtml(content.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>?/gm, ''));
        }); 
        
        rawHtml = rawHtml.replace(/(?:<p>)?\[RELATION_GRAPH\]([\s\S]*?)\[\/RELATION_GRAPH\](?:<\/p>)?/g, (m, content) => {
            return createRelationGraphHtml(content.replace(/<[^>]*>?/gm, ''));
        }); 

        return rawHtml;
    } catch (e) {
        return parseWikiText(markdownText).replace(/\n/g, '<br>');
    }
};