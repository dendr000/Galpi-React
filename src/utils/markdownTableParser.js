// 절대 경로: src/utils/markdownTableParser.js
// 기능 요약: 나무위키 스타일의 마크다운 표 문자열과 객체 그리드 간의 상호 변환(Parsing & Generation)을 담당하는 유틸리티 v1.0.0

/**
 * 나무위키 마크다운 표 문자열을 객체 그리드(Grid) 구조로 파싱합니다.
 */
export const parseMarkdownToGrid = (mdText) => {
  console.log("[parseMarkdownToGrid] 마크다운 표 파싱 시작");
  if (!mdText || typeof mdText !== 'string' || !mdText.includes('||')) {
    return null;
  }

  const lines = mdText.trim().split('\n');
  const rawRows = [];

  lines.forEach(line => {
    let trimmed = line.trim();
    if (trimmed.startsWith('||') && trimmed.endsWith('||')) {
      // 양 끝의 '||' 제거 후 내부 셀 단위로 분할
      const inner = trimmed.substring(2, trimmed.length - 2);
      const rawCells = inner.split('||');
      rawRows.push(rawCells);
    }
  });

  if (rawRows.length === 0) return null;

  // 최대 열 개수 계산
  const maxCols = Math.max(...rawRows.map(r => r.length));
  
  // 그리드 기본 뼈대 생성
  let grid = rawRows.map((row, rIdx) => {
    return Array.from({ length: maxCols }, (_, cIdx) => {
      const rawCell = row[cIdx] !== undefined ? row[cIdx].trim() : '';
      
      let align = rIdx === 0 ? 'center' : 'left';
      let colSpan = 1;
      let rowSpan = 1;
      let bold = false;
      let italic = false;
      let strike = false;
      let text = rawCell;

      // 옵션 태그 파싱 (예: <left>, <-2>, <|3>, ~ 등)
      if (text.startsWith('<') && text.includes('>')) {
        const closeIdx = text.indexOf('>');
        const tagContent = text.substring(1, closeIdx);
        text = text.substring(closeIdx + 1).trim();

        tagContent.split(',').forEach(tag => {
          const t = tag.trim();
          if (t === 'left') align = 'left';
          else if (t === 'center') align = 'center';
          else if (t === 'right') align = 'right';
          else if (t.startsWith('-')) {
            const spanNum = parseInt(t.substring(1), 10);
            if (!isNaN(spanNum)) colSpan = spanNum;
          } else if (t.startsWith('|')) {
            const spanNum = parseInt(t.substring(1), 10);
            if (!isNaN(spanNum)) rowSpan = spanNum;
          }
        });
      }

      // 굵은 서식 확인 (~)
      if (text.startsWith('~') && text.endsWith('~')) {
        bold = true;
        text = text.substring(1, text.length - 1).trim();
      }

      // 줄바꿈 복원 ([br] -> \n)
      text = text.replace(/\[br\]/g, '\n');

      return {
        text,
        align,
        rowSpan,
        colSpan,
        isHidden: false,
        bold,
        italic,
        strike
      };
    });
  });

  console.log("[parseMarkdownToGrid] 파싱 완료:", grid);
  return grid;
};

/**
 * 객체 그리드(Grid) 구조를 나무위키 스타일의 마크다운 표 문자열로 변환합니다.
 */
export const generateMarkdownFromGrid = (grid) => {
  console.log("[generateMarkdownFromGrid] 마크다운 표 생성 시작");
  if (!grid || grid.length === 0) return '';

  let markdown = '\n';

  grid.forEach(row => {
    let rowStr = '||';
    row.forEach(cell => {
      if (cell.isHidden) return; // 숨겨진 셀은 렌더링 건너뜀

      let options = [];

      // 정렬 옵션 부여
      if (cell.align && cell.align !== 'left') {
        options.push(cell.align);
      }

      // 가로 병합 옵션 부여 (colSpan > 1)
      if (cell.colSpan > 1) {
        options.push(`-${cell.colSpan}`);
      }

      // 세로 병합 옵션 부여 (rowSpan > 1)
      if (cell.rowSpan > 1) {
        options.push(`|${cell.rowSpan}`);
      }

      let optionPrefix = options.length > 0 ? `<${options.join(',')}> ` : '';

      // 텍스트 내부 줄바꿈 변환 (\n -> [br])
      let processedText = cell.text ? cell.text.replace(/\n/g, ' [br] ') : ' ';

      // 굵은 서식 적용
      if (cell.bold) {
        processedText = `~${processedText}~`;
      }

      rowStr += ` ${optionPrefix}${processedText} ||`;
    });
    markdown += `${rowStr}\n`;
  });

  console.log("[generateMarkdownFromGrid] 생성된 마크다운 결과:\n", markdown);
  return markdown + '\n';
};