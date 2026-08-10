// 파일 위치: src/domains/memo/shared/hooks/useMemoLink.js
import { useState, useEffect, useRef } from 'react';

export const useMemoLink = ({ updateCharCount, saveMemo }) => {
  const [linkPopover, setLinkPopover] = useState({ isOpen: false, mode: 'view', x: 0, y: 0, url: '', text: '', range: null, targetNode: null });
  const timeoutRef = useRef(null);

  const triggerLinkEdit = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) {
        alert("링크를 걸 단어를 먼저 드래그(선택)해 주십시오.");
        return;
    }

    const range = selection.getRangeAt(0);
    const text = selection.toString().trim();
    if (!text) {
         alert("링크를 걸 단어를 먼저 드래그(선택)해 주십시오.");
         return;
    }

    const rect = range.getBoundingClientRect();
    setLinkPopover({
      isOpen: true,
      mode: 'edit',
      x: rect.left,
      y: rect.bottom + 8,
      url: '',
      text: text,
      range: range.cloneRange(),
      targetNode: null
    });
  };

  // ★ 기존 링크를 수정하기 위해 툴팁 클릭 시 모드를 전환하는 함수
  const editExistingLink = () => {
    if (linkPopover.targetNode) {
      setLinkPopover(prev => ({
        ...prev,
        mode: 'edit',
        url: prev.targetNode.getAttribute('href'),
        text: prev.targetNode.innerText
      }));
    }
  };

  // ★ 기존 링크를 파괴하고 일반 텍스트로 되돌리는 함수
  const deleteLink = () => {
    if (linkPopover.targetNode) {
      const textNode = document.createTextNode(linkPopover.targetNode.innerText);
      linkPopover.targetNode.parentNode.replaceChild(textNode, linkPopover.targetNode);
      if (updateCharCount) updateCharCount();
      if (saveMemo) setTimeout(saveMemo, 100);
    }
    closeLinkPopover();
  };

  const applyLink = (url, newText) => {
    if (!url.trim()) {
         closeLinkPopover();
         return;
    }

    if (linkPopover.targetNode) {
      // 1. 이미 존재하는 링크 텍스트 및 주소 수정
      linkPopover.targetNode.setAttribute('href', url.trim());
      if (newText && newText.trim() !== '') {
          linkPopover.targetNode.innerText = newText.trim();
      }
      if (updateCharCount) updateCharCount();
      if (saveMemo) setTimeout(saveMemo, 100);
    } else if (linkPopover.range) {
      // 2. 새로운 링크 생성
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(linkPopover.range);

      const displayText = (newText && newText.trim() !== '') ? newText.trim() : linkPopover.text;
      
      // ★ 인라인 스타일에도 CSS 변수 대신 고정 Hex 코드(#3b5bdb)를 사용하여 보안 정책 우회
      const htmlLink = `<a href="${url.trim()}" class="memo-internal-link" style="color: #3b5bdb; text-decoration: none; font-weight: bold; cursor: pointer;">${displayText}</a>&nbsp;`;
      document.execCommand('insertHTML', false, htmlLink);
      
      if (updateCharCount) updateCharCount();
      if (saveMemo) setTimeout(saveMemo, 100);
    }
    closeLinkPopover();
  };

  const closeLinkPopover = () => setLinkPopover(prev => ({ ...prev, isOpen: false }));

  useEffect(() => {
    // ★ 브라우저 보안 정책(:visited에서 CSS 변수 무시)을 뚫기 위해 Hex 코드를 강제 주입하는 글로벌 스타일
    if (!document.getElementById('memo-link-override-styles')) {
      const style = document.createElement('style');
      style.id = 'memo-link-override-styles';
      style.innerHTML = `
        .memo-internal-link,
        .memo-internal-link:visited,
        .memo-internal-link:active {
          color: #3b5bdb !important; 
          text-decoration: none !important;
        }
        .memo-internal-link:hover {
          text-decoration: underline !important;
        }
      `;
      document.head.appendChild(style);
    }

    const handleOver = (e) => {
      const target = e.target.closest('.memo-internal-link');
      if (target) {
        clearTimeout(timeoutRef.current);
        const rect = target.getBoundingClientRect();
        setLinkPopover({
          isOpen: true,
          mode: 'view',
          x: rect.left,
          y: rect.bottom + 8,
          url: target.getAttribute('href'),
          text: target.innerText,
          range: null,
          targetNode: target // ★ 대상 링크 노드 기억
        });
      }
    };

    const handleOut = (e) => {
      const target = e.target.closest('.memo-internal-link');
      if (target) {
        timeoutRef.current = setTimeout(() => {
          setLinkPopover(prev => (prev.mode === 'view' ? { ...prev, isOpen: false } : prev));
        }, 200);
      }
    };

    document.addEventListener('mouseover', handleOver);
    document.addEventListener('mouseout', handleOut);
    return () => {
      document.removeEventListener('mouseover', handleOver);
      document.removeEventListener('mouseout', handleOut);
    };
  }, []);

  return { linkPopover, triggerLinkEdit, applyLink, editExistingLink, deleteLink, closeLinkPopover, timeoutRef };
};