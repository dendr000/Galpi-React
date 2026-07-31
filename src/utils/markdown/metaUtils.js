// 파일 위치: src/utils/markdown/metaUtils.js
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