import { marked } from 'marked';

// 메타데이터 추출 (util-meta.js)
export const extractMeta = (text) => {
  if (!text) return { clean: "", meta: {} };
  let meta = {}; let clean = text.replace(/^[\}\]\s,]+/, '').trim();
  const nlIdx = clean.indexOf('\n');
  const firstLine = nlIdx !== -1 ? clean.substring(0, nlIdx).trim() : clean;
  if (firstLine.startsWith("[META_DATA:") && firstLine.endsWith("]")) {
    try { meta = JSON.parse(firstLine.substring(11, firstLine.length - 1)); } catch(e) {}
    clean = nlIdx !== -1 ? clean.substring(nlIdx + 1).trim() : "";
  }
  return { clean: clean.replace(/^[\}\]\s,]+/, '').trim(), meta };
};

export const buildMetaStr = (desc, meta) => {
  if (!meta || Object.keys(meta).length === 0) return desc;
  return `[META_DATA:${JSON.stringify(meta)}]\n${desc ? desc.trim() : ""}`;
};

// 정규식 파서 (util-parser.js)
export const parseWikiText = (text) => {
  if(!text) return "";
  let p = text.replace(/\[RELATION_GRAPH\]/g, '▤REL_START▤').replace(/\[\/RELATION_GRAPH\]/g, '▤REL_END▤');
  const fMap = { '궁서': "'Gungsuh', serif", '바탕': "'Batang', serif", '돋움': "'Dotum', sans-serif", '굴림': "'Gulim', sans-serif", '명조': "'Noto Serif KR', serif" };
  p = p.replace(/\[폰트:(.*?):([\s\S]*?)\]/g, (m, f, c) => `<span style="font-family: ${fMap[f.trim()] || "inherit"};">${c}</span>`);
  p = p.replace(/\[크기:([0-9]+):([\s\S]*?)\]/g, (m, s, c) => `<span style="font-size: ${s}px;">${c}</span>`);
  p = p.replace(/\[정렬:(좌측|중앙|우측):([\s\S]*?)\]/g, (m, a, c) => `<div style="text-align: ${a==='중앙'?'center':a==='우측'?'right':'left'}; width:100%;">${c}</div>`);
  p = p.replace(/\[들여쓰기:([\s\S]*?)\]/g, (m, c) => `<div style="text-indent:1.5em;">${c.replace(/\n/g, '<br/>')}</div>`);
  p = p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  p = p.replace(/(^|\s)_([^\s_][^_]*[^\s_]|[^\s_])_(\s|[.,!?]|$)/g, '$1<em>$2</em>$3');
  p = p.replace(/(^|[^\\])--(?!\s)(.+?)(?<!\s)--/gm, '$1<del style="opacity:0.6;">$2</del>');
  p = p.replace(/\[([a-zA-Z0-9#-]+):([\s\S]*?)\]/g, (m, k, c) => {
    let color = k === 'red' ? '#e53e3e' : k === 'blue' ? 'var(--primary-color)' : k === 'black' ? 'var(--text-primary)' : k === 'white' ? '#fff' : k;
    let bg = k.startsWith('bg-') ? (k === 'bg-yellow' ? 'rgba(253,224,71,0.6)' : k.replace('bg-', '')) : 'transparent';
    if(k.startsWith('bg-')) color = 'var(--text-primary)';
    return `<span style="color:${color}; background-color:${bg}; font-weight:bold;">${c}</span>`;
  });
  return p.replace(/▤REL_START▤/g, '[RELATION_GRAPH]').replace(/▤REL_END▤/g, '[/RELATION_GRAPH]');
};

// 최종 HTML 생성
export const renderMarkdown = (markdownText) => {
  if (!markdownText) return "";
  let rawHtml = marked.parse(parseWikiText(markdownText));
  
  // (차후 리액트 컴포넌트인 <RadarChart />, <Timeline /> 으로 교체하기 위한 플레이스홀더를 심어둡니다)
  rawHtml = rawHtml.replace(/(?:<p>)?\[스탯:(.*?)\](?:<\/p>)?/g, (m, p) => `<div class="macro-radar" data-content="${p}">[스탯 차트 렌더링 영역]</div>`);
  rawHtml = rawHtml.replace(/(?:<p>)?\[게이지:(.*?)\](?:<\/p>)?/g, (m, p) => `<div class="macro-bar" data-content="${p}">[게이지 렌더링 영역]</div>`);
  rawHtml = rawHtml.replace(/(?:<p>)?\[TIMELINE\]([\s\S]*?)\[\/TIMELINE\](?:<\/p>)?/g, (m, c) => `<div class="macro-timeline" data-content="${encodeURIComponent(c)}">[타임라인 렌더링 영역]</div>`);
  
  // 채팅 매크로
  const chatRegex = /\[(대화|우대화):\s*(.*?)\](.*?)(?=(<br>|<\/p>|<\/div>|\[대화|\[우대화|$))/gm;
  if (chatRegex.test(rawHtml)) {
    rawHtml = rawHtml.replace(chatRegex, (m, type, name, msg) => `<div class="galpi-ext-msg ${type === '우대화' ? 'right' : ''}"><div class="galpi-ext-msg-name">${name.trim()}</div><div class="galpi-ext-msg-bubble">${msg.trim().replace(/^(&nbsp;|<br>|\s)+/, '')}</div></div>`);
    rawHtml = rawHtml.replace(/(<div class="galpi-ext-msg[\s\S]*?<\/div>\s*)+/g, m => `<div class="galpi-ext-chat-room">${m}</div>`);
  }

  // H1 자동 박스화
  const tempDiv = document.createElement('div'); tempDiv.innerHTML = rawHtml;
  let result = ""; let currentBox = ""; let hasH1 = false;
  Array.from(tempDiv.children).forEach(el => {
    if (el.tagName === 'H1') {
      hasH1 = true; if (currentBox) { result += `<div class="md-box">${currentBox}</div>`; currentBox = ""; }
      el.className = "md-h1"; result += el.outerHTML;
    } else currentBox += el.outerHTML;
  });
  if (currentBox) result += `<div class="md-box">${currentBox}</div>`;
  return hasH1 ? result : `<div class="md-box">${tempDiv.innerHTML}</div>`;
};