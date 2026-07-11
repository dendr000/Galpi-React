import { useEffect } from 'react';
import useSettingStore from '../store/useSettingStore';

export const useBossKey = () => {
  const { bossKey, toggleBlind } = useSettingStore();
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      const keys = bossKey.split('+');
      const reqCtrl = keys.includes('Ctrl'), reqAlt = keys.includes('Alt'), reqShift = keys.includes('Shift');
      const mainKey = keys[keys.length - 1].toUpperCase();
      let k = e.key.toUpperCase();
      if (e.code?.startsWith('Key')) k = e.code.replace('Key', '');
      else if (e.code?.startsWith('Digit')) k = e.code.replace('Digit', '');
      else if (k === ' ') k = 'SPACE'; else if (k === 'ESCAPE') k = 'ESC';

      if ((e.ctrlKey || e.metaKey) === reqCtrl && e.altKey === reqAlt && e.shiftKey === reqShift && k === mainKey) {
        e.preventDefault(); e.stopPropagation(); toggleBlind();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [bossKey, toggleBlind]);
};