// 파일 위치: src/pages/MemoWorkspace/canvas/MemoEdge.jsx
// 기능 요약: 두 메모를 잇는 화살표 관계선을 그리는 컴포넌트. 반지름 절단 및 평행선 수학 공식 적용.
// 버전: v1.0.0

import React from 'react';
import { EdgeLabelRenderer } from '@xyflow/react';

const MemoEdge = ({ id, sourceX, sourceY, targetX, targetY, selected, data, label }) => {
  const isBi = data?.type === '<->';
  const isDashed = data?.type === '--';
  
  let dx = targetX - sourceX; 
  let dy = targetY - sourceY; 
  let dist = Math.sqrt(dx * dx + dy * dy) || 1;

  // 노드 중심에서 시작하지 않고 경계선에서 시작하도록 여백(반지름 추정치) 적용
  let r1 = 140; // 가로가 긴 메모 형태이므로 여백을 크게 잡음
  let r2 = 140;
  
  // 거리가 너무 짧으면 선을 숨김 처리
  if (dist < 150) return null;

  let sx = sourceX + (dx * r1) / dist;
  let sy = sourceY + (dy * r1) / dist;
  let tx = targetX - (dx * r2) / dist;
  let ty = targetY - (dy * r2) / dist;

  let sdx = tx - sx;
  let sdy = ty - sy;
  let sdist = Math.sqrt(sdx * sdx + sdy * sdy) || 1;
  let nx = -sdy / sdist; 
  let ny = sdx / sdist;

  let strokeColor = selected ? '#e53e3e' : (isBi ? 'var(--primary-color)' : 'var(--text-secondary)');
  let strokeWidth = selected || isBi ? 2.5 : 1.5;
  let dashStyle = isDashed ? '5,5' : 'none';

  let mEndAct = 'url(#memo-arr-active)';
  let mEndNorm = 'url(#memo-arr-normal)';
  let mEnd = selected ? mEndAct : (isBi ? mEndAct : mEndNorm);

  let angle = Math.atan2(sdy, sdx) * (180 / Math.PI);
  let textAngle = angle;
  if (textAngle > 90 || textAngle < -90) textAngle += 180;

  const labelBoxStyle = {
    background: 'var(--surface-color)', padding: '2px 8px', border: `1px solid ${strokeColor}`, 
    borderRadius: '4px', fontSize: '11px', fontWeight: '900', textAlign: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
  };

  if (isBi) {
    let gap = 12; 
    let l1x1 = sx + nx * gap; let l1y1 = sy + ny * gap;
    let l1x2 = tx + nx * gap; let l1y2 = ty + ny * gap;
    let l2x1 = tx - nx * gap; let l2y1 = ty - ny * gap;
    let l2x2 = sx - nx * gap; let l2y2 = sy - ny * gap;

    let c1x = (l1x1 + l1x2) / 2; let c1y = (l1y1 + l1y2) / 2;
    let c2x = (l2x1 + l2x2) / 2; let c2y = (l2y1 + l2y2) / 2;

    return (
      <>
        <line x1={l1x1} y1={l1y1} x2={l1x2} y2={l1y2} stroke={strokeColor} strokeWidth={strokeWidth} markerEnd={mEnd} opacity="0.85" />
        <line x1={l2x1} y1={l2y1} x2={l2x2} y2={l2y2} stroke={strokeColor} strokeWidth={strokeWidth} markerEnd={mEnd} opacity="0.85" />
        <line x1={sourceX} y1={sourceY} x2={targetX} y2={targetY} stroke="transparent" strokeWidth={30} style={{ cursor: 'pointer' }} />
        <EdgeLabelRenderer>
          {label && (
            <div style={{ position: 'absolute', transform: `translate(-50%, -50%) translate(${c1x}px,${c1y}px) rotate(${textAngle}deg)`, pointerEvents: 'all' }} className="nodrag nopan">
              <div style={{ ...labelBoxStyle, color: 'var(--primary-color)' }}>➔ {label}</div>
            </div>
          )}
          {data?.descRev && (
            <div style={{ position: 'absolute', transform: `translate(-50%, -50%) translate(${c2x}px,${c2y}px) rotate(${textAngle}deg)`, pointerEvents: 'all' }} className="nodrag nopan">
              <div style={{ ...labelBoxStyle, borderColor: '#e53e3e', color: '#e53e3e' }}>⬅ {data.descRev}</div>
            </div>
          )}
        </EdgeLabelRenderer>
      </>
    );
  }

  let cx = (sx + tx) / 2; 
  let cy = (sy + ty) / 2;
  return (
    <>
      <line x1={sx} y1={sy} x2={tx} y2={ty} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={dashStyle} markerEnd={isDashed ? undefined : mEnd} opacity="0.85" />
      <line x1={sourceX} y1={sourceY} x2={targetX} y2={targetY} stroke="transparent" strokeWidth={30} style={{ cursor: 'pointer' }} />
      <EdgeLabelRenderer>
        {label && (
          <div style={{ position: 'absolute', transform: `translate(-50%, -50%) translate(${cx}px,${cy}px) rotate(${textAngle}deg)`, pointerEvents: 'all' }} className="nodrag nopan">
            <div style={{ ...labelBoxStyle, color: strokeColor }}>{label}</div>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};

export default MemoEdge;