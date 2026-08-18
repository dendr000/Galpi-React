// 파일 위치: src/domains/fab_tools/BoilerplateModal.jsx
// 기능 요약: 비즈니스 훅을 주입받아 폴더/리스트/폼 및 환경설정 스위치를 그리는 팝업 컨테이너
// 버전: v2.3.0

import React, { useEffect } from 'react';
import ModalOverlay from '../../components/common/ModalOverlay';
import { useModalStore } from '../../store/useModalStore';
import { useBoilerplateData } from './hooks/useBoilerplateData';
import { IconFolder, IconPlus, IconEdit, IconTrash, IconChevronDown, IconZap, IconFileText, IconRocket, IconSave } from './components/FabIcons';

const BoilerplateModal = ({ showToast }) => {
  const { closeModal } = useModalStore();
  const bpData = useBoilerplateData(showToast);

  // ★ 모달이 열릴 때, 드래그해서 넘겨진 HTML 템플릿 초안이 있는지, 또는 '빈 폼 열기' 명령이 떨어졌는지 확인합니다.
  useEffect(() => {
    const draftHtml = localStorage.getItem('galpi-draft-bp');
    const isEmptyRequest = localStorage.getItem('galpi-draft-bp-empty');

    if (draftHtml) {
      bpData.setBpInput(prev => ({ ...prev, content: draftHtml }));
      localStorage.removeItem('galpi-draft-bp');
      if (showToast) showToast("✅ 선택된 영역이 템플릿 본문으로 로드되었습니다.");
    } else if (isEmptyRequest) {
      bpData.setBpInput({ title: '', content: '' }); // 폼 강제 비우기
      localStorage.removeItem('galpi-draft-bp-empty');
    }
  }, [bpData.setBpInput, showToast]);

  const inpSty = { padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', background: 'var(--surface-color)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' };

  return (
    <ModalOverlay 
      title={<span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IconZap size={16} /> 스마트 상용구 관리 원장</span>} 
      onClose={closeModal} 
      width="600px"
    >
      {/* 1. 폴더 시스템 컨트롤 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <IconFolder size={16} style={{ color: 'var(--primary-color)' }} />
          <select 
            value={bpData.activeFolder} 
            onChange={e => bpData.changeFolder(e.target.value)}
            style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)', fontWeight: 'bold', outline: 'none' }}
          >
            {bpData.bpFolders.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="wiki-btn" onClick={bpData.handleAddFolder} style={{ padding: '6px 8px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }} title="폴더 추가"><IconPlus size={14} /></button>
          <button className="wiki-btn" onClick={bpData.handleEditFolder} style={{ padding: '6px 8px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }} title="폴더 수정"><IconEdit size={14} /></button>
          <button className="wiki-btn" onClick={bpData.handleDeleteFolder} style={{ padding: '6px 8px', background: 'var(--surface-color)', border: '1px solid #e53e3e', color: '#e53e3e', display: 'flex', alignItems: 'center' }} title="폴더 삭제"><IconTrash size={14} /></button>
        </div>
      </div>

      {/* 2. 환경설정 토글 영역 신설 */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '12px', padding: '10px', background: 'var(--table-bg-alt)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 'bold' }}>
          <input type="checkbox" checked={bpData.isBpAuto} onChange={bpData.toggleBpAuto} style={{ accentColor: 'var(--primary-color)', width: '14px', height: '14px', cursor: 'pointer' }} />
          스페이스바 자동 치환 발동
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 'bold' }}>
          <input type="checkbox" checked={bpData.isBpPreview} onChange={bpData.toggleBpPreview} style={{ accentColor: 'var(--primary-color)', width: '14px', height: '14px', cursor: 'pointer' }} />
          타이핑 중 실시간 추천 팝업 표시
        </label>
      </div>

      {/* 3. 상용구 단건 입력 폼 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', height: '36px' }}>
        <input type="text" placeholder="단축어 명칭 (!검성)" value={bpData.bpInput.title} onChange={e => bpData.setBpInput({...bpData.bpInput, title: e.target.value})} style={{...inpSty, width: '120px'}} autoComplete="off" />
        <textarea placeholder="치환 본문 (커서: {#})" value={bpData.bpInput.content} onChange={e => bpData.setBpInput({...bpData.bpInput, content: e.target.value})} style={{...inpSty, flex: 1, resize: 'none', height: '100%', fontFamily: 'inherit'}} autoComplete="off" />
        
        {bpData.editingId ? (
          <div style={{ display: 'flex', gap: '4px' }}>
            <button className="wiki-btn" onClick={bpData.handleBpSave} style={{ padding: '8px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><IconSave size={14} /> 저장</button>
            <button className="wiki-btn outline-btn gray" onClick={bpData.handleBpCancelEdit} style={{ padding: '8px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>취소</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '4px' }}>
            <button className="wiki-btn primary-btn" onClick={bpData.handleBpSave} style={{ padding: '8px 16px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><IconPlus size={14} /> 추가</button>
            <button className="wiki-btn outline-btn gray" onClick={() => bpData.setIsBpBulkMode(!bpData.isBpBulkMode)} style={{ padding: '8px 10px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>일괄 <IconChevronDown size={14} /></button>
          </div>
        )}
      </div>
      
      {/* 4. 일괄 등록 벌크 모드 */}
      {bpData.isBpBulkMode && (
         <div style={{ padding: '10px', background: 'rgba(59,91,219,0.05)', border: '1px dashed var(--primary-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
           <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}><IconFileText size={14} /> 상용구 벌크 매크로 세션 등록 (단축어::::본문 양식 구분)</span>
           <textarea value={bpData.bpBulk} onChange={e => bpData.setBpBulk(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', resize: 'none', height: '80px', fontFamily: 'inherit', outline: 'none', background: 'var(--surface-color)', color: 'var(--text-primary)' }} placeholder="예시:&#13;&#10;!주인공::::비뢰검({#})이 울부짖었다."></textarea>
           <button className="wiki-btn primary-btn" onClick={bpData.handleBpBulk} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><IconRocket size={14} /> 서식 일괄 릴리즈</button>
         </div>
      )}
      
      {/* 5. 상용구 목록 리스트 */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '300px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {bpData.bpList.map(b => (
          <div key={b.id} className="bp-item" style={{ display: 'flex', padding: '10px 12px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '6px', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'var(--bg-color)', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>{b.category}</div>
            <div style={{ width: '100px', fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</div>
            <div style={{ flex: 1, color: 'var(--text-primary)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.content.replace('{#}', '[커서]')}</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => bpData.handleBpEdit(b)} style={{ border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>수정</button>
              <button onClick={() => bpData.handleBpDelete(b.id, b.title)} style={{ border: 'none', background: 'none', color: '#e53e3e', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>삭제</button>
            </div>
          </div>
        ))}
        {bpData.bpList.length === 0 && <div className="modal-empty" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>해당 폴더에 저장된 서식이 존재하지 않습니다.</div>}
      </div>
    </ModalOverlay>
  );
};

export default BoilerplateModal;