// 파일 위치: src/pages/WorkDetail/CharacterInfobox.jsx
// 기능 요약: 캐릭터 인포박스 상세 출력. 시스템 데이터(dynamicProperties 등)를 렌더링에서 필터링하는 로직 반영 (v1.5.0)

import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosCore';
import styles from './WorkDetail.module.css';

const CharacterInfobox = ({ char, workId, workTitle, charExt, setCharacters, setActiveCharId }) => {
  const navigate = useNavigate();
  if (!char) return null;

  console.log(`[CharacterInfobox] 인포박스 렌더링 호출: ${char.name}`);

  const handleDelete = async () => {
    console.log(`[CharacterInfobox] 삭제 버튼 클릭됨. ID: ${char.id}`);
    if (window.confirm("이 캐릭터를 영구 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.")) {
      try {
        await api.delete(`/api/characters/${char.id}`);
        setCharacters(prev => prev.filter(c => c.id !== char.id));
        setActiveCharId(null);
        console.log(`[CharacterInfobox] 삭제 통신 성공.`);
      } catch (e) {
        console.error(`[CharacterInfobox] 삭제 통신 실패:`, e);
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
  const imgName = `${workTitle}_${char.name}.${charExt.replace(/^\./, '')}`;
  const imgSrc = `/img/character/${encodeURIComponent(imgName)}`;

  let dp = {};
  try { 
      if (typeof char.dynamicProperties === 'string') dp = JSON.parse(char.dynamicProperties);
      else if (typeof char._rawDynamic === 'string') dp = JSON.parse(char._rawDynamic); 
  } catch(e){
      console.error(`[CharacterInfobox] 동적 속성 파싱 실패:`, e);
  }
  
  const propOrder = dp._propOrder || [];
  const mergedProps = { ...char, ...dp };
  if (char.age) mergedProps["나이"] = char.age;
  if (char.birthday) mergedProps["생일"] = char.birthday;
  if (char.gender) mergedProps["성별"] = char.gender;
  if (char.species) mergedProps["종족"] = char.species;

  const keysToRender = [];
  propOrder.forEach(k => { if (mergedProps[k] !== undefined && !keysToRender.includes(k)) keysToRender.push(k); });
  for (let k in mergedProps) { if (!keysToRender.includes(k)) keysToRender.push(k); }

  // ★ 수정됨: dynamicProperties 문자열 자체가 출력되는 문제를 막기 위해 exclude 배열에 추가
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
      <div className={styles.infoboxImage}>
        <img src={imgSrc} style={{ objectPosition: `50% ${char.cardImgY !== undefined ? char.cardImgY : 50}%` }} onError={(e) => e.target.style.display = 'none'} alt={char.name} />
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