import React from 'react';
import api from '../../../api/axiosCore';

const BatchImageModal = ({ isOpen, onClose, characters, work, charExt, batchImgY, setBatchImgY, setCharacters }) => {
  if (!isOpen || characters.length === 0) return null;

  const handleBatchSave = async () => {
    try {
      const promises = characters.map(c => {
        let dp = {};
        try { dp = JSON.parse(c.dynamicProperties || c._rawDynamic || "{}"); } catch(err){}
        dp.cardImgY = parseInt(batchImgY, 10);
        const newDynamic = JSON.stringify(dp);
        return api.put(`/api/characters/${c.id}`, { ...c, dynamicProperties: newDynamic, _rawDynamic: newDynamic });
      });
      await Promise.all(promises);
      
      setCharacters(prev => prev.map(c => ({ ...c, cardImgY: parseInt(batchImgY, 10) })));
      onClose();
      alert("일괄 변경이 완료되었습니다.");
    } catch(e) {
      alert("변경 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }} onClick={onClose}>
      <div style={{ background: 'var(--surface-color)', width: '350px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '15px 20px', background: 'var(--table-bg-alt)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--primary-color)' }}>🖼️ 캐릭터 썸네일 일괄 조정</h3>
          <button style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={onClose}>&times;</button>
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '200px', height: '260px', background: 'var(--bg-color)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
            <img 
              src={`/img/character/${encodeURIComponent(work.title + "_" + characters[0].name + "." + charExt)}`} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `50% ${batchImgY}%` }} 
              onError={(e) => e.target.style.display = 'none'} 
              alt="미리보기"
            />
          </div>
          <input 
            type="range" min="0" max="100" value={batchImgY} 
            onChange={(e) => setBatchImgY(e.target.value)} 
            style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
          />
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Y축 위치: {batchImgY}%</span>
          <p style={{ margin: 0, fontSize: '12px', color: '#e53e3e', textAlign: 'center', lineHeight: 1.4 }}>
            저장 시 이 작품의 <strong>모든 캐릭터</strong> 썸네일 위치가<br/>선택한 값으로 일괄 변경됩니다.
          </p>
        </div>
        <div style={{ padding: '15px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px' }}>
          <button className="wiki-btn" style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }} onClick={onClose}>취소</button>
          <button className="wiki-btn" style={{ flex: 2, padding: '10px', background: 'var(--primary-color)', color: 'white', border: 'none' }} onClick={handleBatchSave}>일괄 저장 적용</button>
        </div>
      </div>
    </div>
  );
};

export default BatchImageModal;