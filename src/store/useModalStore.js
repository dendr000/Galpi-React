// 파일 위치: src/store/useModalStore.js
import { create } from 'zustand';

export const useModalStore = create((set) => ({
  activeModal: null, 
  subModal: null, // ★ 메인 모달(메모 팹 등) 위에 띄울 중첩 모달 상태 추가

  clipboardHistory: JSON.parse(localStorage.getItem('galpi-clipboard-history') || '[]'),
  
  openModal: (modalName) => set((state) => {
    // 메모 모달 위에 겹쳐서 띄울 수 있는 유틸리티 모달 목록
    const utilityModals = ['boilerplate', 'dict', 'clipboard', 'search', 'recent'];
    
    // ★ 핵심: 메모 팹이 켜져 있을 때, 유틸리티 모달을 열면 메인을 닫지 않고 '서브 모달' 계층으로 안전하게 띄움
    if (state.activeModal === 'memo' && utilityModals.includes(modalName)) {
      return { subModal: modalName };
    }
    
    // 그 외의 상황에서는 기존처럼 메인 모달을 교체
    return { activeModal: modalName, subModal: null };
  }),

  closeModal: () => set((state) => {
    // ★ 핵심: 서브 모달이 존재하면 메인 모달(메모 팹)을 살려두고 위에 뜬 서브 모달만 먼저 닫음 (LIFO 스택 팝)
    if (state.subModal) {
      return { subModal: null };
    }
    // 서브 모달이 없을 경우 메인 모달 닫기
    return { activeModal: null };
  }),
  
  addClipboard: (text) => set((state) => {
    const cleanText = text.trim();
    if (!cleanText) return state;
    let newHistory = state.clipboardHistory.filter(t => t !== cleanText);
    newHistory.unshift(cleanText);
    if (newHistory.length > 20) newHistory.pop();
    localStorage.setItem('galpi-clipboard-history', JSON.stringify(newHistory));
    return { clipboardHistory: newHistory };
  }),

  clearClipboard: () => {
    localStorage.setItem('galpi-clipboard-history', '[]');
    set({ clipboardHistory: [] });
  }
}));