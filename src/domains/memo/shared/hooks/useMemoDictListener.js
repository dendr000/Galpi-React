// 파일 위치: src/domains/memo/shared/hooks/useMemoDictListener.js
// 기능 요약: 메모장(ContentEditable) 내부에서 Alt+H 입력 시 고유명사 한자를 다중 순환 치환하는 물리 엔진
// 버전: v1.0.0

import { useEffect } from 'react';

export const useMemoDictListener = ({ editorRef, globalDictList }) => {
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleKeyDown = (e) => {
      // Alt + H 입력 감지
      if (e.altKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        e.stopPropagation();

        if (!globalDictList || globalDictList.length === 0) return;

        const selection = window.getSelection();
        if (!selection.rangeCount || !editor.contains(selection.anchorNode)) return;

        const range = selection.getRangeAt(0);
        const textNode = range.startContainer;
        
        // 텍스트 노드 내부에서만 작동하도록 안전장치
        if (textNode.nodeType !== Node.TEXT_NODE) return;

        const cursorOffset = range.startOffset;
        const textBeforeCursor = textNode.textContent.substring(0, cursorOffset);

        // 고유값(원문) 추출 및 정렬 (가장 긴 단어부터 매칭하여 짧은 단어 덮어쓰기 방지)
        const uniqueKeys = [...new Set(globalDictList.map(d => d.word))].sort((a, b) => b.length - a.length);

        for (let k of uniqueKeys) {
          const matchingDicts = globalDictList.filter(d => d.word === k);
          
          // 동적 순환 배열 생성: [ "초혼", "초혼(招魂)", ... ]
          const cycleList = [k];
          matchingDicts.forEach(dict => {
            const trans = dict.translation;
            const pureVal = trans.match(/\((.*?)\)/) ? trans.match(/\((.*?)\)/)[1] : trans.replace(k, '').replace(/[\(\)]/g, '');
            cycleList.push(`${k}(${pureVal})`);
          });

          let matchIndex = -1;
          let matchLength = 0;

          // 긴 길이부터 비교
          const sortedCycleList = [...cycleList].map((val, idx) => ({val, idx})).sort((a, b) => b.val.length - a.val.length);

          for (let item of sortedCycleList) {
            if (textBeforeCursor.endsWith(item.val)) {
              matchIndex = item.idx;
              matchLength = item.val.length;
              break;
            }
          }

          if (matchIndex !== -1) {
            // 다음 인덱스로 순환 이동
            const nextIndex = (matchIndex + 1) % cycleList.length;
            const rep = cycleList[nextIndex];

            // Range 조작을 통해 매칭된 길이만큼 선택 영역으로 잡은 뒤 execCommand로 덮어씌움 (Undo 내역 보존)
            range.setStart(textNode, cursorOffset - matchLength);
            range.setEnd(textNode, cursorOffset);
            selection.removeAllRanges();
            selection.addRange(range);
            
            document.execCommand('insertText', false, rep);
            break;
          }
        }
      }
    };

    editor.addEventListener('keydown', handleKeyDown);
    return () => {
      editor.removeEventListener('keydown', handleKeyDown);
    };
  }, [editorRef, globalDictList]);
};