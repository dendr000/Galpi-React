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
      let headCol = false;
      let noRowHeader = false;
      let text = rawCell;

      // 옵션 태그 파싱 (예: <left>, <-2>, <|3>, <h>, <nr> 등)
      // 변경: <strong> 등 HTML 태그를 옵션으로 오인하지 않도록 엄격한 정규식으로 방어
      let match = text.match(/^<([a-z0-9,\-|]+)>/i);
      if (match) {
        let isValid = false;
        match[1].split(',').forEach(tag => {
          const t = tag.trim();
          if (['left', 'center', 'right'].includes(t)) { align = t; isValid = true; }
          else if (t.startsWith('-') && !isNaN(parseInt(t.substring(1)))) { colSpan = parseInt(t.substring(1)); isValid = true; }
          else if (t.startsWith('|') && !isNaN(parseInt(t.substring(1)))) { rowSpan = parseInt(t.substring(1)); isValid = true; }
          else if (t === 'h') { headCol = true; isValid = true; }
          else if (t === 'nr') { noRowHeader = true; isValid = true; }
        });
        if (isValid) text = text.substring(match[0].length).trim();
      }

      // 셀 전체가 통째로 감싸진 서식 확인 — 저장 시 감싼 순서(굵게 바깥 → 기울임 → 취소선 안쪽)의
      // 역순으로 벗겨낸다. 부분(일부 글자만) 서식은 여기서 걸러지지 않고 원문 그대로 남아있다가
      // 렌더링 시점(syntaxParser.js)에 인라인으로 해석된다.
      if (text.length > 1 && text.startsWith('~') && text.endsWith('~')) {
        bold = true;
        text = text.substring(1, text.length - 1).trim();
      }
      if (text.length > 1 && text.startsWith('_') && text.endsWith('_')) {
        italic = true;
        text = text.substring(1, text.length - 1).trim();
      }
      if (text.length > 3 && text.startsWith('--') && text.endsWith('--')) {
        strike = true;
        text = text.substring(2, text.length - 2).trim();
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
        strike,
        headCol,
        noRowHeader
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
      // 변경: cell.align !== 'left' 조건을 지워 좌측 정렬 태그(<left>)도 무조건 생성되게 강제함
      if (cell.align) {
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

      // 열 헤더 지정 옵션 부여 (0번 행은 위치만으로 이미 헤더라 굳이 안 붙여도 되지만,
      // 붙어 있어도 렌더러 쪽에서 무해하게 무시되므로 조건 없이 그대로 반영한다)
      if (cell.headCol) {
        options.push('h');
      }

      // 0번 행인데도 "행 헤더 끄기"로 옵트아웃된 셀이면, 렌더러가 위치만 보고 다시
      // th로 되살리지 않도록 명시적으로 표시해둔다.
      if (cell.noRowHeader) {
        options.push('nr');
      }

      let optionPrefix = options.length > 0 ? `<${options.join(',')}> ` : '';

      // 텍스트 내부 줄바꿈 변환 (\n -> [br])
      let processedText = cell.text ? cell.text.replace(/\n/g, ' [br] ') : ' ';

      // 서식 적용 (셀 전체 토글 플래그 기준) — 안쪽부터 취소선, 기울임, 굵게 순으로 감싸서
      // 렌더러가 굵게(바깥) → 기울임 → 취소선(안쪽) 순으로 벗겨내며 중첩 해석할 수 있게 한다.
      // ★ 예전엔 italic/strike가 여기서 빠져 있어서 에디터 미리보기엔 반영되는데 정작
      // 저장(마크다운 변환) 시에는 통째로 사라지는 버그였다.
      if (cell.strike) processedText = `--${processedText}--`;
      if (cell.italic) processedText = `_${processedText}_`;
      if (cell.bold) processedText = `~${processedText}~`;

      rowStr += ` ${optionPrefix}${processedText} ||`;
    });
    markdown += `${rowStr}\n`;
  });

  console.log("[generateMarkdownFromGrid] 생성된 마크다운 결과:\n", markdown);
  return markdown + '\n';
};