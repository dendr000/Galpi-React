// 파일 위치: src/domains/memo/utils/memoTreeUtils.js
// 기능 요약: 슬래시(/)로 구분된 1차원 폴더명 배열과 메모 데이터를 병합하여, 다중 계층(Tree) 객체 구조로 파싱하는 유틸리티

export const buildMemoTree = (folders, memos, sortMap) => {
  // 트리의 최상위 루트 노드 초기화
  const root = { path: 'root', name: 'root', depth: -1, children: {}, memos: [] };

  // 1. 폴더 계층 트리 빌드 (기본적으로 경로 자체를 가나다순으로 사전 정렬)
  const allPaths = [...new Set([...folders])].sort((a, b) => a.localeCompare(b, 'ko-KR'));
  
  allPaths.forEach(path => {
    if (!path) return;
    const parts = path.split('/');
    let current = root;
    let currentPath = '';

    parts.forEach((part, i) => {
      currentPath = currentPath === '' ? part : `${currentPath}/${part}`;
      if (!current.children[part]) {
        current.children[part] = {
          path: currentPath,
          name: part,
          depth: i,
          children: {},
          memos: []
        };
      }
      current = current.children[part];
    });
  });

  // 2. 메모 데이터를 해당 폴더 위치에 할당
  memos.forEach(m => {
    if (m.isTrash) return; // 휴지통은 별도 처리
    const folderPath = m.folder || '기타';
    const parts = folderPath.split('/');
    let current = root;
    
    parts.forEach(part => {
      if (current.children[part]) {
        current = current.children[part];
      }
    });
    current.memos.push(m);
  });

  // 3. 각 폴더 내부의 하위 폴더와 메모들을 가나다순으로 정렬
  const sortNode = (node) => {
    // ★ 핵심 픽스: 사용자가 지정한 정렬 기준이 없다면 무조건 '이름순(name)'으로 강제하여 가나다순 정렬 보장
    const sortBy = sortMap[node.path] || 'name'; 
    
    node.memos.sort((a, b) => {
      if (sortBy === 'name') return (a.title || '').localeCompare(b.title || '', 'ko-KR');
      if (sortBy === 'custom') return (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999);
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });
    
    // 자식 폴더들(children) 역시 객체 키값을 기준으로 완벽하게 가나다순으로 정렬하여 재조립
    const sortedChildren = {};
    Object.keys(node.children)
      .sort((a, b) => a.localeCompare(b, 'ko-KR'))
      .forEach(key => {
        sortedChildren[key] = node.children[key];
        // 재귀적으로 깊은 하위 폴더까지 모두 정렬
        sortNode(sortedChildren[key]);
      });
      
    node.children = sortedChildren;
  };
  
  sortNode(root);

  return root;
};