import React, { useState, useEffect } from 'react';
import api from '../../api/axiosCore';
import ModalOverlay from '../../components/common/ModalOverlay';
import { useModalStore } from '../../store/useModalStore';

const BoilerplateModal = ({ showToast }) => {
  const { closeModal } = useModalStore();
  const [bpList, setBpList] = useState([]);
  const [bpInput, setBpInput] = useState({ title: '', content: '' });
  const [bpBulk, setBpBulk] = useState('');
  const [isBpBulkMode, setIsBpBulkMode] = useState(false);

  const inpSty = { padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', background: 'var(--surface-color)', color: 'var(--text-primary)', outline: 'none' };

  useEffect(() => {
    api.get('/api/boilerplates').then(res => setBpList(res.data));
  }, []);

  const handleBpAdd = async () => {
    const title = bpInput.title.trim();
    const content = bpInput.content;
    if (!title || !content.trim()) return alert("발동 단축어 키워드와 원고 본문을 입력하세요.");
    
    try {
      const res = await api.post('/api/boilerplates', { title, content, category: '공통' });
      setBpList(prev => [...prev, res.data]);
      setBpInput({ title: '', content: '' });
      showToast("smart 오토 상용구 서식 등록에 성공했습니다.");
    } catch (e) {}
  };

  const handleBpBulk = async () => {
    if (!bpBulk.trim()) return alert("상용구 대량 등록용 텍스트가 비어있습니다.");
    const lines = bpBulk.split('\n');
    let count = 0;
    
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      let title = ""; let content = "";
      
      if (line.includes('::::')) {
        const p = line.split('::::');
        title = p[0].trim(); content = p.slice(1).join('::::').trim();
      } else {
        const match = line.match(/^([^\(\)]+)\(([^\(\)]+)\)$/);
        if (match) {
           let k = match[1].trim(); let v = match[2].trim();
           if (/[가-힣]/.test(v) && !/[가-힣]/.test(k)) { k = match[2].trim(); v = match[1].trim(); }
           title = k; content = `${k}(${v})`;
        }
      }
      
      if (title && content && !bpList.some(b => b.title === title)) {
        await api.post('/api/boilerplates', { title, content, category: '공통' });
        count++;
      }
    }

    if (count > 0) {
      const res = await api.get('/api/boilerplates');
      setBpList(res.data);
      setBpBulk('');
      setIsBpBulkMode(false);
      showToast(`✨ 총 ${count}개의 문장형 상용구 인프라 배포 완료!`);
    } else {
      alert("배포 가능한 가용 라인이 존재하지 않거나 기존 원장과 중복됩니다.");
    }
  };

  return (
    <ModalOverlay title="⚡ 스마트 상용구 관리 원장" onClose={closeModal} width="600px">
      <div style={{ display: 'flex', gap: '10px' }}>
        <input type="text" placeholder="단축어 명칭 (!검성)" value={bpInput.title} onChange={e => setBpInput({...bpInput, title: e.target.value})} style={{...inpSty, flex: 1}} autoComplete="off" />
        <textarea placeholder="치환 본문 (커서: {#})" value={bpInput.content} onChange={e => setBpInput({...bpInput, content: e.target.value})} style={{...inpSty, flex: 2, resize: 'none', height: '36px', fontFamily: 'inherit'}} autoComplete="off" />
        <button className="wiki-btn primary-btn" onClick={handleBpAdd} style={{ padding: '8px 16px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>추가</button>
        <button className="wiki-btn outline-btn gray" onClick={() => setIsBpBulkMode(!isBpBulkMode)} style={{ padding: '8px 12px', background: 'var(--table-bg-alt)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>일괄 ▾</button>
      </div>
      
      {isBpBulkMode && (
         <div style={{ padding: '10px', background: 'rgba(59,91,219,0.05)', border: '1px dashed var(--primary-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
           <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>📝 상용구 벌크 매크로 세션 등록 (단축어::::본문 양식 구분)</span>
           <textarea value={bpBulk} onChange={e => setBpBulk(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', resize: 'none', height: '80px', fontFamily: 'inherit', outline: 'none', background: 'var(--surface-color)', color: 'var(--text-primary)' }} placeholder="예시:&#13;&#10;!주인공::::비뢰검({#})이 울부짖었다."></textarea>
           <button className="wiki-btn primary-btn" onClick={handleBpBulk} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🚀 서식 일괄 릴리즈</button>
         </div>
      )}
      
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '300px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {bpList.map(b => (
          <div key={b.id} className="bp-item" style={{ display: 'flex', padding: '12px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '6px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: '120px', fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</div>
            <div style={{ flex: 1, color: 'var(--text-primary)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '0 15px' }}>{b.content.replace('{#}', '[커서]')}</div>
            <button 
              className="bp-action-btn del"
              onClick={async () => { 
                if (window.confirm(`[${b.title}] 상용구를 완전히 제거합니까?`)) {
                  await api.delete(`/api/boilerplates/${b.id}`); 
                  setBpList(prev => prev.filter(x => x.id !== b.id)); 
                  showToast("🗑️ 단축 상용구 양식이 제거되었습니다.");
                }
              }} 
              style={{ border: 'none', background: 'none', color: '#e53e3e', cursor: 'pointer', fontWeight: 'bold' }}
            >
              삭제
            </button>
          </div>
        ))}
        {bpList.length === 0 && <div className="modal-empty" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>저장된 서식이 존재하지 않습니다.</div>}
      </div>
    </ModalOverlay>
  );
};

export default BoilerplateModal;