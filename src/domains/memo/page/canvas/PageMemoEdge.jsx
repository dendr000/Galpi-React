// 파일 위치: src/domains/memo/page/canvas/PageMemoEdge.jsx
// 기능 요약: React Flow의 핸들 좌표 유실(0,0) 버그를 원천 차단하고, 두 노드의 실제 절대 좌표와 크기를 기반으로 사각형 경계선 교점을 정밀 계산하는 화살표 컴포넌트
// 버전: v2.0.0

import React from 'react';
import { EdgeLabelRenderer, useReactFlow } from '@xyflow/react';

const PageMemoEdge = ({ id, source, target, selected, data, label }) => {
  const { getNode } = useReactFlow();
  const sourceNode = getNode(source);
  const targetNode = getNode(target);

  if (!sourceNode || !targetNode) return null;

  const sWidth = sourceNode.measured?.width || sourceNode.width || 260;
  const sHeight = sourceNode.measured?.height || sourceNode.height || 150;
  const tWidth = targetNode.measured?.width || targetNode.width || 260;
  const tHeight = targetNode.measured?.height || targetNode.height || 150;

  const sxCenter = (sourceNode.internals?.positionAbsolute?.x ?? sourceNode.position.x) + sWidth / 2;
  const syCenter = (sourceNode.internals?.positionAbsolute?.y ?? sourceNode.position.y) + sHeight / 2;
  const txCenter = (targetNode.internals?.positionAbsolute?.x ?? targetNode.position.x) + tWidth / 2;
  const tyCenter = (targetNode.internals?.positionAbsolute?.y ?? targetNode.position.y) + tHeight / 2;

  let dx = txCenter - sxCenter;
  let dy = tyCenter - syCenter;
  let dist = Math.sqrt(dx * dx + dy * dy) || 1;

  if (dist < 50) return null;

  const getIntersection = (w, h, vecX, vecY) => {
     const absDx = Math.abs(vecX);
     const absDy = Math.abs(vecY);
     if (absDx === 0 && absDy === 0) return { x: 0, y: 0 };
     
     const scale = Math.min((w / 2) / absDx, (h / 2) / absDy);
     return { x: vecX * scale, y: vecY * scale };
  };

  const sOffset = getIntersection(sWidth + 15, sHeight + 15, dx, dy);
  const tOffset = getIntersection(tWidth + 15, tHeight + 15, -dx, -dy);

  let finalSx = sxCenter + sOffset.x;
  let finalSy = syCenter + sOffset.y;
  let finalTx = txCenter + tOffset.x;
  let finalTy = tyCenter + tOffset.y;

  let sdx = finalTx - finalSx;
  let sdy = finalTy - finalSy;
  let sdist = Math.sqrt(sdx * sdx + sdy * sdy) || 1;
  let nx = -sdy / sdist; 
  let ny = sdx / sdist;

  const isBi = data?.type === '<->';
  const isDashed = data?.type === '--';
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
    let gap = 8; 
    
    let l1x1 = finalSx + nx * gap; let l1y1 = finalSy + ny * gap;
    let l1x2 = finalTx + nx * gap; let l1y2 = finalTy + ny * gap;
    let l2x1 = finalTx - nx * gap; let l2y1 = finalTy - ny * gap;
    let l2x2 = finalSx - nx * gap; let l2y2 = finalSy - ny * gap;

    let c1x = (l1x1 + l1x2) / 2; let c1y = (l1y1 + l1y2) / 2;
    let c2x = (l2x1 + l2x2) / 2; let c2y = (l2y1 + l2y2) / 2;

    return (
      <>
        <line x1={l1x1} y1={l1y1} x2={l1x2} y2={l1y2} stroke={strokeColor} strokeWidth={strokeWidth} markerEnd={mEnd} opacity="0.85" />
        <line x1={l2x1} y1={l2y1} x2={l2x2} y2={l2y2} stroke={strokeColor} strokeWidth={strokeWidth} markerEnd={mEnd} opacity="0.85" />
        <line x1={sxCenter} y1={syCenter} x2={txCenter} y2={tyCenter} stroke="transparent" strokeWidth={30} style={{ cursor: 'pointer' }} />
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

  let cx = (finalSx + finalTx) / 2; 
  let cy = (finalSy + finalTy) / 2;
  return (
    <>
      <line x1={finalSx} y1={finalSy} x2={finalTx} y2={finalTy} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={dashStyle} markerEnd={isDashed ? undefined : mEnd} opacity="0.85" />
      <line x1={sxCenter} y1={syCenter} x2={txCenter} y2={tyCenter} stroke="transparent" strokeWidth={30} style={{ cursor: 'pointer' }} />
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

export default PageMemoEdge;