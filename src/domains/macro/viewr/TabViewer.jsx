// 파일 위치: src/components/macro/viewer/TabViewer.jsx
// 기능 요약: 세로 스크롤을 단축하기 위한 인라인 가로 탭 레이아웃 분할 렌더링 컴포넌트
// 버전: v1.0.0

import React, { useState } from 'react';

const TabViewer = ({ innerText }) => {
  console.log("[TabViewer] 인라인 탭 컨테이너 파싱 및 렌더링 개시");

  const [activeTab, setActiveTab] = useState(0);

  // [TAB:제목]내용[/TAB] 형태 파싱 정규식
  const tabs = [];
  const parts = innerText.split(/\[TAB:(.*?)\]/g);
  
  for (let i = 1; i < parts.length - 1; i += 2) {
    let title = parts[i].trim();
    let content = parts[i+1].replace(/\[\/TAB\]/g, '').trim();
    tabs.push({ title, content });
  }

  if (tabs.length === 0) return null;

  return (
    <div style={{ margin: '20px 0', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: 'var(--surface-color)', boxShadow: 'var(--shadow-sm)' }}>
      {/* 탭 헤더 */}
      <div style={{ display: 'flex', background: 'var(--table-bg-alt)', borderBottom: '1px solid var(--border-color)' }}>
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            style={{
              flex: 1,
              padding: '12px 15px',
              background: activeTab === idx ? 'var(--surface-color)' : 'transparent',
              color: activeTab === idx ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === idx ? '900' : 'bold',
              fontSize: '13px',
              border: 'none',
              borderBottom: activeTab === idx ? '3px solid var(--primary-color)' : '3px solid transparent',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* 탭 본문 내용 */}
      <div 
        style={{ padding: '20px', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-primary)', wordBreak: 'break-all' }}
        dangerouslySetInnerHTML={{ __html: tabs[activeTab].content.replace(/\n/g, '<br>') }}
      />
    </div>
  );
};

export default TabViewer;