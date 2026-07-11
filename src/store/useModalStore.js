import { create } from 'zustand';

export const useModalStore = create((set) => ({
  activeModal: null, 
  clipboardHistory: JSON.parse(localStorage.getItem('galpi-clipboard-history') || '[]'),
  
  openModal: (modalName) => set({ activeModal: modalName }),
  closeModal: () => set({ activeModal: null }),
  
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