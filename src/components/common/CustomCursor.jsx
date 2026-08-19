// 파일 위치: src/components/common/CustomCursor.jsx

import React, { useEffect, useRef, useState } from 'react';
import useSettingStore from '../../store/useSettingStore';

const CustomCursor = () => {
  const { isCustomCursor, cursorColor } = useSettingStore();
  
  const dotRef = useRef(null);
  const outlineRef = useRef(null);
  const requestRef = useRef(null);

  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const outline = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    if (!isCustomCursor) {
      cancelAnimationFrame(requestRef.current);
      return;
    }

    const onMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    const onMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName?.toLowerCase() === 'a' ||
        target.tagName?.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        window.getComputedStyle(target).cursor === 'pointer'
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const animateCursor = () => {
      outline.current.x += (mouse.current.x - outline.current.x) * 0.15;
      outline.current.y += (mouse.current.y - outline.current.y) * 0.15;

      if (outlineRef.current) {
        outlineRef.current.style.transform = `translate3d(${outline.current.x}px, ${outline.current.y}px, 0) translate(-50%, -50%)`;
      }

      requestRef.current = requestAnimationFrame(animateCursor);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseover', onMouseOver);
    
    requestRef.current = requestAnimationFrame(animateCursor);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', onMouseOver);
      cancelAnimationFrame(requestRef.current);
    };
  }, [isCustomCursor]);

  if (!isCustomCursor) return null;

  const outlineDynamicStyle = {
    width: isHovering ? '60px' : '40px',
    height: isHovering ? '60px' : '40px',
    backgroundColor: isClicking ? cursorColor : 'transparent',
    borderColor: cursorColor,
    opacity: isClicking ? 0.5 : 1,
    transition: 'width 0.2s, height 0.2s, background-color 0.1s, opacity 0.1s, border-color 0.2s'
  };

  return (
    <>
      {/* ★ 핵심 픽스: 커스텀 커서가 활성화되면 웹페이지의 모든 기본 커서를 강제로 박살냄 */}
      <style>{`
        * {
          cursor: none !important;
        }
      `}</style>
      
      <div
        ref={outlineRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          borderStyle: 'solid',
          borderWidth: '1.5px',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999998,
          ...outlineDynamicStyle
        }}
      />
      
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 9999999,
        }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            backgroundColor: cursorColor,
            borderRadius: '50%',
            transform: `translate(-50%, -50%) scale(${isClicking ? 0.5 : 1})`,
            transition: 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s'
          }}
        />
      </div>
    </>
  );
};

export default CustomCursor;