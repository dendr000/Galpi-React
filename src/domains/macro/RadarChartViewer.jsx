// 파일 위치: src/components/macro/viewer/RadarChartViewer.jsx
// 기능 요약: recharts 라이브러리를 활용하여 마크다운 본문 내 [스탯: ...] 매크로 데이터를 선언적 애니메이션 방사형 차트로 시각화하는 전용 컴포넌트
// 버전: v2.1.0

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const RadarChartViewer = ({ dataStr }) => {
  console.log("[RadarChartViewer] 스탯 차트 데이터 파싱 및 컴포넌트 마운트 실행. 원본 데이터:", dataStr);

  // 데이터 가공 단락
  const pairs = dataStr.split(',').map(s => s.trim().split('='));
  const chartData = [];

  pairs.forEach(p => {
    if (p.length === 2) {
      const label = p[0].trim();
      const val = parseInt(p[1], 10) || 0;
      chartData.push({ subject: label, value: val, fullMark: 100 });
    }
  });

  console.log("[RadarChartViewer] Recharts 매핑 구조체 변환 완료 데이터:", chartData);

  if (chartData.length < 3) {
    console.warn("[RadarChartViewer] 꼭짓점 개수 부족 오류 발생 (최소 3개 필요)");
    return <div style={{ color: '#e53e3e', fontSize: '12px', padding: '10px' }}>[스탯 분석 실패: 항목 3개 이상 필요]</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '25px 0', background: 'var(--surface-color)', padding: '25px 15px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ mountaineer: 'block', fontWeight: 900, fontSize: '14px', marginBottom: '15px', color: 'var(--text-primary)', letterSpacing: '1px' }}>📊 스탯 분석 차트</div>
      <div style={{ width: '100%', height: '300px', maxWidth: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="var(--border-color)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-primary)', fontSize: 11, fontWeight: 'bold' }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} />
            {/* isAnimationActive 속성을 통해 부드러운 스르륵 애니메이션 적용 */}
            <Radar name="스탯" dataKey="value" stroke="var(--primary-color)" fill="var(--primary-color)" fillOpacity={0.3} isAnimationActive={true} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RadarChartViewer;