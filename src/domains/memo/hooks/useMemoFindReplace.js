// 파일 위치: src/components/layout/fab/memo/hooks/useMemoFindReplace.js
// 기능 요약: 에디터 본문 텍스트 일괄 찾아 바꾸기 기능 전담 훅
// 버전: v1.0.0
import { useState } from 'react';

export const useMemoFindReplace = ({ editorRef, updateCharCount }) => {
  const [findReplaceVisible, setFindReplaceVisible] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");

  const executeFindReplace = () => {
    console.log(`[useMemoFindReplace] 찾아 바꾸기 실행: ${findText} -> ${replaceText}`);
    if (!findText) return alert("찾을 내용을 입력하세요.");
    if (!editorRef.current) return;

    let repHtml = replaceText.replace(/\n/g, '<br>');
    const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) textNodes.push(node);
    
    let changed = false;
    textNodes.forEach(textNode => {
      if (textNode.nodeValue.includes(findText)) {
        const parts = textNode.nodeValue.split(findText);
        const fragment = document.createDocumentFragment();
        
        parts.forEach((part, index) => {
          fragment.appendChild(document.createTextNode(part));
          if (index < parts.length - 1) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = repHtml;
            while(tempDiv.firstChild) { fragment.appendChild(tempDiv.firstChild); }
          }
        });
        textNode.parentNode.replaceChild(fragment, textNode);
        changed = true;
      }
    });
    
    if (changed) {
      updateCharCount();
      alert("일괄 변경이 완료되었습니다.");
    } else {
      alert("일치하는 내용을 찾을 수 없습니다.");
    }
  };

  return {
    findReplaceVisible, setFindReplaceVisible,
    findText, setFindText, replaceText, setReplaceText, executeFindReplace
  };
};