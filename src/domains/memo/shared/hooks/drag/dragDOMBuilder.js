// 파일 위치: src/domains/memo/shared/hooks/drag/dragDOMBuilder.js
// 기능 요약: 드래그 핸들 및 드롭 인디케이터 UI에 필요한 전역 CSS 및 DOM 요소를 안전하게 생성하고 반환하는 유틸리티 모듈
export const initDragDOM = () => {
  if (typeof document === 'undefined') return {};

  // 1. 스타일 인젝션
  if (!document.getElementById('memo-block-drag-styles')) {
    const style = document.createElement('style');
    style.id = 'memo-block-drag-styles';
    style.innerHTML = `
      .memo-block-drag-handle {
        position: fixed; width: 20px; height: 24px; border-radius: 4px;
        display: none; align-items: center; justify-content: center;
        cursor: grab; z-index: 9999999; color: var(--text-secondary);
        background: transparent; transition: background 0.2s, color 0.2s;
        user-select: none;
      }
      .memo-block-drag-handle:hover {
        background: var(--table-bg-alt); color: var(--primary-color);
      }
      .memo-block-drag-handle:active { cursor: grabbing; }
      .memo-drop-indicator {
        position: fixed; height: 3px; background: var(--primary-color);
        border-radius: 2px; display: none; z-index: 9999999; pointer-events: none;
        box-shadow: 0 0 6px rgba(59,91,219,0.5);
      }
    `;
    document.head.appendChild(style);
  }

  // 2. 드래그 핸들 DOM 생성
  let handle = document.getElementById('memo-block-drag-handle');
  if (!handle) {
    handle = document.createElement('div');
    handle.id = 'memo-block-drag-handle';
    handle.className = 'memo-block-drag-handle';
    handle.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>';
    handle.draggable = true;
    document.body.appendChild(handle);
  }

  // 3. 드롭 인디케이터 DOM 생성
  let indicator = document.getElementById('memo-drop-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'memo-drop-indicator';
    indicator.className = 'memo-drop-indicator';
    document.body.appendChild(indicator);
  }

  return { handle, indicator };
};