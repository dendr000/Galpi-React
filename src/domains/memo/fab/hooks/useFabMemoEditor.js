// 파일 위치: src/domains/memo/fab/hooks/useFabMemoEditor.js
import { useState, useEffect, useRef } from 'react';
import { useMemoSave } from '../../shared/hooks/useMemoSave';
import { useMemoFormat } from '../../shared/hooks/useMemoFormat';
import { useMemoEvents } from '../../shared/hooks/useMemoEvents';
import { useMemoFootnote } from '../../shared/hooks/useMemoFootnote';
import { useMemoTableCtrl } from '../../shared/hooks/useMemoTableCtrl';
import { useMemoFindReplace } from '../../shared/hooks/useMemoFindReplace';
import { useMemoLink } from '../../shared/hooks/useMemoLink';
import { useMemoBlockDrag } from '../../shared/hooks/useMemoBlockDrag';
import api from '../../../../api/axiosCore';
import { useBoilerplateCore } from '../../../fabTools/boilerplate/hooks/useBoilerplateCore';
import { useBoilerplateListener } from '../../../fabTools/boilerplate/hooks/useBoilerplateListener';
import { useMemoAutoSave } from '../../shared/hooks/useMemoAutoSave';
import { useMemoBookmark } from '../../shared/hooks/useMemoBookmark';
import { useMemoDictListener } from '../../shared/hooks/useMemoDictListener';
import { useModalStore } from '../../../../store/useModalStore';

export const useFabMemoEditor = ({ activeMemo, memoData, setMemoData, currentFolder, setActiveMemoId, navigate }) => {
  const { openModal } = useModalStore();
  const editorRef = useRef(null);
  const titleRef = useRef(null);
  const activeCellRef = useRef(null);
  
  const [charCount, setCharCount] = useState({ selected: 0, total: 0 });
  const [memoTags, setMemoTags] = useState("");
  const [globalBpList, setGlobalBpList] = useState([]);
  const [globalDictList, setGlobalDictList] = useState([]);
  const [fontList, setFontList] = useState([]);

  const [isAutoSnippet, setIsAutoSnippet] = useState(() => localStorage.getItem('galpi-bp-preview') !== 'false');

  const toggleAutoSnippet = () => {
    const nextState = !isAutoSnippet;
    setIsAutoSnippet(nextState);
    localStorage.setItem('galpi-bp-preview', String(nextState));
  };

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
      if (!content.includes('<div') && !content.includes('<br') && !content.includes('</p>') && content.includes('\n')) {
        content = content.replace(/\n/g, '<br>');
      }
      editorRef.current.innerHTML = content;
      updateCharCount();
      
      const savedFont = localStorage.getItem('galpi-default-font') || 'default';
      editorRef.current.style.fontFamily = savedFont === 'default' ? 'inherit' : `'${savedFont}', sans-serif`;
    }
    setMemoTags(activeMemo.tags || "");
  }, [activeMemo?.id]);

  useEffect(() => {
    api.get('/api/boilerplates').then(res => setGlobalBpList(res.data)).catch(() => {});
    
    const searchParams = new URLSearchParams(window.location.search);
    const currentWorkId = searchParams.get('workId') || searchParams.get('id') || window.location.pathname.match(/\/work\/(\d+)/)?.[1] || 'global';
    
    const fetchDictionaries = async () => {
      try {
        const globalRes = await api.get('/api/dicts?workId=global');
        let combinedList = globalRes.data;

        if (currentWorkId && currentWorkId !== 'global') {
          const localRes = await api.get(`/api/dicts?workId=${currentWorkId}`);
          combinedList = [...combinedList, ...localRes.data];
        }
        const uniqueList = combinedList.filter((v, i, a) => 
          a.findIndex(t => (t.word === v.word && t.translation === v.translation)) === i
        );
        setGlobalDictList(uniqueList);
      } catch (e) {
        console.error("사전 데이터 로드 실패", e);
      }
    };
    fetchDictionaries();
    
    api.get('/api/fonts').then(res => {
      if (res.data && res.data.length > 0) {
        const sortedFonts = res.data.sort((a, b) => a.displayName.localeCompare(b.displayName, 'ko-KR'));
        setFontList(sortedFonts);

        const styleId = 'galpi-dynamic-fonts';
        if (!document.getElementById(styleId)) {
          const style = document.createElement('style');
          style.id = styleId;
          let css = '';
          sortedFonts.forEach(f => {
            css += `@font-face { font-family: '${f.fontFamily}'; src: url('/fonts/${f.filename}'); }\n`;
          });
          style.innerHTML = css;
          document.head.appendChild(style);
        }
      }
    }).catch(e => console.warn("[useFabMemoEditor] 폰트 스캔 실패:", e));
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
  
  useMemoDictListener({ editorRef, globalDictList });

  const openTemplateList = () => {
    bpCore.openTemplateList(globalBpList, editorRef.current);
  };

  const saveAsTemplate = () => {
    const sel = window.getSelection();
    if (!sel.rangeCount || sel.isCollapsed) {
      localStorage.setItem('galpi-draft-bp-empty', 'true');
      openModal('boilerplate');
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

  // ★ 신규 추가: 드래그 영역 사전 전송 및 모달 오픈 트리거
  const saveToDict = () => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0 && !sel.isCollapsed) {
      localStorage.setItem('galpi-draft-dict-word', sel.toString().trim());
    }
    openModal('dict');
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
    setActiveMemoId,
    saveAsTemplate,   
    toggleAutoSnippet,
    saveToDict // ★ 이벤트 훅으로 전달
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
    saveToDict, // ★ 렌더링 컨테이너로 전달
    fontList,
    isAutoSnippet,         
    toggleAutoSnippet    
  };
};