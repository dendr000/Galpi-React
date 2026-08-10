// 파일 위치: src/domains/memo/shared/hooks/useMemoFormat.js
// 기능 요약: 볼드, 기울임, 템플릿 삽입 및 폰트 변경(전체/부분) 등 HTML 기반(execCommand) 텍스트 포맷 제어 물리 엔진

export const useMemoFormat = ({ editorRef, updateCharCount }) => {
  const executeCmd = (cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    updateCharCount();
  };

  const insertHtml = (html) => {
    editorRef.current?.focus();
    document.execCommand('insertHTML', false, html);
    updateCharCount();
  };

  // ★ 신규 추가: 폰트 적용 물리 엔진 (부분 드래그 및 전체 디폴트 설정 동시 지원)
  const applyFont = (fontName) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const sel = window.getSelection();

    // 1. 드래그(선택) 영역이 존재할 경우 -> 해당 글자만 폰트 변경 (<font face="..."> 태그 자동 주입)
    if (sel.rangeCount > 0 && !sel.isCollapsed && editorRef.current.contains(sel.anchorNode)) {
      document.execCommand('fontName', false, fontName === 'default' ? 'inherit' : fontName);
    } 
    // 2. 드래그가 없을 경우 -> 에디터 전체의 기본 폰트를 변경하고 로컬 스토리지에 영구 기억
    else {
      localStorage.setItem('galpi-default-font', fontName);
      editorRef.current.style.fontFamily = fontName === 'default' ? 'inherit' : `'${fontName}', sans-serif`;
    }
    updateCharCount();
  };

  return { executeCmd, insertHtml, applyFont };
};