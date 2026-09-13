// 파일 위치: src/pages/Login/components/LibraryScene.jsx
// 기능 요약: 시크릿 게이트 "서고의 등불" 시안. 책등 24권 중 어느 두 권이 정답인지는 이
// 컴포넌트도 모른다 — 그냥 더블클릭한 책의 순번을 그대로 useLoginSequence로 넘길 뿐이다.
import React, { useMemo, useState } from 'react';
import RevealInput from './RevealInput';

const TITLE_POOL = [
  "빛바랜 여름","돌아오지 않는 강","적막한 저녁의 기록","세 번째 계절","유리병 속 편지","낮은 파도","먼 곳의 등불","이름 없는 정원",
  "서른의 지도","잊혀진 항구","달빛 아래 서점","고요한 열차","마지막 페이지","그림자의 습관","바람이 부는 마을","작은 불빛 하나",
  "겨울의 손끝","떠도는 소문들","붉은 지붕 아래","오후 세 시의 정원","낡은 우체통","별을 세는 밤","조용한 이방인","시간의 뒷골목",
  "은빛 강가에서","안개 속 계단","기억의 서랍","마른 꽃다발","늦은 저녁 식탁","이름 모를 새","텅 빈 교실","작은 등대",
  "길고 긴 산책","흩어진 편지들","고요와 소음 사이","오래된 다리","젖은 신발 한 켤레","낯선 골목길","반쯤 열린 창","봄의 뒷모습",
  "마지막 손님","텅 빈 정거장","흐린 유리창","떨어지는 낙엽","조용한 다락방","희미한 발자국","작은 마을의 밤","오래된 라디오",
  "닫힌 문 너머","깊은 밤의 산책자","말없는 그림자","희미해지는 계절","조용한 부둣가","낡은 여행가방","적힌 적 없는 편지","텅 빈 놀이터",
  "흐르는 시간 속","마지막 여름날","작은 창가에서","오후의 그림자","닿지 않는 거리","조용한 시장 골목","떠나간 자리","희미한 종소리",
  "낮게 깔린 안개","작은 항아리","오래된 사진첩","말라버린 우물","저녁의 문턱","텅 빈 우체국","고요한 정오"
];
const SPINE_COLORS = ["#3a2418","#4a2f1c","#2e1c10","#523524","#38230f","#4a3018","#402812","#33210e"];
const ROWS = 3, COLS = 8;
export const ITEM_COUNT = ROWS * COLS;

const LibraryScene = ({ onHit, revealed, error, submitting, onSubmit }) => {
  const [pulledIdx, setPulledIdx] = useState(null);
  const items = useMemo(() => {
    const shuffled = [...TITLE_POOL].sort(() => Math.random() - 0.5);
    return Array.from({ length: ITEM_COUNT }, (_, i) => ({
      title: shuffled[i % shuffled.length],
      color: SPINE_COLORS[i % SPINE_COLORS.length],
      height: 76 + ((i * 17) % 24),
    }));
  }, []);

  const handleDouble = (i) => {
    setPulledIdx(i);
    setTimeout(() => setPulledIdx((cur) => (cur === i ? null : cur)), 900);
    onHit(i);
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, fontFamily: "'Noto Serif KR', serif",
      background: 'radial-gradient(ellipse 60% 45% at 50% 38%, rgba(201,162,39,0.09), transparent 70%), linear-gradient(180deg, #1a120b 0%, #2b1d14 55%, #1a120b 100%)'
    }}>
      <style>{`
        @keyframes galpiGateGrain { 0%{transform:translate(0,0);} 50%{transform:translate(-1px,1px);} 100%{transform:translate(1px,-1px);} }
      `}</style>
      <div style={{ position: 'absolute', top: '8%', left: 0, right: 0, textAlign: 'center', color: '#e8dcc3', letterSpacing: '0.12em', fontSize: '12.5px', opacity: 0.6 }}>
        가상의 서고 — 빗장은 어딘가 두 곳에 걸려 있습니다
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px', padding: '36px 6%' }}>
        {Array.from({ length: ROWS }, (_, r) => (
          <div key={r} style={{ display: 'flex', gap: '5px', height: '14vh', minHeight: '100px', maxHeight: '170px', alignItems: 'flex-end' }}>
            {Array.from({ length: COLS }, (_, c) => {
              const i = r * COLS + c;
              const it = items[i];
              const pulled = pulledIdx === i;
              return (
                <div
                  key={i}
                  onDoubleClick={() => handleDouble(i)}
                  style={{
                    flex: 1, height: '100%', borderRadius: '3px 3px 0 0', position: 'relative', cursor: 'pointer',
                    background: it.color, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.35), 2px 0 6px rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '12px',
                    transition: 'transform 0.35s cubic-bezier(.2,.7,.3,1.3)', transformOrigin: 'bottom center',
                    transform: pulled ? 'translateY(-30px) rotateZ(-2deg)' : undefined,
                  }}
                  onMouseEnter={(e) => { if (!pulled) e.currentTarget.style.transform = 'translateY(-8px)'; }}
                  onMouseLeave={(e) => { if (!pulled) e.currentTarget.style.transform = ''; }}
                >
                  <span style={{ writingMode: 'vertical-rl', fontSize: '11px', letterSpacing: '0.13em', color: 'rgba(232,220,195,0.5)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', maxHeight: '88%' }}>
                    {it.title}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <RevealInput
        visible={revealed}
        error={error}
        submitting={submitting}
        onSubmit={onSubmit}
        caption="빗장이 풀렸습니다 — 통과 문구를 속삭이세요"
        captionStyle={{ color: '#e8dcc3' }}
        panelStyle={{ background: 'rgba(18,12,7,0.9)', border: '1px solid #4a3620', borderRadius: '10px', padding: '24px 22px', boxShadow: '0 20px 50px rgba(0,0,0,0.55)' }}
        inputStyle={{ padding: '14px 16px', background: '#120c07', border: '1px solid #4a3620', borderRadius: '6px', color: '#e8dcc3', fontFamily: "'Noto Serif KR',serif", fontSize: '14px', textAlign: 'center', letterSpacing: '0.1em' }}
      />
    </div>
  );
};

export default LibraryScene;
