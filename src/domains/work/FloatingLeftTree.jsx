// 파일 위치: src/domains/work/FloatingLeftTree.jsx
// 기능 요약: 화면 좌측에 플로팅되어 하위 문서들의 계층(Tree) 구조를 시각화하고 빠른 이동을 지원하는 네비게이션 컴포넌트입니다.
// 버전: v1.1.0 (배열 타입 가드 및 렌더링 안전성 강화 버전)

import React from 'react';
import { useNavigate } from 'react-router-dom';

const FloatingLeftTree = ({ workId, pageId, wikiPages = [] }) => {
  console.log("[FloatingLeftTree] 렌더링 라이프사이클 시작. 타겟 pageId:", pageId);
  const navigate = useNavigate();

  // 1단계 방어: 전달받은 wikiPages가 명확한 배열 객체인지 검증하고, undefined나 null일 경우 빈 배열로 강제 치환합니다.
  const safeWikiPages = Array.isArray(wikiPages) ? wikiPages : [];
  console.log(`[FloatingLeftTree] 데이터 무결성 검증 완료. 유효 문서 노드 수: ${safeWikiPages.length}`);

  // 2단계: 최상단 부모 문서(parentId가 없는 노드)만 1차로 필터링하여 루트 트리를 구성합니다.
  const rootPages = safeWikiPages.filter(p => !p.parentId);

  // 계층형 노드 재귀 렌더링 함수
  const renderTree = (pages, level = 0) => {
    // 자식 노드가 없으면 빈 값을 반환하여 재귀를 종료합니다.
    if (!pages || pages.length === 0) {
      return null;
    }
    
    return (
      <ul className={`treeUl ${level === 0 ? 'rootTree' : ''}`}>
        {pages.map(page => {
          // 현재 렌더링 중인 페이지를 부모로 삼는 자식 문서들을 탐색합니다.
          const children = safeWikiPages.filter(p => String(p.parentId) === String(page.id));
          
          // 현재 사용자가 위치한 페이지인지 검사하여 하이라이트 스타일을 부여합니다.
          const isActive = String(page.id) === String(pageId);
          
          return (
            <li key={page.id} className="treeLi">
              <div 
                className={`treeNodeRow ${isActive ? 'activePage' : ''}`}
                onClick={() => {
                  console.log(`[FloatingLeftTree] 노드 클릭 감지. 문서 ID [${page.id}]로 라우팅 이동을 집행합니다.`);
                  navigate(`/work/${workId}?pageId=${page.id}`);
                }}
              >
                📄 {page.title}
              </div>
              {/* 자식 문서가 존재할 경우 재귀 함수를 호출하여 깊이(level)를 1 증가시키고 하위 트리를 렌더링합니다. */}
              {children.length > 0 && renderTree(children, level + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="floatingLeftTree">
      
      {/* 실제 문서 목록이 표시되는 숨겨진 좌측 패널 영역 */}
      <div className="treeContent">
        <div style={{ fontSize: '15px', fontWeight: 900, color: 'var(--primary-color)', marginBottom: '12px', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
          🗂️ 문서 트리
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {rootPages.length > 0 ? (
            renderTree(rootPages)
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '20px' }}>
              생성된 하위 문서가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* 화면 밖으로 빼꼼 튀어나와 호버 이벤트를 유도하는 손잡이 영역 */}
      <div 
        className="treeHandle" 
        onClick={() => console.log("[FloatingLeftTree] 트리 네비게이션 핸들 클릭 (CSS Hover 작동)")}
      >
        <div className="dash"></div>
        <div className="dash"></div>
        <div className="dash"></div>
      </div>
      
    </div>
  );
};

export default FloatingLeftTree;