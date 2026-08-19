import React, { useEffect, useRef, useState } from 'react';
import useSettingStore from '../../store/useSettingStore';

const CustomCursor = () => {
  const { isCustomCursor } = useSettingStore();
  
  const dotRef = useRef(null);
  const outlineRef = useRef(null);
  const requestRef = useRef(null);

  // 마우스의 실제 위치
  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  // 테두리 원의 현재 위치
  const outline = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    // 설정에서 커스텀 커서를 껐을 경우 브라우저 기본 커서 복구 및 이벤트 해제
    if (!isCustomCursor) {
      document.body.style.cursor = 'auto';
      cancelAnimationFrame(requestRef.current);
      return;
    }

    // 커스텀 커서 사용 시 기본 마우스 커서 숨김
    document.body.style.cursor = 'none';

    const onMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      
      // 가운데 점은 마우스 위치로 즉각 이동 (translate3d로 하드웨어 가속)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    // 인터랙션 (호버) 감지 로직
    const onMouseOver = (e) => {
      // a 태그, button 태그, 커스텀 클릭 요소 등 감지
      const target = e.target;
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
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
      // 선형 보간(LERP): 0.15 (15%) 만큼 부드럽게 따라감
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
    
    // 애니메이션 루프 시작
    requestRef.current = requestAnimationFrame(animateCursor);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', onMouseOver);
      cancelAnimationFrame(requestRef.current);
      document.body.style.cursor = 'auto'; // 언마운트 시 복구
    };
  }, [isCustomCursor]);

  // 설정이 꺼져 있으면 아예 렌더링하지 않음
  if (!isCustomCursor) return null;

  // 상태에 따른 동적 스타일 (파란색 메인 테마 기준)
  // 평상시: 투명한 테두리
  // 호버 시: 테두리가 1.5배 커짐
  // 클릭 시: 순간적으로 원 내부가 색으로 가득 채워짐
  const outlineDynamicStyle = {
    width: isHovering ? '60px' : '40px',
    height: isHovering ? '60px' : '40px',
    backgroundColor: isClicking ? 'var(--primary-color)' : 'transparent',
    opacity: isClicking ? 0.5 : 1,
    transition: 'width 0.2s, height 0.2s, background-color 0.1s, opacity 0.1s'
  };

  return (
    <>
      {/* 바깥쪽 스무스한 트레일링 원 */}
      <div
        ref={outlineRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          border: '1.5px solid var(--primary-color)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999998,
          ...outlineDynamicStyle
        }}
      />
      {/* 안쪽 즉각 반응하는 작은 점 */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '6px',
          height: '6px',
          backgroundColor: 'var(--primary-color)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999999,
          // 클릭 시 안쪽 점은 살짝 작아지는 디테일
          transform: `scale(${isClicking ? 0.5 : 1})`,
          transition: 'transform 0.1s'
        }}
      />
    </>
  );
};

export default CustomCursor;