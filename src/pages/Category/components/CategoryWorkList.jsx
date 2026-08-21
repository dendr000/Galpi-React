// 파일 위치: src/pages/Category/components/CategoryWorkList.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Category.module.css';
import { IconArrowLeft, IconArchive } from '../../../components/common/icons/DomainIcons';

const getGroupKey = (title) => {
  if (!title) return '기타';
  const char = title.trim().charAt(0);
  const code = char.charCodeAt(0);
  if (code >= 0xAC00 && code <= 0xD7A3) { 
      const chosung = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
      let c = chosung[Math.floor((code - 0xAC00) / 588)];
      const map = {'ㄲ':'ㄱ', 'ㄸ':'ㄷ', 'ㅃ':'ㅂ', 'ㅆ':'ㅅ', 'ㅉ':'ㅈ'};
      return map[c] || c;
  }
  if (/[A-Za-z]/.test(char)) return char.toUpperCase();
  if (/[0-9]/.test(char)) return '0-9';
  return '기타';
};

const CategoryWorkList = ({ targetCat, catMap, showCatView }) => {
  const navigate = useNavigate();
  const worksArray = catMap[targetCat] || [];

  if (worksArray.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
        작품이 존재하지 않습니다.
      </div>
    );
  }

  const groups = {};
  worksArray.forEach(w => {
    const key = getGroupKey(w.title);
    if (!groups[key]) groups[key] = [];
    groups[key].push(w);
  });

  const sortedKeys = Object.keys(groups).sort((a, b) => {
    const getPriority = (k) => {
      if (/[ㄱ-ㅎ]/.test(k)) return 1;
      if (/[A-Z]/.test(k)) return 2;
      if (/[0-9]/.test(k)) return 3;
      return 4;
    };
    const pA = getPriority(a);
    const pB = getPriority(b);
    if (pA !== pB) return pA - pB;
    return a.localeCompare(b);
  });

  return (
    <div className={styles.workView}>
      <button 
        className={styles.backBtn} 
        onClick={showCatView}
        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <IconArrowLeft size={16} /> 분류 목록으로 돌아가기
      </button>
      
      <h2 className={styles.workViewTitle} style={{ margin: '15px 0 20px', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <IconArchive size={22} /> 분류 : {targetCat} 
        <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>
          ({worksArray.length}개)
        </span>
      </h2>

      <div className={styles.namuContainer}>
        {sortedKeys.map(k => (
          <div key={k} className={styles.namuGroup}>
            <div className={styles.namuGroupTitle}>{k}</div>
            <ul className={styles.namuList}>
              {groups[k].sort((a,b) => (a.title||"").localeCompare(b.title||"")).map(w => (
                <li key={w.id}>
                  <span className={styles.namuLink} onClick={() => navigate(`/work/${w.id}`)}>
                    {w.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryWorkList;