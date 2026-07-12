import React, { useState, useEffect, useRef } from 'react';
import styles from './EditorPage.module.css';

const EditorSearch = ({ editorRef, updatePreview }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matches, setMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        setIsOpen(true);
        const selText = window.getSelection().toString().trim();
        if (selText && selText.length < 50) {
          setFindText(selText);
        }
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        editorRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, editorRef]);

  useEffect(() => {
    executeFind();
  }, [findText]);

  const executeFind = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.value;
    
    if (!findText) {
      setMatches([]);
      setCurrentIndex(-1);
      return;
    }

    const lowerText = text.toLowerCase();
    const lowerQuery = findText.toLowerCase();
    let startIndex = 0;
    const found = [];

    while ((startIndex = lowerText.indexOf(lowerQuery, startIndex)) > -1) {
      found.push({ start: startIndex, end: startIndex + findText.length });
      startIndex += findText.length;
    }

    setMatches(found);
    if (found.length > 0) {
      setCurrentIndex(0);
      highlightMatch(found, 0);
    } else {
      setCurrentIndex(-1);
    }
  };

  const highlightMatch = (arr, idx) => {
    if (!editorRef.current || arr.length === 0 || idx === -1) return;
    const match = arr[idx];
    const el = editorRef.current;
    el.focus();
    el.setSelectionRange(match.start, match.end);

    const fullTextToMatch = el.value.substring(0, match.start);
    const lines = fullTextToMatch.split('\n');
    const lineHeight = 20; 
    el.scrollTop = (lines.length - 1) * lineHeight - (el.clientHeight / 2);
  };

  const navigateSearch = (direction) => {
    if (matches.length === 0) return;
    let nextIdx = currentIndex + direction;
    if (nextIdx < 0) nextIdx = matches.length - 1;
    if (nextIdx >= matches.length) nextIdx = 0;
    setCurrentIndex(nextIdx);
    highlightMatch(matches, nextIdx);
  };

  const handleReplaceCurrent = () => {
    if (matches.length === 0 || currentIndex === -1 || !editorRef.current) return;
    const el = editorRef.current;
    const match = matches[currentIndex];
    
    const before = el.value.substring(0, match.start);
    const after = el.value.substring(match.end);
    el.value = before + replaceText + after;
    
    updatePreview();
    executeFind(); 
  };

  const handleReplaceAll = () => {
    if (!findText || !editorRef.current) return;
    const el = editorRef.current;
    const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapeRegExp(findText), 'gi');
    el.value = el.value.replace(regex, replaceText);
    updatePreview();
    executeFind();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.customSearchBox}>
      <div className={styles.searchRow}>
        <button className={styles.searchBtn} style={{ border: 'none', padding: '4px' }} onClick={() => setIsReplaceOpen(!isReplaceOpen)}>
          {isReplaceOpen ? '▼' : '▶'}
        </button>
        <input 
          autoFocus
          className={styles.searchInput} 
          placeholder="에디터 내 찾기 (Ctrl+F)" 
          value={findText} 
          onChange={e => setFindText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              navigateSearch(e.shiftKey ? -1 : 1);
            }
          }}
        />
        <span style={{ fontSize:'11px', color: matches.length > 0 ? 'var(--text-secondary)' : '#e53e3e', minWidth:'35px', textAlign:'right' }}>
          {matches.length > 0 ? `${currentIndex + 1}/${matches.length}` : '0/0'}
        </span>
        <button className={styles.searchBtn} onClick={() => navigateSearch(-1)}>▲</button>
        <button className={styles.searchBtn} onClick={() => navigateSearch(1)}>▼</button>
        <button className={styles.searchBtn} style={{ border:'none', color:'#e53e3e', fontSize:'16px' }} onClick={() => setIsOpen(false)}>✖</button>
      </div>
      
      {isReplaceOpen && (
        <div className={styles.searchRow} style={{ paddingLeft: '28px' }}>
          <input 
            className={styles.searchInput} 
            placeholder="바꿀 내용" 
            value={replaceText} 
            onChange={e => setReplaceText(e.target.value)}
            onKeyDown={e => {
              if(e.key === 'Enter') { e.preventDefault(); handleReplaceCurrent(); }
            }}
          />
          <button className={styles.searchBtn} onClick={handleReplaceCurrent}>바꾸기</button>
          <button className={styles.searchBtn} onClick={handleReplaceAll}>모두</button>
        </div>
      )}
    </div>
  );
};

export default EditorSearch;