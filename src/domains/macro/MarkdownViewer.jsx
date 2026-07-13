// 파일 위치: src/components/macro/viewer/MarkdownViewer.jsx
// 기능 요약: marked 라이브러리를 거친 마크다운 정제 구문을 리액트 배열 요소 트리에 격리 바인딩하고, 특수 대형 매크로 태그들을 실시간 탐색하여 리액트 전용 서브 뷰어 컴포넌트 객체들로 치환 렌더링하는 토큰 코어 통제기
// 버전: v2.5.0

import React, { useEffect } from 'react';
import { parseWikiText } from '../../utils/markdownParser'; // 기존의 인라인 서식 파서 모듈 재사용
import RadarChartViewer from './RadarChartViewer';
import BarGraphViewer from './BarGraphViewer';
import TimelineViewer from './TimelineViewer';

// 글로벌 마크다운 공통 레이아웃 스타일 가동용 훅
const useMacroStyles = () => {
  useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById('galpi-macro-styles')) return;
    console.log("[MarkdownViewer] 전역 마크다운 매크로 박스 테마 CSS 룰셋 세션 인젝션 집행");
    const style = document.createElement('style');
    style.id = 'galpi-macro-styles';
    style.innerHTML = `
        .md-box { background: var(--surface-color); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 12px; }
        .md-h1 { color: var(--primary-color); border-bottom: 2px solid var(--border-color); padding-bottom: 6px; margin-top: 24px; margin-bottom: 14px; font-size: 20px; font-weight: 900; }
    `;
    document.head.appendChild(style);
  }, []);
};

const MarkdownViewer = ({ text }) => {
  console.log("[MarkdownViewer] 마크다운 변환 및 리액트 컴포넌트 분기 파이프라인 세션 시작");
  useMacroStyles();

  if (!text) {
    console.log("[MarkdownViewer] 본문 텍스트가 부재하여 빈 노드를 출력합니다.");
    return <div className="md-box" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>본문 내용이 존재하지 않습니다.</div>;
  }

  // 1단계: 기존의 고유명사 폰트, 색상, 백링크 및 표/인용구 위키 마스터 치환 함수 가동
  const parsedWiki = parseWikiText(text);

  // 2단계: 정규식 경계를 활용하여 스트링 덩어리와 특수 대형 매크로 블록 구역을 토큰 패턴으로 쪼갬
  console.log("[MarkdownViewer] 정규식 패턴 라인 스플릿 및 컴포넌트 토큰화 연산 집행");
  const tokenRegex = /(\[스탯:.*?\]|\[게이지:.*?\]|\[TIMELINE\][\s\S]*?\[\/TIMELINE\])/g;
  const tokens = parsedWiki.split(tokenRegex);

  // 3단계: 맵 루프를 순회하며 일반 문자열은 dangerouslySetInnerHTML 블록으로, 매크로는 순수 리액트 서브 뷰어 컴포넌트로 개별 격리 인스턴스화
  return (
    <div className="galpi-markdown-renderer-root" style={{ width: '100%', fontFamily: 'inherit' }}>
      {tokens.map((token, index) => {
        if (!token) return null;

        // A. 방사형 스탯 차트 매크로 차단 매핑 구역
        if (token.startsWith('[스탯:')) {
          const innerData = token.substring(4, token.length - 1);
          console.log(`[MarkdownViewer] 토큰 #${index} 레이더 차트 컴포넌트 치환 매핑 적중`);
          return <RadarChartViewer key={index} dataStr={innerData} />;
        }

        // B. 상태창 게이지 바 매크로 차단 매핑 구역
        if (token.startsWith('[게이지:')) {
          const innerData = token.substring(5, token.length - 1);
          console.log(`[MarkdownViewer] 토큰 #${index} 게이지 바 컴포넌트 치환 매핑 적중`);
          return <BarGraphViewer key={index} dataStr={innerData} />;
        }

        // C. 역사 타임라인 매크로 블록 차단 매핑 구역
        if (token.startsWith('[TIMELINE]')) {
          const innerData = token.replace(/\[\/?TIMELINE\]/g, '');
          console.log(`[MarkdownViewer] 토큰 #${index} 타임라인 연표 컴포넌트 치환 매핑 적중`);
          return <TimelineViewer key={index} innerText={innerData} />;
        }

        // D. 일반 마크다운 정제 텍스트 노드는 단일 박스 컨테이너 안에서 안전하게 삽입 출력
        console.log(`[MarkdownViewer] 토큰 #${index} 일반 위키 마크다운 텍스트 블록 렌더링`);
        return (
          <div 
            key={index} 
            className="md-box"
            style={{ color: 'var(--text-primary)', fontSize: '14px', lineHeight: '1.7', wordBreak: 'break-all' }}
            dangerouslySetInnerHTML={{ __html: token }} 
          />
        );
      })}
    </div>
  );
};

export default MarkdownViewer;