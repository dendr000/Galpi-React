// 파일 위치: src/utils/markdown/coreRenderer.js
import { marked } from 'marked';
import { parseWikiText } from './syntaxParser';
import {
    createRadarChartHtml,
    createBarGraphHtml,
    createLogTabHtml,
    createTimelineHtml,
    createRelationGraphHtml,
    createChatHtml
} from './macroBuilders';

export const renderMarkdown = (markdownText) => {
    if (!markdownText) return "";

    try {
        let parsedText = parseWikiText(markdownText);
        let rawHtml = marked.parse(parsedText, { breaks: true });
        
        rawHtml = rawHtml.replace(/(?:<p>)?\[스탯:(.*?)\](?:<\/p>)?/g, (m, p1) => createRadarChartHtml(p1.replace(/<[^>]*>?/gm, ''))); 
        rawHtml = rawHtml.replace(/(?:<p>)?\[게이지:(.*?)\](?:<\/p>)?/g, (m, p1) => createBarGraphHtml(p1.replace(/<[^>]*>?/gm, ''))); 
        
        rawHtml = rawHtml.replace(/(?:<p>)?\[로그탭:(.*?):\]?([\s\S]*?)\[\/로그탭\](?:<\/p>)?/g, (m, tabColor, content) => {
            return createLogTabHtml(tabColor.trim(), content.trim());
        });
        rawHtml = rawHtml.replace(/(?:<p>)?\[로그탭:(.*?):([\s\S]*?)\](?:<\/p>)?/g, (m, tabColor, content) => {
            return createLogTabHtml(tabColor.trim(), content.trim());
        });

        rawHtml = rawHtml.replace(/(?:<p>)?\[TIMELINE\]([\s\S]*?)\[\/TIMELINE\](?:<\/p>)?/g, (m, content) => {
            return createTimelineHtml(content.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>?/gm, ''));
        }); 
        
        rawHtml = rawHtml.replace(/(?:<p>)?\[RELATION_GRAPH\]([\s\S]*?)\[\/RELATION_GRAPH\](?:<\/p>)?/g, (m, content) => {
            return createRelationGraphHtml(content.replace(/<[^>]*>?/gm, ''));
        }); 

        // ★ 누락된 대화/우대화 매크로 정규식 치환 복구
        rawHtml = rawHtml.replace(/(?:<p>)?\[(대화|우대화):(.*?):\]?([\s\S]*?)\](?:<\/p>)?/g, (m, type, name, msg) => {
            return createChatHtml(type, name, msg);
        });

        return rawHtml;
    } catch (e) {
        return parseWikiText(markdownText).replace(/\n/g, '<br>');
    }
};