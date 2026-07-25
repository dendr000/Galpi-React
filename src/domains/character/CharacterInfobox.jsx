// 파일 위치: src/domains/character/CharacterInfobox.jsx
// 기능 요약: 우측 정보 박스 렌더링 및 이중인격 스위칭 기믹 지원 (로컬 스토리지 상태 영구 보존 연동)
// 버전: v1.2.0

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosCore';
import styles from '../../pages/WorkDetail/WorkDetail.module.css';

const CharacterInfobox = ({ char, workId, workTitle, charExt, imgVariants = [], setCharacters, setActiveCharId, characters, cardVariants, setCardVariants, formSwaps, setFormSwaps }) => {
  const navigate = useNavigate();
  const [variantIdx, setVariantIdx] = useState(0);

  useEffect(() => {
    // 폼 스위칭 시 바리에이션 인덱스 초기화 방지 로직 (현재 캐릭터의 바리에이션 상태를 유지)
    if (char && cardVariants[char.id]) {
      setVariantIdx(cardVariants[char.id]);
    } else {
      setVariantIdx(0);
    }
  }, [char?.id, cardVariants]);

  if (!char) return null;

  const handleDelete = async () => {
    if (window.confirm("이 캐릭터를 영구 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.")) {
      try {
        await api.delete(`/api/characters/${char.id}`);
        setCharacters(prev => prev.filter(c => c.id !== char.id));
        setActiveCharId(null);
      } catch (e) {
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const getPreviewText = () => {
    let raw = "";
    if (char.pageBody?.rawText) raw = char.pageBody.rawText;
    else if (char.pageBodyRaw) raw = char.pageBodyRaw;
    else if (char._rawDynamic) {
        try { 
            let d = JSON.parse(char._rawDynamic); 
            if (typeof d === 'string') d = JSON.parse(d);
            if (d.pageBody?.rawText) raw = d.pageBody.rawText; 
        } catch(e) {}
    }
    
    if (!raw) return '';
    const plain = raw.replace(/[#*`>~_-]/g, '').replace(/\[.*?\]\(.*?\)/g, '').replace(/\n+/g, ' ').trim();
    return plain.length > 80 ? plain.substring(0, 80) + '...' : plain;
  };

  const previewText = getPreviewText();
  
  let dp = {};
  try {
    const rawDynamic = char.dynamicProperties || char._rawDynamic;
    if (rawDynamic) {
      let parsed = JSON.parse(rawDynamic);
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      dp = parsed || {};
    }
  } catch (e) {}

  const themeColor = dp.themeColor || char.themeColor || 'var(--primary-color)';
  const cardImgY = dp.cardImgY !== undefined ? dp.cardImgY : (char.cardImgY !== undefined ? char.cardImgY : 50);
  const cardImgScale = dp.cardImgScale !== undefined ? dp.cardImgScale : (char.cardImgScale !== undefined ? char.cardImgScale : 1);

  const fullVariants = ["", ...imgVariants.filter(v => v.trim() !== "")];
  
  const handleImageClick = async (e) => {
    if (e.shiftKey) {
      e.preventDefault();
      // ★ 이중인격 폼 체인지(스위칭) 로직 적용
      // 1. 현재 캐릭터가 스위칭 타겟을 가지고 있는지 확인 (본체 -> 서브폼)
      if (dp._switchTarget) {
         const targetChar = characters.find(c => c.name === dp._switchTarget);
         if(targetChar) {
            console.log(`[CharacterInfobox] 이중인격 스위칭 발동 (본체 -> 서브폼): ${char.name} -> ${targetChar.name}`);
            setFormSwaps(prev => ({ ...prev, [char.id]: targetChar.id }));
            setActiveCharId(targetChar.id);
            return; 
         }
      } 
      // 2. 현재 캐릭터가 누군가의 서브폼으로 렌더링 중인지 확인 (서브폼 -> 본체 복귀)
      const baseId = Object.keys(formSwaps || {}).find(key => formSwaps[key] === char.id);
      if (baseId) {
         const baseChar = characters.find(c => String(c.id) === String(baseId));
         if (baseChar) {
            console.log(`[CharacterInfobox] 이중인격 스위칭 발동 (서브폼 -> 본체 복귀): ${char.name} -> ${baseChar.name}`);
            setFormSwaps(prev => {
              const newSwaps = { ...prev };
              delete newSwaps[baseId];
              return newSwaps;
            });
            setActiveCharId(baseChar.id);
            return;
         }
      }
      
      // 스위칭 대상이 없는 일반 캐릭터라면 기존 바리에이션 순환 로직 수행
      if (fullVariants.length <= 1) return;
      const nextIdx = (variantIdx + 1) % fullVariants.length;
      setVariantIdx(nextIdx);
      // 그리드와 상태를 동기화하기 위해 상위 훅의 cardVariants 상태 업데이트
      setCardVariants(prev => ({ ...prev, [char.id]: nextIdx }));
    }
  };

  const currentVariant = fullVariants[variantIdx];
  const suffix = currentVariant ? `_${currentVariant}` : "";
  const imgName = `${workTitle}_${char.name}${suffix}.${charExt.replace(/^\./, '')}`;
  const imgSrc = `/img/character/${encodeURIComponent(imgName)}`;
  
  const propOrder = dp._propOrder || [];
  const mergedProps = { ...char, ...dp };
  if (char.age) mergedProps["나이"] = char.age;
  if (char.birthday) mergedProps["생일"] = char.birthday;
  if (char.gender) mergedProps["성별"] = char.gender;
  if (char.species) mergedProps["종족"] = char.species;

  const keysToRender = [];
  propOrder.forEach(k => { if (mergedProps[k] !== undefined && !keysToRender.includes(k)) keysToRender.push(k); });
  for (let k in mergedProps) { if (!keysToRender.includes(k)) keysToRender.push(k); }

  const exclude = [
      "id", "name", "imageCode", "pageBody", "themeColor", "cardImgY", "cardImgScale", "age", "birthday", 
      "gender", "species", "_rawDynamic", "_propOrder", "작품명", "제작자", "sortOrder", 
      "_cardLabel1", "_cardLabel2", "_sortOrder", "_sortOrderNum", "workId", "부제목", 
      "pageBodyRaw", "isTrash", "dynamicProperties", "_switchTarget", "_isHidden", "_baseCharId"
  ];
  
  const validKeys = keysToRender.filter(k => !exclude.includes(k) && !k.startsWith('_') && mergedProps[k] && mergedProps[k] !== "불명" && mergedProps[k] !== "미상" && mergedProps[k] !== "undefined");

  return (
    <div className={styles.wikiInfobox} style={{ borderTop: `4px solid ${themeColor}` }}>
      <h3 className={styles.infoboxTitle} style={{ backgroundColor: themeColor }}>
        <div style={{ fontSize: '20px', fontWeight: 900 }}>{char.name}</div>
        {mergedProps["부제목"] && <div style={{ fontSize: '13px', fontWeight: 500, opacity: 0.85, marginTop: '5px' }}>{mergedProps["부제목"]}</div>}
      </h3>
      
      <div className={styles.infoboxImage} style={{ overflow: 'hidden' }}>
        <img 
          src={imgSrc} 
          style={{ 
            objectPosition: `center ${cardImgY}%`, 
            transform: `scale(${cardImgScale})`,
            transition: 'transform 0.2s ease, object-position 0.2s ease',
            cursor: 'default', // 마우스 커서를 뾰족한 화살표(기본 상태)로 강제 고정
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }} 
          onClick={(e) => {
            console.log(`[CharacterInfobox] 이미지 클릭 이벤트 감지. 대상: ${char.name}`);
            handleImageClick(e);
          }}
          onError={(e) => { 
            console.warn(`[CharacterInfobox] 이미지 로드 실패. 빈칸 처리.`);
            e.target.onerror = null; 
            e.target.style.display = 'none'; 
          }} 
          alt={char.name} 
        />
      </div>

      <table className={styles.infoboxTable}>
        <tbody>
          {validKeys.map(k => (
            <tr key={k}>
              <th>{k}</th>
              <td style={{ fontWeight: '600' }}>{String(mergedProps[k]).split(',').map(s => s.trim().replace(/^\*/, '')).join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ padding: '15px', marginTop: '15px', borderTop: '1px dashed var(--border-color)', fontSize: '13px', lineHeight: 1.5, color: 'var(--text-secondary)', background: 'var(--surface-color)', borderRadius: '0 0 8px 8px', wordBreak: 'keep-all' }}>
        {previewText ? <div>{previewText}</div> : <div style={{ textAlign: 'center', opacity: 0.6, fontSize: '12px', padding: '10px 0' }}>등록된 상세 설정이 없습니다.</div>}
      </div>
      <div id="btn-container" style={{ display: 'flex', gap: '8px', padding: '15px', borderTop: '1px solid var(--border-color)' }}>
        <button className={styles.actionBtnEdit} style={{ borderColor: themeColor, color: themeColor }} onClick={() => navigate(`/edit?type=char&action=edit&workId=${workId}&id=${char.id}`)}>수정</button>
        <button className={styles.actionBtnDel} onClick={handleDelete}>삭제</button>
      </div>
    </div>
  );
};

export default CharacterInfobox;