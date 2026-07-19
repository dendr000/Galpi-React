// 파일 위치: src/pages/BulkStudio/useBulkStudioData.js
// 기능 요약: 캐릭터 일괄 스튜디오의 전역 상태 관리 및 글로벌 DB 디바운싱 자동완성 로직, 단축키 처리 포함

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axiosCore';

const DEFAULT_COLS = ["부제목", "나이", "성별", "종족", "소속", "직책", "능력", "등급", "관계"];

export const useBulkStudioData = () => {
  const [searchParams] = useSearchParams();
  const urlWorkId = searchParams.get('workId');
  const [isAutoLoaded, setIsAutoLoaded] = useState(false);

  const [works, setWorks] = useState([]);
  const [selectedWorkId, setSelectedWorkId] = useState('');
  const [workMeta, setWorkMeta] = useState({});
  const [columns, setColumns] = useState([...DEFAULT_COLS]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // 자동완성(제안) 데이터 보관소 및 1.5초 디바운싱 타이머
  const [suggestions, setSuggestions] = useState({});
  const suggestionTimer = useRef(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [activeRowIdx, setActiveRowIdx] = useState(null);
  const [tabMode, setTabMode] = useState('horizontal');
  const [sortMode, setSortMode] = useState('card');
  const [labels, setLabels] = useState({ label1: "나이", label2: "등급, 소속, 능력" });

  const [bodyModal, setBodyModal] = useState({ isOpen: false, rowIdx: null, text: '' });
  const [findReplaceModal, setFindReplaceModal] = useState({ isOpen: false });

  const lastCheckedRowIdx = useRef(null);

  // ★ 탭 모드 전환 글로벌 단축키 (Alt+T, Ctrl+Q)
  useEffect(() => {
    const handleGlobalKey = (e) => {
      // 모달이 열려있으면 단축키 작동 차단
      if (document.querySelector('.bulk-modal-overlay')) return;
      
      if ((e.altKey && e.key.toLowerCase() === 't') || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'q')) {
        e.preventDefault();
        e.stopPropagation();
        console.log("[useBulkStudioData] 전역 단축키 감지: 탭 방향 전환");
        setTabMode(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
      }
    };
    document.addEventListener('keydown', handleGlobalKey);
    return () => document.removeEventListener('keydown', handleGlobalKey);
  }, []);

  useEffect(() => {
    api.get('/api/works').then(res => setWorks(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (works.length > 0 && urlWorkId && !isAutoLoaded) {
      loadCharacters(urlWorkId, works);
      setIsAutoLoaded(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [works, urlWorkId, isAutoLoaded]);

  const loadCharacters = async (workId, currentWorks = works) => {
    setSelectedWorkId(workId);
    if (!workId) return setRows([]);
    setLoading(true);
    
    try {
      const targetWork = currentWorks.find(w => String(w.id) === String(workId));
      let meta = {};
      if (targetWork?.description) {
        const match = targetWork.description.match(/\[META_DATA:(.*?)\]/);
        if (match) { try { meta = JSON.parse(match[1]); } catch(e){} }
      }
      setWorkMeta(meta);

      const res = await api.get(`/api/characters?workId=${workId}`);
      let chars = res.data.filter(c => !c.isTrash);
      
      const newCols = new Set([...DEFAULT_COLS]);
      chars.forEach(c => {
        if (c.dynamicProperties || c._rawDynamic) {
          try {
            const dp = JSON.parse(c.dynamicProperties || c._rawDynamic);
            Object.keys(dp).forEach(k => {
              if (!k.startsWith('_') && k !== '부제목' && !["작품명", "제작자", "age", "gender", "species", "sortOrder", "themeColor", "cardImgY", "pageBody"].includes(k)) newCols.add(k);
            });
          } catch(e){}
        }
      });
      const colArray = Array.from(newCols).filter(k => k !== "부제목");
      colArray.unshift("부제목");
      setColumns(colArray);

      const formattedRows = chars.map(c => {
        let dp = {}; try { dp = JSON.parse(c.dynamicProperties || c._rawDynamic || "{}"); } catch(e){}
        const rowData = { 
          id: c.id, name: c.name || '', _checked: false, pageBodyRaw: dp.pageBody?.rawText || '',
          themeColor: c.themeColor || dp.themeColor || '#3b5bdb',
          cardImgY: c.cardImgY !== undefined ? c.cardImgY : (dp.cardImgY !== undefined ? dp.cardImgY : 50),
          _sortOrderNum: dp.sortOrder !== undefined ? dp.sortOrder : 999
        };
        colArray.forEach(col => {
          if (col === '나이') rowData[col] = c.age || dp[col] || '';
          else if (col === '성별') rowData[col] = c.gender || dp[col] || '';
          else if (col === '종족') rowData[col] = c.species || dp[col] || '';
          else rowData[col] = dp[col] || '';
        });
        return rowData;
      });

      if (formattedRows.length > 0) {
        let firstDp = {}; try { firstDp = JSON.parse(chars[0].dynamicProperties || chars[0]._rawDynamic || "{}"); } catch(e){}
        setLabels({ label1: firstDp._cardLabel1 || "나이", label2: firstDp._cardLabel2 || "등급, 소속, 능력" });
      } else {
        const nr = { id: `new_${Date.now()}`, name: '', _checked: false, pageBodyRaw: '', _sortOrderNum: 999, themeColor: '#3b5bdb', cardImgY: 50 };
        colArray.forEach(c => nr[c] = '');
        nr['관계'] = "일반"; nr['성별'] = "여성"; nr['종족'] = "인간(人間)";
        formattedRows.push(nr);
      }
      setRows(formattedRows);
    } catch (e) { alert("데이터 로드 실패"); } finally { setLoading(false); }
  };

  const handleCellChange = (rIdx, key, val) => {
    const newRows = [...rows];
    newRows[rIdx][key] = val;
    setRows(newRows);

    if (val.trim().length > 0 && !["name", "부제목", "_checked", "pageBodyRaw"].includes(key)) {
      if (suggestionTimer.current) clearTimeout(suggestionTimer.current);
      
      suggestionTimer.current = setTimeout(async () => {
        try {
          console.log(`[useBulkStudioData] 1.5초 입력 대기 완료. DB에 '${val}' 자동완성 검색 API 호출 (컬럼: ${key})`);
          const res = await api.get(`/api/characters/suggest?column=${encodeURIComponent(key)}&keyword=${encodeURIComponent(val.trim())}`);
          
          if (res.data && res.data.length > 0) {
            // ★ 백엔드에서 날아온 데이터도 콤마 기준으로 쪼개서 개별 배열로 만듭니다.
            let splitData = [];
            res.data.forEach(item => {
              if (item.includes(',')) {
                item.split(',').forEach(part => splitData.push(part.trim()));
              } else {
                splitData.push(item.trim());
              }
            });

            setSuggestions(prev => ({
              ...prev,
              [key]: Array.from(new Set([...(prev[key] || []), ...splitData]))
            }));
          }
        } catch (e) {
          console.error("[useBulkStudioData] 자동완성 데이터 로드 실패", e);
        }
      }, 1500); 
    }
  };

  const toggleRowCheck = (e, rIdx) => {
    const newRows = [...rows];
    const isChecked = !newRows[rIdx]._checked;
    if (e.shiftKey && lastCheckedRowIdx.current !== null) {
      const start = Math.min(lastCheckedRowIdx.current, rIdx);
      const end = Math.max(lastCheckedRowIdx.current, rIdx);
      for (let i = start; i <= end; i++) newRows[i]._checked = isChecked;
      if (window.getSelection) window.getSelection().removeAllRanges();
    } else {
      newRows[rIdx]._checked = isChecked;
    }
    lastCheckedRowIdx.current = rIdx;
    setRows(newRows);
  };

  const toggleAllChecks = (isChecked) => {
    const newRows = rows.map(r => ({ ...r, _checked: isChecked }));
    lastCheckedRowIdx.current = null;
    setRows(newRows);
  };

  const addRow = (count = 1) => {
    const newRows = [...rows];
    const baseTime = Date.now();
    for(let i=0; i<count; i++) {
      const nr = { id: `new_${baseTime + i}`, name: '', _checked: false, pageBodyRaw: '', _sortOrderNum: 999, themeColor: '#3b5bdb', cardImgY: 50 };
      columns.forEach(c => nr[c] = '');
      nr['관계'] = "일반"; nr['성별'] = "여성"; nr['종족'] = "인간(人間)";
      newRows.push(nr);
    }
    setRows(newRows);
  };

  const removeRow = (rIdx) => {
    if(window.confirm("이 행을 삭제하시겠습니까?")) setRows(rows.filter((_, i) => i !== rIdx));
  };

  const addColumn = (colName) => {
    if(!colName || colName.trim() === "") return;
    const cleanName = colName.trim();
    if(["작품명", "제작자", "id", "name", "sortOrder", "imageCode", "workId", "부제목", "pageBodyRaw", "_checked"].includes(cleanName)) return alert("예약어는 사용할 수 없습니다.");
    if(columns.includes(cleanName)) return alert("이미 존재하는 속성입니다.");
    setColumns([...columns, cleanName]);
    setRows(rows.map(r => ({ ...r, [cleanName]: '' })));
  };

  const removeColumn = (colName) => {
    if(colName === "부제목") return alert("부제목 칸은 삭제할 수 없습니다.");
    if(window.confirm(`'${colName}' 속성을 지울까요?`)) setColumns(columns.filter(c => c !== colName));
  };

  const changeColOrder = (oldIdx, newVal) => {
    if(columns[oldIdx] === "부제목") return;
    let newIdx = newVal - 1;
    if(newIdx < 1) newIdx = 1;
    if(newIdx >= columns.length) newIdx = columns.length - 1;
    if(oldIdx !== newIdx) {
      const newCols = [...columns];
      const colName = newCols.splice(oldIdx, 1)[0];
      newCols.splice(newIdx, 0, colName);
      setColumns(newCols);
    }
  };

  const sortTable = (type) => {
    setSortMode(type);
    const newRows = [...rows];
    const groupOrderMap = workMeta._groupOrder || {};
    if (!groupOrderMap["관계"]) groupOrderMap["관계"] = ["연인", "친구", "일반"];

    newRows.sort((a, b) => {
      if (type === 'name') return (a.name || "").localeCompare(b.name || "", 'ko-KR');
      else {
        const rA = (a['관계'] || "일반").trim();
        const rB = (b['관계'] || "일반").trim();
        const orderArr = groupOrderMap["관계"];
        let idxA = orderArr.indexOf(rA); if(idxA === -1) idxA = 999;
        let idxB = orderArr.indexOf(rB); if(idxB === -1) idxB = 999;
        if (idxA !== idxB) return idxA - idxB;
        return (a._sortOrderNum || 999) - (b._sortOrderNum || 999);
      }
    });
    setRows(newRows);
  };

  const applyBatchValue = (col, val) => {
    if (!col) return alert("덮어쓸 대상을 선택하세요.");
    let count = 0;
    const newRows = rows.map(r => { if (r._checked) { count++; return { ...r, [col]: val }; } return r; });
    if (count === 0) return alert("대상을 1명 이상 선택해 주세요.");
    setRows(newRows);
    alert(`총 ${count}명의 [${col}] 값이 변경되었습니다.`);
  };

  const executeFindReplace = (targetCol, findVal, replaceVal) => {
    if (!findVal) return alert("찾을 내용을 입력하세요.");
    let count = 0;
    const newRows = rows.map(c => {
      let newC = { ...c };
      if (targetCol === "ALL" || targetCol === "본문(마크다운)") {
        if (targetCol === "ALL" && newC.name?.includes(findVal)) { newC.name = newC.name.split(findVal).join(replaceVal); count++; }
        if ((targetCol === "ALL" || targetCol === "본문(마크다운)") && newC.pageBodyRaw?.includes(findVal)) { newC.pageBodyRaw = newC.pageBodyRaw.split(findVal).join(replaceVal); count++; }
        if (targetCol === "ALL") { columns.forEach(kc => { if (newC[kc]?.toString().includes(findVal)) { newC[kc] = newC[kc].toString().split(findVal).join(replaceVal); count++; } }); }
      } else {
        if (newC[targetCol]?.toString().includes(findVal)) { newC[targetCol] = newC[targetCol].toString().split(findVal).join(replaceVal); count++; }
      }
      return newC;
    });
    setRows(newRows);
    setFindReplaceModal({ isOpen: false });
    alert(`총 ${count}개의 항목이 치환되었습니다.`);
  };

  const formatPropValue = (k, v) => {
    if(!v) return ""; let vStr = v.toString().trim(); if(vStr === "") return "";
    const numOnly = /^\d+(\.\d+)?$/.test(vStr);
    if (k === "나이" && numOnly) vStr += "세";
    if ((k === "신장" || k === "신체" || k === "키") && numOnly) vStr += "cm";
    if ((k === "체중" || k === "몸무게") && numOnly) vStr += "kg";
    return vStr;
  };

  const handleSaveAll = async () => {
    if (!selectedWorkId) return alert("작품이 선택되지 않았습니다.");
    const targetWork = works.find(w => String(w.id) === String(selectedWorkId));
    let cExt = workMeta.charExt || "png";
    const workTitle = targetWork?.title || "작품";
    const creator = targetWork?.creator || "미상";

    try {
      const promises = rows.map(row => {
        if (!row.name.trim()) return Promise.resolve();
        let dp = { _propOrder: [...columns], pageBody: { rawText: row.pageBodyRaw }, sortOrder: row._sortOrderNum !== undefined ? row._sortOrderNum : 999, themeColor: row.themeColor || "#3b5bdb", cardImgY: row.cardImgY !== undefined ? row.cardImgY : 50, _cardLabel1: labels.label1, _cardLabel2: labels.label2, 작품명: workTitle, 제작자: creator };
        const payload = { workId: parseInt(selectedWorkId), name: row.name.trim(), imageCode: `${workTitle}_${row.name.trim()}.${cExt.replace(/^\./, '')}` };

        columns.forEach(col => { 
          if (row[col]?.trim() !== "") {
            const formattedVal = formatPropValue(col, row[col]);
            dp[col] = formattedVal;
            if (col === "나이") payload.age = formattedVal;
            if (col === "성별") payload.gender = formattedVal;
            if (col === "종족") payload.species = formattedVal;
          }
        });
        payload.dynamicProperties = JSON.stringify(dp);
        return String(row.id).startsWith('new_') ? api.post('/api/characters', payload) : api.put(`/api/characters/${row.id}`, payload);
      });
      
      await Promise.all(promises);
      alert("✅ 성공적으로 일괄 저장되었습니다.");
      window.location.href = `/work/${selectedWorkId}`;
    } catch (e) { alert("저장 실패"); }
  };

  return {
    works, selectedWorkId, columns, rows, loading, workMeta, suggestions,
    isPreviewOpen, setIsPreviewOpen, activeRowIdx, setActiveRowIdx,
    tabMode, setTabMode, sortMode, labels, setLabels,
    bodyModal, setBodyModal, findReplaceModal, setFindReplaceModal,
    loadCharacters, handleCellChange, toggleRowCheck, toggleAllChecks,
    addRow, removeRow, addColumn, removeColumn, changeColOrder, sortTable,
    applyBatchValue, executeFindReplace, handleSaveAll
  };
};