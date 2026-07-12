import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosCore';
import styles from './WorkDetail.module.css';

const CharacterInfobox = ({ char, workId, workTitle, charExt, imgVariants = [], setCharacters, setActiveCharId }) => {
  const navigate = useNavigate();
  const [variantIdx, setVariantIdx] = useState(0);

  // 캐릭터가 교체되면 바리에이션을 항상 '기본'으로 초기화
  useEffect(() => {
    setVariantIdx(0);
  }, [char?.id]);

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
            const d = JSON.parse(char._rawDynamic); 
            if (d.pageBody?.rawText) raw = d.pageBody.rawText; 
        } catch(e) {}
    }
    
    if (!raw) return '';
    const plain = raw.replace(/[#*`>~_-]/g, '').replace(/\[.*?\]\(.*?\)/g, '').replace(/\n+/g, ' ').trim();
    return plain.length > 80 ? plain.substring(0, 80) + '...' : plain;
  };

  const previewText = getPreviewText();
  const themeColor = char.themeColor || 'var(--primary-color)';

  // ★ 이미지 바리에이션 (Shift+Click) 연산
  const fullVariants = ["", ...imgVariants.filter(v => v.trim() !== "")];
  
  const handleImageClick = (e) => {
    if (e.shiftKey) {
      e.preventDefault();
      if (fullVariants.length <= 1) return;
      setVariantIdx((prev) => (prev + 1) % fullVariants.length);
    }
  };

  const currentVariant = fullVariants[variantIdx];
  const suffix = currentVariant ? `_${currentVariant}` : "";
  const imgName = `${workTitle}_${char.name}${suffix}.${charExt.replace(/^\./, '')}`;
  const imgSrc = `/img/character/${encodeURIComponent(imgName)}`;

  let dp = {};
  try { 
      if (typeof char.dynamicProperties === 'string') dp = JSON.parse(char.dynamicProperties);
      else if (typeof char._rawDynamic === 'string') dp = JSON.parse(char._rawDynamic); 
  } catch(e){}
  
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
      "id", "name", "imageCode", "pageBody", "themeColor", "cardImgY", "age", "birthday", 
      "gender", "species", "_rawDynamic", "_propOrder", "작품명", "제작자", "sortOrder", 
      "_cardLabel1", "_cardLabel2", "_sortOrder", "_sortOrderNum", "workId", "부제목", 
      "pageBodyRaw", "isTrash", "dynamicProperties"
  ];
  
  const validKeys = keysToRender.filter(k => !exclude.includes(k) && !k.startsWith('_') && mergedProps[k] && mergedProps[k] !== "불명" && mergedProps[k] !== "미상" && mergedProps[k] !== "undefined");

  return (
    <div className={styles.wikiInfobox} style={{ borderTop: `4px solid ${themeColor}` }}>
      <h3 className={styles.infoboxTitle} style={{ backgroundColor: themeColor }}>
        <div style={{ fontSize: '20px', fontWeight: 900 }}>{char.name}</div>
        {mergedProps["부제목"] && <div style={{ fontSize: '13px', fontWeight: 500, opacity: 0.85, marginTop: '5px' }}>{mergedProps["부제목"]}</div>}
      </h3>
      
      {/* 바리에이션 이미지 렌더링 영역 (알림 텍스트 제거) */}
      <div className={styles.infoboxImage}>
        <img 
          src={imgSrc} 
          style={{ objectPosition: `50% ${char.cardImgY !== undefined ? char.cardImgY : 50}%`, cursor: fullVariants.length > 1 ? 'pointer' : 'default' }} 
          onClick={handleImageClick}
          onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} 
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