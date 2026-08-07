// src/components/common/SettingModal.jsx
import React, { useState } from 'react';
import useSettingStore from '../../store/useSettingStore';

const SettingModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('appearance');
  const { fontSize, lineHeight, fontFamily, layoutWidth, autoSaveInterval, bossKey, blindTheme, bootLock, hiddenCmd, updateSetting } = useSettingStore();

  if (!isOpen) return null;

  // 단축키 캡처링 (util-blind.js 연동)
  const handleKeyCapture = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;
    let keys = [];
    if (e.ctrlKey || e.metaKey) keys.push('Ctrl');
    if (e.altKey) keys.push('Alt');
    if (e.shiftKey) keys.push('Shift');
    let k = e.key.toUpperCase();
    if (k === ' ') k = 'SPACE'; if (k === 'ESCAPE') k = 'ESC';
    keys.push(k);
    updateSetting('bossKey', keys.join('+'));
  };

  const tabs = [
    { id: 'appearance', icon: '👁️', label: '화면 및 텍스트' },
    { id: 'editor', icon: '⌨️', label: '에디터 및 단축키' },
    { id: 'security', icon: '🔒', label: '보안 및 인증' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999999 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '800px', height: '500px', display: 'flex', flexDirection: 'column', padding: 0 }}>
        
        <div style={{ background: 'var(--table-bg-alt)', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '18px' }}>⚙️ 갈피 환경 설정</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: '24px', cursor: 'pointer' }}>✖</button>
        </div>
        
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div style={{ width: '200px', background: 'var(--bg-color)', padding: '15px', borderRight: '1px solid var(--border-color)' }}>
            {tabs.map(t => (
              <div key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '12px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '6px', background: activeTab === t.id ? 'var(--table-bg-alt)' : '', color: activeTab === t.id ? 'var(--primary-color)' : 'var(--text-secondary)' }}>
                {t.icon} {t.label}
              </div>
            ))}
          </div>
          
          <div style={{ flex: 1, padding: '25px', overflowY: 'auto' }}>
            {activeTab === 'appearance' && (
              <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                <label style={{fontWeight:'bold'}}>글자 크기: {fontSize}px <input type="range" min="12" max="24" value={fontSize} onChange={e => updateSetting('fontSize', e.target.value)} style={{width:'100%'}} /></label>
                <label style={{fontWeight:'bold'}}>줄 간격: {lineHeight} <input type="range" min="1.2" max="2.5" step="0.1" value={lineHeight} onChange={e => updateSetting('lineHeight', e.target.value)} style={{width:'100%'}} /></label>
                <label style={{fontWeight:'bold'}}>레이아웃: <select className="form-group" value={layoutWidth} onChange={e => updateSetting('layoutWidth', e.target.value)}><option value="center">집중 모드 (가운데 정렬)</option><option value="full">전체 모드 (가로 100%)</option></select></label>
                <label style={{fontWeight:'bold'}}>글꼴: <select className="form-group" value={fontFamily} onChange={e => updateSetting('fontFamily', e.target.value)}><option value="default">기본 폰트</option><option value="serif">명조체</option><option value="monospace">모노스페이스</option></select></label>
              </div>
            )}
            {activeTab === 'editor' && (
              <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                <label style={{fontWeight:'bold'}}>보스 키 (화면 가리기 단축키): <input type="text" value={bossKey} readOnly onKeyDown={handleKeyCapture} style={{cursor:'pointer', padding:'8px', width:'100%', boxSizing:'border-box'}} placeholder="클릭 후 키보드 입력" /></label>
                <label style={{fontWeight:'bold'}}>블라인드 테마: <select className="form-group" value={blindTheme} onChange={e => updateSetting('blindTheme', e.target.value)}><option value="aurora">다크 오로라</option><option value="matrix">매트릭스 빗방울</option><option value="blackout">완전 암전</option></select></label>
                <label style={{fontWeight:'bold'}}>자동 저장: <select className="form-group" value={autoSaveInterval} onChange={e => updateSetting('autoSaveInterval', e.target.value)}><option value="0">사용 안함</option><option value="30">30초마다</option><option value="60">1분마다</option></select></label>
              </div>
            )}
            {activeTab === 'security' && (
              <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                <label style={{fontWeight:'bold', color:'#e53e3e'}}><input type="checkbox" checked={bootLock} onChange={e => updateSetting('bootLock', e.target.checked)} /> 서버 기동 시 사이트 전체 보안 잠금</label>
                <label style={{fontWeight:'bold'}}>히든 암호 해제 명령어: <input type="text" value={hiddenCmd} onChange={e => updateSetting('hiddenCmd', e.target.value)} placeholder="/unlock" style={{padding:'8px', width:'100%', boxSizing:'border-box'}} /></label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingModal;