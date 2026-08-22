// 파일 위치: src/components/common/GenreCursor.jsx
// 기능 요약: 작품의 장르 테마(무협·사이버펑크·아포칼립스 각 세부 방향)에 따라 지정된
// 영역(zoneId) 안에서만 커스텀 마우스 커서를 보여준다. 사용자의 전역 "마우스 커서 스무스
// 모션" 설정과는 별개로, 이 작품을 보는 동안에만 해당 테마의 커서가 나타난다.
// 움직임 로직은 useGenreCursorMotion.js에, 생김새는 GenreCursor.css에 있다 — 여기서는
// 테마→커서종류 매핑과, 종류별로 필요한 DOM 구조 선택만 다룬다.
import React, { useRef } from 'react';
import './GenreCursor.css';
import { useGenreCursorMotion } from './useGenreCursorMotion';

// 테마별 커서 없음(null)이면 아무것도 렌더링하지 않는다
const CURSOR_KIND = {
  'cyberpunk-neon': 'reticle',
  'cyberpunk-terminal': 'block',
  'cyberpunk-graffiti': 'chroma',
  'wuxia-ink': 'brush',
  'wuxia-blood': 'blade',
  'wuxia-ascend': 'orb',
  'apocalypse-rad': 'geiger',
  'apocalypse-infect': 'crosshair',
  'apocalypse-camp': 'campfire',
};

const GenreCursor = ({ theme, zoneId }) => {
  const kind = CURSOR_KIND[theme];
  const refs = {
    cursor: useRef(null),
    ghostA: useRef(null),
    ghostB: useRef(null),
    brushDot: useRef(null),
    brushGhosts: [useRef(null), useRef(null), useRef(null)],
    geigerPos: useRef(null),
    geigerVisual: useRef(null),
    campfire: useRef(null),
  };

  useGenreCursorMotion({ kind, zoneId, refs });

  if (!kind) return null;

  return (
    <>
      {/* 영역 안의 모든 자식 요소도 네이티브 커서를 감추도록 스코프된 스타일 */}
      <style>{`#${zoneId}, #${zoneId} * { cursor: none !important; }`}</style>

      {kind === 'reticle' && (
        <div ref={refs.cursor} className="gt-cursor gt-cursor-reticle" style={cursorBaseStyle} />
      )}

      {kind === 'block' && (
        <div ref={refs.cursor} className="gt-cursor gt-cursor-block" style={{ ...cursorBaseStyle, left: 0, top: 0 }} />
      )}

      {kind === 'chroma' && (
        <div ref={refs.cursor} className="gt-cursor gt-cursor-chroma" style={{ ...cursorBaseStyle, left: 0, top: 0 }}>
          <div ref={refs.ghostA} className="gt-cursor-chroma-ghost gt-cursor-chroma-red" />
          <div ref={refs.ghostB} className="gt-cursor-chroma-ghost gt-cursor-chroma-cyan" />
          <div className="gt-cursor-chroma-core" />
        </div>
      )}

      {kind === 'brush' && (
        <div ref={refs.cursor} className="gt-cursor">
          <div ref={refs.brushDot} className="gt-cursor-part gt-cursor-brush-dot" />
          {refs.brushGhosts.map((ref, i) => (
            <div key={i} ref={ref} className="gt-cursor-part gt-cursor-brush-ghost" style={{ width: 16 - i * 3, height: 16 - i * 3, opacity: 0.28 - i * 0.06 }} />
          ))}
        </div>
      )}

      {kind === 'blade' && (
        <div ref={refs.cursor} className="gt-cursor gt-cursor-blade" style={{ ...cursorBaseStyle, left: 0, top: 0 }} />
      )}

      {kind === 'orb' && (
        <div ref={refs.cursor} className="gt-cursor gt-cursor-orb" style={cursorBaseStyle} />
      )}

      {kind === 'geiger' && (
        <div ref={refs.cursor} className="gt-cursor">
          <div ref={refs.geigerPos} className="gt-cursor-part">
            <div ref={refs.geigerVisual} className="gt-cursor-geiger" />
          </div>
        </div>
      )}

      {kind === 'crosshair' && (
        <div ref={refs.cursor} className="gt-cursor gt-cursor-crosshair" style={{ ...cursorBaseStyle, left: 0, top: 0 }} />
      )}

      {kind === 'campfire' && (
        <div ref={refs.cursor} className="gt-cursor">
          <div ref={refs.campfire} className="gt-cursor-part gt-cursor-campfire" />
        </div>
      )}
    </>
  );
};

const cursorBaseStyle = { transform: 'translate(-50%, -50%)' };

export default GenreCursor;
