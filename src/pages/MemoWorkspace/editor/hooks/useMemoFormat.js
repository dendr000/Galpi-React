// 파일 위치: src/pages/MemoWorkspace/editor/hooks/useMemoFormat.js
import { useState } from 'react';

export const useMemoFormat = ({ editorRef, updateCharCount }) => {
  const [findReplaceVisible, setFindReplaceVisible] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");

  // 기본 서식(볼드, 이탤릭 등) 적용
  const executeCmd = (cmd) => {
    editorRef.current.focus();
    document.execCommand(cmd, false, null);
    updateCharCount();
  };

  // 매크로(표, 할일 등) HTML 삽입
  const insertHtml = (htmlContent) => {
    editorRef.current.focus();
    document.execCommand('insertHTML', false, htmlContent);
    updateCharCount();
  };

  // 찾기 및 일괄 치환 로직
  const executeFindReplace = () => {
    console.log(`[useMemoFormat] 찾기/바꾸기 일괄 치환 실행: ${findText} -> ${replaceText}`);
    if (!findText) return alert("찾을 내용을 입력하세요.");
    if (!editorRef.current) return;
    
    let repHtml = replaceText.replace(/\\n/g, '<br>');
    const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = []; 
    let node;
    
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }
    
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
            while(tempDiv.firstChild) { 
              fragment.appendChild(tempDiv.firstChild); 
            }
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
    findText, setFindText,
    replaceText, setReplaceText,
    executeCmd, insertHtml, executeFindReplace
  };
};