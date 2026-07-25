// 파일 위치: src/pages/EditorPage/useEditorData.js
// 기능 요약: 에디터 페이지의 서버 통신, 시스템 예약어 필터링, 데이터 파싱, 메타데이터 상태 저장을 관장하는 커스텀 훅

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosCore';
import { extractMeta } from '../../utils/markdownParser';

// ★ 물리적으로 에디터 속성창에 입력칸으로 노출되면 안 되는 시스템 내부 예약어(블랙리스트) 명단 정의
const SYSTEM_PROPS = ["작품명", "제작자", "age", "gender", "species", "birthday", "sortOrder", "themeColor", "cardImgY", "cardImgScale", "pageBody", "_cardLabel1", "_cardLabel2", "id", "name", "imageCode", "dynamicProperties", "workId", "_sortOrder", "_sortOrderNum", "isTrash"];

export const useEditorData = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const docType = searchParams.get('type') || 'work';
  const docAction = searchParams.get('action') || 'new';
  const targetId = searchParams.get('id');
  const targetWorkId = searchParams.get('workId');

  const [loading, setLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);

  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [overviewText, setOverviewText] = useState('');

  const [workMeta, setWorkMeta] = useState({
    creator: '', genre: '', status: '진행 전', alias: '', coverExt: '', charExt: 'png', groupOrderStr: '', imgVariants: [''], originalMeta: {}
  });

  const [charProps, setCharProps] = useState([]);
  const [themeColor, setThemeColor] = useState('#3b5bdb');
  const [cardLabels, setCardLabels] = useState({ label1: '나이', label2: '성격' });
  const [workContext, setWorkContext] = useState(null);

  const editorRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (docType === 'work') {
          if (docAction === 'edit' && targetId) {
            const res = await api.get(`/api/works/${targetId}`);
            const data = res.data;
            setTitle(data.title || '');

            const parsed = extractMeta(data.description);
            setRawText(parsed.clean);
            setOverviewText(parsed.meta.overview || '');

            let groupOrderStr = "";
            if (parsed.meta._groupOrder) {
              for (let k in parsed.meta._groupOrder) {
                groupOrderStr += `${k}: ${parsed.meta._groupOrder[k].join(', ')}\n`;
              }
            }

            setWorkMeta({
              creator: data.creator || '', genre: data.genre || '', status: data.status || '진행 전',
              alias: parsed.meta.alias || '', coverExt: parsed.meta.coverExt || '', charExt: parsed.meta.charExt || 'png',
              groupOrderStr: groupOrderStr, imgVariants: parsed.meta.imgVariants?.length > 0 ? parsed.meta.imgVariants : [''],
              originalMeta: parsed.meta
            });
          }
        }
        else if (docType === 'page') {
          if (docAction === 'edit' && targetId) {
            const res = await api.get(`/api/wikipages/${targetId}`);
            setTitle(res.data.title || '');
            setRawText(res.data.content || '');
          }
        }
        else if (docType === 'char') {
          if (targetWorkId) {
            const wRes = await api.get(`/api/works/${targetWorkId}`);
            setWorkContext(wRes.data);
          }
          if (docAction === 'edit' && targetId) {
            const res = await api.get(`/api/characters?workId=${targetWorkId}`);
            const char = res.data.find(c => String(c.id) === String(targetId));
            if (char) {
              setTitle(char.name || '');
              let dp = {};
              try { dp = JSON.parse(char.dynamicProperties || char._rawDynamic || "{}"); } catch (e) { }

              setThemeColor(dp.themeColor || char.themeColor || '#3b5bdb');
              setCardLabels({ label1: dp._cardLabel1 || '나이', label2: dp._cardLabel2 || '성격' });
              setRawText(dp.pageBody?.rawText || '');

              const merged = { ...char, ...dp };
              if (char.age) merged['나이'] = char.age;
              if (char.birthday) merged['생일'] = char.birthday;
              if (char.gender) merged['성별'] = char.gender;
              if (char.species) merged['종족'] = char.species;

              const pOrder = dp._propOrder || [];
              const extractedProps = [];
              const renderKeys = new Set();

              // ★ 시스템 예약어 (SYSTEM_PROPS) 필터링 적용
              pOrder.forEach(k => {
                if (merged[k] !== undefined && !k.startsWith('_') && !SYSTEM_PROPS.includes(k)) {
                  extractedProps.push({ key: k, val: merged[k] });
                  renderKeys.add(k);
                }
              });

              for (const k in merged) {
                if (!renderKeys.has(k) && !k.startsWith('_') && !SYSTEM_PROPS.includes(k)) {
                  extractedProps.push({ key: k, val: merged[k] });
                }
              }

              if (!extractedProps.some(p => p.key === '부제목')) {
                extractedProps.unshift({ key: '부제목', val: '' });
              } else {
                const subIdx = extractedProps.findIndex(p => p.key === '부제목');
                const subProp = extractedProps.splice(subIdx, 1)[0];
                extractedProps.unshift(subProp);
              }

              setCharProps(extractedProps);
            }
          } else {
            setCharProps([
              { key: '부제목', val: '' }, { key: '나이', val: '' }, { key: '성별', val: '여성' },
              { key: '종족', val: '인간(人間)' }, { key: '관계', val: '일반' }
            ]);
          }
        }
      } catch (err) {
        console.error(`[useEditorData] 원장 서버 패치 에러 발생:`, err);
        alert("데이터 로드 중 통신 장애가 감지되었습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [docType, docAction, targetId, targetWorkId]);

  const handleGoBack = () => {
    if (targetWorkId && targetWorkId !== 'null') {
      if (docType === 'page' && targetId) navigate(`/work/${targetWorkId}?pageId=${targetId}`);
      else navigate(`/work/${targetWorkId}`);
    } else if (targetId && docType === 'work') {
      navigate(`/work/${targetId}`);
    } else {
      navigate(-1);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return alert("제목을 입력해주세요.");

    try {
      if (docType === 'work') {
        const meta = {
          ...workMeta.originalMeta,
          alias: workMeta.alias, charExt: workMeta.charExt || 'png', coverExt: workMeta.coverExt, overview: overviewText,
        };

        const validVariants = workMeta.imgVariants.filter(v => v.trim() !== '');
        if (validVariants.length > 0) meta.imgVariants = validVariants;

        const goObj = {};
        workMeta.groupOrderStr.split('\n').forEach(line => {
          const parts = line.split(':');
          if (parts.length >= 2) {
            const k = parts[0].trim();
            const vals = parts[1].split(',').map(v => v.trim()).filter(v => v !== "");
            if (k && vals.length > 0) goObj[k] = vals;
          }
        });
        if (Object.keys(goObj).length > 0) meta._groupOrder = goObj;

        const finalDesc = `[META_DATA:${JSON.stringify(meta)}]\n${rawText}`;
        const payload = {
          title, description: finalDesc, creator: workMeta.creator, genre: workMeta.genre, status: workMeta.status,
          checkDate: new Date().toLocaleDateString('ko-KR')
        };

        if (docAction === 'edit') {
          await api.put(`/api/works/${targetId}`, { ...payload, id: targetId });
          navigate(`/work/${targetId}`);
        } else {
          const res = await api.post('/api/works', payload);
          navigate(`/work/${res.data.id}`);
        }
      }
      else if (docType === 'page') {
        const payload = { title, content: rawText, workId: parseInt(targetWorkId) };
        const pId = searchParams.get('parentId');
        if (pId && pId !== 'null') payload.parentId = parseInt(pId);

        if (docAction === 'edit') {
          await api.put(`/api/wikipages/${targetId}`, { ...payload, id: targetId });
          navigate(`/work/${targetWorkId}?pageId=${targetId}`);
        } else {
          const res = await api.post('/api/wikipages', payload);
          navigate(`/work/${targetWorkId}?pageId=${res.data.id}`);
        }
      }
      else if (docType === 'char') {
        // ★ 에디터 저장 시 기존에 갖고 있던 시스템 속성(themeColor, cardImgY, cardImgScale, _groupSortOrders 등) 유지 보장
        let dp = {
          pageBody: { rawText }, themeColor, _cardLabel1: cardLabels.label1, _cardLabel2: cardLabels.label2,
        };
        // 기존 원본 데이터를 가져와 병합하여 시스템 속성값 유실 방지
        let originalChar = {};
        try {
          if (docAction === 'edit' && targetId) {
            const res = await api.get(`/api/characters?workId=${targetWorkId}`);
            const char = res.data.find(c => String(c.id) === String(targetId));
            if (char && char.dynamicProperties) {
              originalChar = JSON.parse(char.dynamicProperties);
              dp.cardImgY = originalChar.cardImgY !== undefined ? originalChar.cardImgY : 50;
              dp.cardImgScale = originalChar.cardImgScale !== undefined ? originalChar.cardImgScale : 1;
              // ★ 다중 그룹 정렬 순서 보존 로직 추가
              if (originalChar._groupSortOrders) {
                dp._groupSortOrders = originalChar._groupSortOrders;
              }
            }
          }
        } catch (e) {
          console.warn("[useEditorData] 원본 시스템 속성 파싱 실패:", e);
        }

        const payload = { workId: targetWorkId, name: title };
        const pOrder = [];

        charProps.forEach(p => {
          if (!p.key.trim() || !p.val.trim()) return;
          let val = p.val.trim();
          if (p.key === '나이' && /^\d+(\.\d+)?$/.test(val)) val += '세';

          if (p.key === '나이') payload.age = val;
          if (p.key === '생일') payload.birthday = val;
          if (p.key === '성별') payload.gender = val;
          if (p.key === '종족') payload.species = val;

          dp[p.key] = val;
          pOrder.push(p.key);
        });

        pOrder.push("작품명", "제작자");
        dp["작품명"] = workContext ? workContext.title : "";
        dp["제작자"] = workContext ? (workContext.creator || "미상") : "미상";
        dp._propOrder = pOrder;

        const cExt = workContext ? (extractMeta(workContext.description).meta.charExt || 'png') : 'png';
        payload.imageCode = `${workContext?.title || '불명'}_${title}.${cExt}`;
        payload.dynamicProperties = JSON.stringify(dp);

        // ★ 에디터 저장 시 캐릭터 테이블 원장의 단일 sortOrder도 유실 방지 처리
        if (originalChar.sortOrder !== undefined) {
          payload.sortOrder = originalChar.sortOrder;
        } else if (docAction === 'edit' && targetId) {
          try {
            const res = await api.get(`/api/characters?workId=${targetWorkId}`);
            const char = res.data.find(c => String(c.id) === String(targetId));
            if (char && char.sortOrder !== undefined) payload.sortOrder = char.sortOrder;
          } catch (e) { }
        }

        if (docAction === 'edit') {
          await api.put(`/api/characters/${targetId}`, { ...payload, id: targetId });
        } else {
          await api.post('/api/characters', payload);
        }
        navigate(`/work/${targetWorkId}`);
      }
    } catch (err) {
      alert("저장 처리에 실패했습니다.");
    }
  };

  return {
    docType, docAction, loading, isPreviewOpen, setIsPreviewOpen,
    title, setTitle, rawText, setRawText, overviewText, setOverviewText,
    workMeta, setWorkMeta, charProps, setCharProps, themeColor, setThemeColor,
    cardLabels, setCardLabels, editorRef, handleGoBack, handleSave
  };
};