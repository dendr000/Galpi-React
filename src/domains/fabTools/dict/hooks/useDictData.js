// src/domains/fabTools/dict/hooks/useDictData.js
import { useState, useEffect } from 'react';
import api from '../../../../api/axiosCore';
import { parseBulkDict } from '../utils/dictParser';

// onDataChanged: 저장/수정/삭제/일괄등록이 성공한 뒤 호출되는 콜백. 검색 결과를 서버에서 다시 불러와 갱신하는 용도.
export const useDictData = ({ currentWorkId, showToast, onDataChanged }) => {
  const [dictInput, setDictInput] = useState({ word: '', trans: '' });
  const [editingTarget, setEditingTarget] = useState(null);
  const [dictBulk, setDictBulk] = useState('');
  const [isDictBulkMode, setIsDictBulkMode] = useState(false);

  // ★ 추가: 모달이 열릴 때 드래그된 텍스트가 있다면 '원문' 인풋에 자동 바인딩
  useEffect(() => {
    const draftWord = localStorage.getItem('galpi-draft-dict-word');
    if (draftWord) {
      setDictInput(prev => ({ ...prev, word: draftWord }));
      localStorage.removeItem('galpi-draft-dict-word');
      setEditingTarget(null);
      setIsDictBulkMode(false);
    }
  }, []);

  const handleDictSave = async () => {
    const word = dictInput.word.trim();
    const trans = dictInput.trans.trim();
    if (!word || !trans) return alert("원문 단어와 치환 데이터를 채워넣어 주십시오.");
    
    try {
      if (editingTarget) {
        await api.delete(`/api/dicts?workId=${editingTarget.workId}&word=${encodeURIComponent(editingTarget.word)}&translation=${encodeURIComponent(editingTarget.translation)}`);
      }

      await api.post('/api/dicts', { workId: currentWorkId, word, translation: trans });

      setDictInput({ word: '', trans: '' });
      setEditingTarget(null);
      showToast(editingTarget ? "✨ 사전 데이터가 수정되었습니다." : "✨ 사전 데이터베이스에 저장 완료되었습니다.");
      onDataChanged?.();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDictBulk = async () => {
    if (!dictBulk.trim()) return alert("텍스트 파일 블록이 공백 상태입니다.");

    const parsedData = parseBulkDict(dictBulk);
    // 중복 여부는 서버(saveBulkDicts)가 workId+word+translation 기준으로 이미 걸러줌
    const payloads = parsedData.map(({ word, translation }) => ({ workId: currentWorkId, word, translation }));

    if (payloads.length > 0) {
      try {
        await api.post('/api/dicts/bulk', payloads);
        setDictBulk('');
        setIsDictBulkMode(false);
        showToast(`✨ 총 ${payloads.length}개의 어휘 묶음 처리가 종료되었습니다.`);
        onDataChanged?.();
      } catch (e) {
        console.error(e);
      }
    } else {
      alert("추출 가능한 문법 구문 패턴이 없습니다.");
    }
  };

  const handleDelete = async (d) => {
    if (window.confirm(`[${d.word}(${d.translation})] 고유 어휘 쌍을 사전에서 소각하시겠습니까?`)) {
      try {
        await api.delete(`/api/dicts?workId=${d.workId}&word=${encodeURIComponent(d.word)}&translation=${encodeURIComponent(d.translation)}`);
        showToast("🗑️ 사전 색인이 말소 처리되었습니다.");
        onDataChanged?.();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleEditClick = (d) => {
    setDictInput({ word: d.word, trans: d.translation });
    setEditingTarget(d);
    setIsDictBulkMode(false);
  };

  const handleCancelEdit = () => {
    setDictInput({ word: '', trans: '' });
    setEditingTarget(null);
  };

  return {
    dictInput, setDictInput,
    editingTarget,
    dictBulk, setDictBulk,
    isDictBulkMode, setIsDictBulkMode,
    handleDictSave, handleDictBulk, handleDelete, handleEditClick, handleCancelEdit
  };
};