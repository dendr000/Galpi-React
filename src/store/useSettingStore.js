// src/store/useSettingStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSettingStore = create(
  persist(
    (set) => ({
      // --- 화면 (Appearance) ---
      fontSize: '14', lineHeight: '1.6', fontFamily: 'default', layoutWidth: 'center',
      isCustomCursor: false, 
      cursorColor: '#3b5bdb', // ★ 커스텀 커서 색상 (기본값: 메인 파랑)
      
      // --- 에디터 (Editor) ---
      autoSaveInterval: '0', bossKey: 'Alt+X', blindTheme: 'aurora',
      
      // --- 보안 (Security) ---
      bootLock: false, hiddenCmd: '/unlock123',
      
      isBlindActive: false, // 블라인드 모드 활성화 여부
      
      updateSetting: (key, value) => set({ [key]: value }),
      toggleBlind: () => set((state) => ({ isBlindActive: !state.isBlindActive })),
    }),
    { name: 'galpi-settings' } // 로컬 스토리지에 자동 저장/불러오기
  )
);

export default useSettingStore;