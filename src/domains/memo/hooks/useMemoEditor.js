// 파일 위치: src/domains/memo/hooks/useMemoEditor.js
// 기능 요약: 에디터 렌더링에 필요한 API 통신, 폰트 글로벌 CSS 동적 주입, 하위 서식 모듈 훅을 결합하는 중앙 관제탑

import { useState, useEffect, useRef } from 'react';
import { useMemoSave } from './useMemoSave';
import { useMemoFormat } from './useMemoFormat';
import { useMemoEvents } from './useMemoEvents';
import { useMemoFootnote } from './useMemoFootnote';
import { useMemoTableCtrl } from './useMemoTableCtrl';
import { useMemoFindReplace } from './useMemoFindReplace';
import { useMemoLink } from './useMemoLink';
import { useMemoBlockDrag } from './useMemoBlockDrag';
import api from '../../../api/axiosCore';
import { useBoilerplateCore } from '../../fab_tools/hooks/useBoilerplateCore';
import { useBoilerplateListener } from '../../fab_tools/hooks/useBoilerplateListener';
import { useMemoAutoSave } from './useMemoAutoSave';
import { useMemoBookmark } from './useMemoBookmark';
import { useModalStore } from '../../../store/useModalStore';

export const useMemoEditor = ({ activeMemo, memoData, setMemoData, currentFolder, setActiveMemoId, navigate }) => {
  const { openModal } = useModalStore();
  const editorRef = useRef(null);
  const titleRef = useRef(null);
  const activeCellRef = useRef(null);
  
  const [charCount, setCharCount] = useState({ selected: 0, total: 0 });
  const [memoTags, setMemoTags] = useState("");
  const [globalBpList, setGlobalBpList] = useState([]);
  
  // ★ 신규 추가: 백엔드에서 스캔된 폰트 목록 상태
  const [fontList, setFontList] = useState([]);

  const updateCharCount = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    const total = text.replace(/\s/g, '').length;
    const selection = window.getSelection();
    let selected = 0;
    if (selection.rangeCount > 0 && !selection.isCollapsed && editorRef.current.contains(selection.anchorNode)) {
        selected = selection.toString().replace(/\s/g, '').length;
    }
    setCharCount({ selected, total });
  };

  useEffect(() => {
    if (!activeMemo) return;
    if (titleRef.current) titleRef.current.value = activeMemo.title || '';
    if (editorRef.current) {
      let content = activeMemo.content || "";
      if (!content.includes('<div') && !content.includes('<br') && !content.includes('') && content.includes('\n')) {
        content = content.replace(/\n/g, '');
      }
      editorRef.current.innerHTML = content;
      updateCharCount();
      
      // ★ 새 메모장을 켜더라도 로컬 스토리지에 기억된 디폴트 폰트를 자동으로 씌움
      const savedFont = localStorage.getItem('galpi-default-font') || 'default';
      editorRef.current.style.fontFamily = savedFont === 'default' ? 'inherit' : `'${savedFont}', sans-serif`;
    }
    setMemoTags(activeMemo.tags || "");
  }, [activeMemo?.id]);

  useEffect(() => {
    api.get('/api/boilerplates').then(res => setGlobalBpList(res.data)).catch(() => {});
    
    // ★ 신규 추가: 백엔드 폰트 스캔 API 연동 및 글로벌 CSS 강제 주입
    api.get('/api/fonts').then(res => {
      if (res.data && res.data.length > 0) {
        setFontList(res.data);
        const styleId = 'galpi-dynamic-fonts';
        if (!document.getElementById(styleId)) {
          const style = document.createElement('style');
          style.id = styleId;
          let css = '';
          res.data.forEach(f => {
            // 외부 폴더 경로(/fonts/)로 font-face 선언을 동적 생성
            css += `@font-face { font-family: '${f.fontFamily}'; src: url('/fonts/${f.filename}'); }\n`;
          });
          style.innerHTML = css;
          document.head.appendChild(style);
        }
      }
    }).catch(e => console.warn("[useMemoEditor] 폰트 스캔 실패:", e));
  }, []);

  const saveHooks = useMemoSave({
    activeMemo, memoData, setMemoData, currentFolder, setActiveMemoId,
    titleRef, editorRef, memoTags
  });

  useMemoAutoSave({
    editorRef,
    titleRef,
    saveMemo: saveHooks.saveMemo,
    activeMemoId: activeMemo?.id
  });

  const formatHooks = useMemoFormat({ editorRef, updateCharCount });
  const findReplaceHooks = useMemoFindReplace({ editorRef, updateCharCount });

  const tableCtrlHooks = useMemoTableCtrl({
    editorRef, activeCellRef, updateCharCount,
    setFindReplaceVisible: findReplaceHooks.setFindReplaceVisible
  });

  const footnoteHooks = useMemoFootnote(editorRef, updateCharCount, saveHooks.saveMemo);
  const linkHooks = useMemoLink({ updateCharCount, saveMemo: saveHooks.saveMemo });
  useMemoBlockDrag({ editorRef, updateCharCount, saveMemo: saveHooks.saveMemo });
  const bookmarkHooks = useMemoBookmark({ editorRef, updateCharCount, saveMemo: saveHooks.saveMemo });

  const bpCore = useBoilerplateCore();
  useBoilerplateListener({ globalBpList, bpCore });

  const openTemplateList = () => {
    bpCore.openTemplateList(globalBpList, editorRef.current);
  };

  const saveAsTemplate = () => {
    const sel = window.getSelection();
    if (!sel.rangeCount || sel.isCollapsed) {
      alert("템플릿으로 저장할 텍스트나 표를 먼저 드래그(선택)해 주십시오.");
      return;
    }

    const range = sel.getRangeAt(0);
    const div = document.createElement('div');
    div.appendChild(range.cloneContents());

    let html = div.innerHTML;
    html = html.replace(/data-id="fn_[^"]+"/g, 'data-id="fn_template"');

    localStorage.setItem('galpi-draft-bp', html);
    openModal('boilerplate');
  };

  const eventHooks = useMemoEvents({
    editorRef,
    saveMemo: saveHooks.saveMemo,
    updateCharCount,
    checkTableFocus: tableCtrlHooks.checkTableFocus,
    insertFootnote: footnoteHooks.insertFootnote,
    handleFootnoteClick: footnoteHooks.handleFootnoteClick,
    triggerLinkEdit: linkHooks.triggerLinkEdit,
    closeLinkPopover: linkHooks.closeLinkPopover,
    insertBookmark: bookmarkHooks.insertBookmark,
    openBookmarkModal: bookmarkHooks.openBookmarkModal,
    navigate,
    setActiveMemoId
  });

  return {
    editorRef, titleRef, charCount,
    memoTags, setMemoTags,
    ...saveHooks,
    ...formatHooks,
    ...tableCtrlHooks,
    ...findReplaceHooks,
    ...eventHooks,
    footnoteHooks,
    linkHooks,
    bookmarkHooks,
    bpPopupState: bpCore.bpPopupState,
    commitBpExpansion: bpCore.commitBpExpansion,
    updatePopupState: bpCore.updatePopupState,
    openTemplateList, 
    saveAsTemplate,
    fontList // ★ 툴바 UI로 폰트 목록 전달
  };
};