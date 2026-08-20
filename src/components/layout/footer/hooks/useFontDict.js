// 파일 위치: src/components/layout/footer/hooks/useFontDict.js
// 기능 요약: 폰트 매핑 데이터 패치, 에러 추적 로깅, 신규 매핑 행(Row) 추가/삭제, JSON 직렬화 및 백엔드 전송 API 로직 전담 훅

import { useState, useEffect, useCallback } from 'react';
import api from '../../../../api/axiosCore';

export const useFontDict = (onClose) => {
  const [dictList, setDictList] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    console.log("[useFontDict] 백엔드(/api/fonts/dict) 폰트 사전 요청 개시");
    
    api.get('/api/fonts/dict')
      .then(res => {
        console.log("[useFontDict] 폰트 사전 수신 성공:", res.data);
        const data = res.data;

        if (!data || Object.keys(data).length === 0) {
          console.warn("[useFontDict] ⚠️ 수신된 JSON이 비어있습니다. font-dict.json 파일의 문법(Syntax)을 확인하세요.");
        }

        // _comment를 제외하고 객체를 배열로 변환
        const arr = Object.entries(data)
          .filter(([k]) => k !== '_comment')
          .map(([k, v]) => ({ id: Date.now() + Math.random(), key: k, val: v, isNew: false }));
        
        setDictList(arr);
      })
      .catch((err) => {
        console.error("[useFontDict] 🚨 백엔드 통신 실패. Spring Boot 서버를 재부팅했는지 확인하세요:", err);
        setDictList([]);
      });
  }, []);

  const addRow = () => {
    setDictList(prev => [...prev, { id: Date.now() + Math.random(), key: '', val: '', isNew: true }]);
  };

  const removeRow = (id) => {
    setDictList(prev => prev.filter(item => item.id !== id));
  };

  const updateRow = (id, field, value) => {
    setDictList(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const saveDict = useCallback(async () => {
    try {
      setIsSaving(true);
      const newDict = {
        "_comment": "Galpi-Media/fonts/font-dict.json"
      };
      
      dictList.forEach(item => {
        if (item.key.trim() && item.val.trim()) {
          newDict[item.key.trim()] = item.val.trim();
        }
      });

      console.log("[useFontDict] 폰트 사전 덮어쓰기 요청:", newDict);
      await api.post('/api/fonts/dict', newDict);
      alert("폰트 매핑 사전이 성공적으로 갱신되었습니다.\n(앱을 새로고침하면 드롭다운에 즉시 반영됩니다)");
      if (onClose) onClose();
    } catch (e) {
      console.error("[useFontDict] 사전 저장 실패:", e);
      alert("저장 중 통신 오류가 발생했습니다. 백엔드 상태를 확인하세요.");
    } finally {
      setIsSaving(false);
    }
  }, [dictList, onClose]);

  return { dictList, isSaving, addRow, removeRow, updateRow, saveDict };
};