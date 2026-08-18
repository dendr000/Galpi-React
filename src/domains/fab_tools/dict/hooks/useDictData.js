import { useState } from 'react';
import api from '../../../../api/axiosCore';
import { parseBulkDict } from '../utils/dictParser';

export const useDictData = ({ currentWorkId, showToast, globalDictList, setGlobalDictList }) => {
  const [dictInput, setDictInput] = useState({ word: '', trans: '' });
  const [editingTarget, setEditingTarget] = useState(null);
  const [dictBulk, setDictBulk] = useState('');
  const [isDictBulkMode, setIsDictBulkMode] = useState(false);

  const handleDictSave = async () => {
    const word = dictInput.word.trim();
    const trans = dictInput.trans.trim();
    if (!word || !trans) return alert("원문 단어와 치환 데이터를 채워넣어 주십시오.");
    
    try {
      if (editingTarget) {
        await api.delete(`/api/dicts?workId=${editingTarget.workId}&word=${encodeURIComponent(editingTarget.word)}&translation=${encodeURIComponent(editingTarget.translation)}`);
        setGlobalDictList(prev => prev.filter(x => !(x.word === editingTarget.word && x.translation === editingTarget.translation)));
      }
      
      await api.post('/api/dicts', { workId: currentWorkId, word, translation: trans });
      
      setGlobalDictList(prev => {
        const cleaned = prev.filter(x => !(x.word === word && x.translation === trans));
        return [...cleaned, { workId: currentWorkId, word, translation: trans }];
      });

      setDictInput({ word: '', trans: '' });
      setEditingTarget(null);
      showToast(editingTarget ? "✨ 사전 데이터가 수정되었습니다." : "✨ 사전 데이터베이스에 저장 완료되었습니다.");
    } catch (e) {
      console.error(e);
    }
  };

  const handleDictBulk = async () => {
    if (!dictBulk.trim()) return alert("텍스트 파일 블록이 공백 상태입니다.");
    
    const parsedData = parseBulkDict(dictBulk);
    const payloads = [];
    const newDict = [...globalDictList];
    
    parsedData.forEach(({ word, translation }) => {
      if (!newDict.some(d => d.word === word && d.translation === translation)) {
        newDict.push({ workId: currentWorkId, word, translation });
        payloads.push({ workId: currentWorkId, word, translation });
      }
    });

    if (payloads.length > 0) {
      try {
        await api.post('/api/dicts/bulk', payloads);
        setGlobalDictList(newDict);
        setDictBulk('');
        setIsDictBulkMode(false);
        showToast(`✨ 총 ${payloads.length}개의 어휘 묶음 처리가 종료되었습니다.`);
      } catch (e) {
        console.error(e);
      }
    } else {
      alert("추출 가능한 문법 구문 패턴이 부재하거나 이미 등록된 단어들입니다.");
    }
  };

  const handleDelete = async (d) => {
    if (window.confirm(`[${d.word}(${d.translation})] 고유 어휘 쌍을 사전에서 소각하시겠습니까?`)) {
      try {
        await api.delete(`/api/dicts?workId=${d.workId}&word=${encodeURIComponent(d.word)}&translation=${encodeURIComponent(d.translation)}`); 
        setGlobalDictList(prev => prev.filter(x => !(x.word === d.word && x.translation === d.translation))); 
        showToast("🗑️ 사전 색인이 말소 처리되었습니다.");
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