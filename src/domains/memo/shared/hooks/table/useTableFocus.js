// 파일 위치: src/domains/memo/shared/hooks/table/useTableFocus.js
// 기능 요약: 에디터 내에서 표(Table) 셀의 포커스 상태를 감지하여 제어 툴바의 표시 여부를 결정하는 센서 훅
import { useState, useEffect } from 'react';

export const useTableFocus = ({ editorRef, activeCellRef }) => {
  const [tableCtrlVisible, setTableCtrlVisible] = useState(false);
  // ★ 에디터 안에 표가 하나라도 있는지(현재 커서 위치와 무관하게) — 컨트롤바가 처음
  // 마운트되는 순간의 레이아웃 시프트를 막기 위한 "자리 예약" 용도로만 쓴다.
  const [hasTable, setHasTable] = useState(false);

  // 표 칸을 처음 클릭하면 컨트롤바가 새로 "마운트"되면서 sticky 툴바 높이가 늘어나 에디터가
  // 통째로 아래로 밀리는 레이아웃 시프트가 있었다(실측 75px). 이 시프트가 사용자가 바로 이어서
  // 입력하는 첫 글자(한글 IME 조합 시작)와 겹치면 캐럿 위치가 어긋나서 "근력"이 "ㄱㅡㄴ력"처럼
  // 자모로 풀어져 입력되는 버그였다. 리렌더를 한 프레임 미루는 방식(requestAnimationFrame)으로
  // 먼저 시도했지만, 사람이 아주 빠르게 연타하면 여전히 겹치는 경우가 있어 부족했다 — 그래서
  // 아예 "표가 있으면 컨트롤바 자리를 항상 미리 확보해두고(visibility만 토글)" 방식으로 바꿔서
  // 첫 클릭 시점엔 이미 자리가 있어 레이아웃이 절대 안 움직이게 만든다. 그 자리 확보 여부를
  // 결정하는 게 이 hasTable이고, MutationObserver로 표 삽입/삭제/최초 로드를 전부 감지한다.
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    const refresh = () => {
      setHasTable(prev => {
        const found = !!el.querySelector('table');
        return prev === found ? prev : found;
      });
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(el, { childList: true, subtree: true });
    return () => observer.disconnect();
  });

  const checkTableFocus = () => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0 && editorRef.current) {
      let node = sel.anchorNode;
      if (node && node.nodeType === 3) node = node.parentNode;

      if (node && editorRef.current.contains(node)) {
        const cell = node.closest('td, th');
        if (cell) {
          activeCellRef.current = cell;
          setTableCtrlVisible(true);
          return true;
        }
      }
    }
    activeCellRef.current = null;
    setTableCtrlVisible(false);
    return false;
  };

  return { tableCtrlVisible, setTableCtrlVisible, hasTable, checkTableFocus };
};
