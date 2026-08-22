// 파일 위치: src/components/common/StarryBackground.jsx
// 기능 요약: 헤더 설정에서 켜고 끄는 전역 배경 효과. 분류(장르) 태그와 무관하게 항상 동일하게 렌더링된다.
// 밤하늘 그라디언트 위에 잔별이 위로 천천히 떠오르며 반짝이는 캔버스 파티클.
import React, { useEffect, useRef } from 'react';

const STAR_COUNT = 90;

const StarryBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let animationId;
    let stars = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const makeStar = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.3 + 0.3,
      speed: Math.random() * 0.18 + 0.04, // 위로 떠오르는 속도
      phase: Math.random() * Math.PI * 2, // 반짝임 위상
      twinkleSpeed: Math.random() * 0.015 + 0.006,
    });

    resize();
    stars = Array.from({ length: STAR_COUNT }, makeStar);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        s.phase += s.twinkleSpeed;
        const twinkle = 0.5 + Math.sin(s.phase) * 0.5; // 0~1
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.15 + twinkle * 0.65})`;
        ctx.fill();

        if (!prefersReducedMotion) {
          s.y -= s.speed;
          if (s.y < -4) {
            s.y = height + 4;
            s.x = Math.random() * width;
          }
        }
      }
      animationId = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 20%, #1a2038 0%, #0a0d18 55%, #050609 100%)',
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

export default StarryBackground;
