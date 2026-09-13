// 파일 위치: src/utils/markdown/syntaxParser.js
import { injectMacroStyles } from './styleInjector';

export const parseWikiText = (text) => {
    if (!text) return "";
    injectMacroStyles(); // 글로벌 CSS 안전 주입
    let preText = text;

    preText = preText.replace(/\[RELATION_GRAPH\]/g, '▤REL_START▤');
    preText = preText.replace(/\[\/RELATION_GRAPH\]/g, '▤REL_END▤');
    preText = preText.replace(/\[META_DATA:/g, '▤META_START▤:');

    preText = preText.replace(/\[폰트:(.*?):([\s\S]*?)\]/g, (match, fontName, content) => {
        const fontMap = { '궁서': "'Gungsuh', '궁서', serif", '바탕': "'Batang', '바탕', serif", '돋움': "'Dotum', '돋움', sans-serif", '굴림': "'Gulim', '굴림', sans-serif", '명조': "'Noto Serif KR', serif" };
        // ★ 하드코딩된 폰트가 아닐 경우, 동적 주입된 폰트 이름(displayName)을 폰트 패밀리로 렌더링하도록 픽스
        const family = fontMap[fontName.trim()] || `'${fontName.trim()}', sans-serif`;
        return `<span style="font-family: ${family};">${content}</span>`;
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
                tableBuffer.push('<div style="overflow-x:auto; margin: 15px 0;"><table class="gt-table" style="width:100%; border-collapse:collapse; background:var(--surface-color); font-size:13px; border-radius:8px; border-style:hidden; box-shadow:0 0 0 1px var(--border-color), 0 2px 8px rgba(0,0,0,0.02);"><tbody>');
            }
            let cells = trimmed.substring(2, trimmed.length - 2).split('||');
            let isHeaderRow = tableBuffer.length === 1;
            tableBuffer.push('<tr style="border-bottom: 1px solid var(--border-color); transition: background 0.2s;">');

            cells.forEach(cell => {
                let cellContent = cell.trim();
                let align = isHeaderRow ? 'center' : 'left'; // 헤더는 중앙, 내용은 좌측을 기본값으로 지정
                let colSpan = 1;
                let rowSpan = 1;
                let headCol = false;
                let noRowHeader = false;

                let match = cellContent.match(/^<([a-z0-9,\-|]+)>/i);
                if (match) {
                    let isValid = false;
                    match[1].split(',').forEach(tag => {
                        let t = tag.trim();
                        if (['left', 'center', 'right'].includes(t)) { align = t; isValid = true; }
                        else if (t.startsWith('-') && !isNaN(parseInt(t.substring(1)))) { colSpan = parseInt(t.substring(1)); isValid = true; }
                        else if (t.startsWith('|') && !isNaN(parseInt(t.substring(1)))) { rowSpan = parseInt(t.substring(1)); isValid = true; }
                        else if (t === 'h') { headCol = true; isValid = true; }
                        else if (t === 'nr') { noRowHeader = true; isValid = true; }
                    });
                    if (isValid) cellContent = cellContent.substring(match[0].length).trim();
                }

                // 표 편집기(TableEditor)에서 "열 헤더" 토글로 지정한 열은 0번 행이 아니어도
                // th로 렌더링한다 — 0번 행(isHeaderRow)과는 독립적인, 별도의 열 기준 헤더 지정.
                // 반대로 <nr> 태그가 붙은 0번 행 셀은 "행 헤더 끄기"로 옵트아웃된 것이므로
                // 위치만 보고 무조건 th로 되돌리지 않는다.
                let isHeaderCell = (isHeaderRow && !noRowHeader) || headCol;

                // ★ 표 매크로 에디터(markdownTableParser.js)가 굵게를 ~내용~ 으로 저장하는데,
                // 여기서 이 기호를 처리하지 않아 렌더링 시 물결표가 그대로 노출되던 버그를 수정.
                // 셀 전체를 감싼 경우뿐 아니라 문장 중 일부만 감싼 경우도 똑같이 처리한다.
                // 굵게(바깥) → 기울임 → 취소선(안쪽) 순으로 풀어야 에디터가 중첩 저장한 순서와 맞는다.
                cellContent = cellContent.replace(/~(.+?)~/g, '<strong>$1</strong>');
                cellContent = cellContent.replace(/_(.+?)_/g, '<em>$1</em>');
                cellContent = cellContent.replace(/--(.+?)--/g, '<del style="opacity:0.6;">$1</del>');

                let bg = isHeaderCell ? 'background:var(--table-bg-alt); font-weight:900; color:var(--primary-color);' : 'color:var(--text-primary);';
                let tag = isHeaderCell ? 'th' : 'td';
                
                let attrs = '';
                if (colSpan > 1) attrs += ` colspan="${colSpan}"`;
                if (rowSpan > 1) attrs += ` rowspan="${rowSpan}"`;

                tableBuffer.push(`<${tag}${attrs} style="border:1px solid var(--border-color); padding:10px 14px; text-align:${align}; ${bg}">${cellContent}</${tag}>`);
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

    // ★ 누락되었던 백링크 [[문서명]] 파싱 정규식 추가
    preText = preText.replace(/\[\[(.*?)\]\]/g, '<span class="wiki-backlink">$1</span>');

    // ★ 각주 [* 내용] 파서 강화 (멀티라인 감지 및 br 태그 치환으로 팝오버 줄바꿈 허용)
    let fnCount = 1;
    preText = preText.replace(/\[\*([\s\S]*?)\]/g, (match, content) => {
        const num = fnCount++;
        const escaped = content.trim().replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
        return `<sup class="wiki-footnote" data-content="${escaped}" style="cursor:help; color:var(--primary-color); font-weight:bold;">[${num}]</sup>`;
    });

    return preText;
};