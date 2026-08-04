// 파일 위치: src/components/layout/fab/memo/hooks/useMemoFormat.js
// 기능 요약: 볼드, 이탤릭 및 HTML 태그 템플릿 삽입(execCommand) 전담 훅
// 버전: v2.0.0

export const useMemoFormat = ({ editorRef, updateCharCount }) => {
  const executeCmd = (cmd) => {
    console.log(`[useMemoFormat] 서식 명령어 주입: ${cmd}`);
    editorRef.current?.focus();
    document.execCommand(cmd, false, null);
    updateCharCount();
  };

  const insertHtml = (htmlContent) => {
    console.log("[useMemoFormat] HTML 템플릿 주입 실행");
    editorRef.current?.focus();
    document.execCommand('insertHTML', false, htmlContent);
    updateCharCount();
  };

  return { executeCmd, insertHtml };
};