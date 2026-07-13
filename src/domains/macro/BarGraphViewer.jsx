// 파일 위치: src/components/macro/viewer/BarGraphViewer.jsx
// 기능 요약: 마크다운 본문 내 [게이지: ...] 매크로 데이터를 감지하여 리액트 트랙 CSS 트랜지션을 활용한 컴팩트 애니메이션 바 그래프로 시각화
// 버전: v2.1.0

import React, { useEffect, useState } from 'react';

const BarGraphViewer = ({ dataStr }) => {
  console.log("[BarGraphViewer] 게이지 바 데이터 수신 및 구조체 분리 세션 개시. 원본 데이터:", dataStr);

  const pairs = dataStr.split(',').map(s => s.trim().split('='));
  const [animate, setAnimate] = useState(false);

  // 마운트 시점에 애니메이션 트리거 가동
  useEffect(() => {
    console.log("[BarGraphViewer] 게이지 바 렌더링 완료. CSS 트랜지션 애니메이션 트리거 가동");
    const timer = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ margin: '15px 0', display: 'flex', flexDirection: 'column', gap: '10px', padding: '15px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', border_radius: '12px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
      {pairs.map((p, idx) => {
        if (p.length !== 2) return null;
        
        const label = p[0].trim();
        const valStr = p[1].trim();
        const valParts = valStr.split('/');
        const current = parseFloat(valParts[0]) || 0;
        const max = valParts.length > 1 ? parseFloat(valParts[1]) : 100;
        const percent = Math.min(100, Math.max(0, (current / max) * 100));

        let barColor = "var(--primary-color)";
        if (percent <= 30) barColor = "#e53e3e";
        else if (percent >= 80) barColor = "#10b981";

        console.log(`[BarGraphViewer] 라인 연산 결과: 레이블=${label}, 비율=${percent}%`);

        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '80px', fontWeight: 900, fontSize: '13px', color: 'var(--text-primary)', text_align: 'right', textAlign: 'right' }}>{label}</div>
            <div style={{ flex: 1, height: '14px', background: 'var(--table-bg-alt)', borderRadius: '8px', overflow: 'hidden', position: 'relative', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}>
              {/* 리액트 인라인 상태 바인딩을 통해 안전하고 부드러운 폭 변화 무빙 연산 가동 */}
              <div 
                style={{ 
                  height: '100%', borderRadius: '8px', background: barColor, 
                  width: animate ? `${percent}%` : '0%', 
                  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' 
                }}
              />
            </div>
            <div style={{ width: '65px', fontSize: '12px', font_weight: 'bold', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{valStr}</div>
          </div>
        );
      })}
    </div>
  );
};

export default BarGraphViewer;