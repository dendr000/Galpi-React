import { useEffect } from 'react';

export const useHorizontalScroll = () => {
  useEffect(() => {
    const handleWheel = (e) => {
      let el = e.target;
      while (el && el !== document.body) {
        if (el.scrollWidth > el.clientWidth) {
          const style = window.getComputedStyle(el);
          if (['auto', 'scroll', 'overlay'].includes(style.overflowX)) {
            if (!(el.scrollHeight > el.clientHeight) || !['auto', 'scroll', 'overlay'].includes(style.overflowY)) {
              if (e.deltaY !== 0) { e.preventDefault(); el.scrollLeft += e.deltaY * 1.2; return; }
            }
          }
        }
        el = el.parentElement;
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);
};