// 파일 위치: src/components/macro/viewer/TimelineViewer.jsx
// 기능 요약: 마크다운 본문 내 [TIMELINE] 블록 내부의 사건 데이터 패킷을 구조화된 가로 세로 연표 그래픽 트리에 맞추어 선언적으로 바인딩
// 버전: v2.1.0

import React from 'react';

const TimelineViewer = ({ innerText }) => {
  console.log("[TimelineViewer] 타임라인 매크로 블록 내부 라인 분석 가동");
  const lines = innerText.trim().split('\n');
  const validEvents = [];

  lines.forEach(line => {
    const parts = line.split('::::');
    if (parts.length >= 1) {
      const dateVal = (parts[0] || "").trim();
      const titleVal = (parts[1] || "").trim();
      const descVal = (parts[2] || "").trim().replace(/<br>/g, '\n');
      
      if (dateVal || titleVal || descVal) {
        validEvents.push({ date: dateVal, title: titleVal, desc: descVal });
      }
    }
  });

  console.log(`[TimelineViewer] 파싱 완료된 유효 타임라인 사건 건수: ${validEvents.length}건`);

  if (validEvents.length === 0) return null;

  return (
    <div style={{ borderLeft: '3px solid var(--primary-color)', marginLeft: '10px', paddingLeft: '15px', display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px', marginBottom: '20px' }}>
      {validEvents.map((ev, index) => (
        <div key={index} style={{ position: 'relative' }}>
          {/* 타임라인 축 위의 동그란 포인트 마커 */}
          <div style={{ position: 'absolute', left: '-22px', top: '2px', width: '11px', height: '11px', borderRadius: '50%', background: 'var(--primary-color)', border: '2px solid var(--bg-color)', boxSizing: 'content-box' }} />
          {ev.date && <div style={{ fontWeight: 900, color: 'var(--primary-color)', fontSize: '13px' }}>{ev.date}</div>}
          {ev.title && <div style={{ fontWeight: 'bold', fontSize: '16px', marginTop: '2px', color: 'var(--text-primary)' }}>{ev.title}</div>}
          {ev.desc && <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{ev.desc}</div>}
        </div>
      ))}
    </div>
  );
};

export default TimelineViewer;