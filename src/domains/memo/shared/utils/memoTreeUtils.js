// 파일 위치: src/domains/memo/shared/utils/memoTreeUtils.js
// 기능 요약: 1차원 평면 폴더 배열과 메모 배열을 순회하여 깊이(Depth)가 존재하는 재귀적 트리(Tree) 객체로 변환하는 순수 엔진
// 버전: v1.1.0 (가나다순/최신순 정렬 연동 및 undefined 방어 로직 탑재)

export const buildMemoTree = (memoFolders = [], memoData = [], sortMap = {}) => {
  // 트리의 뼈대가 될 루트(최상위) 객체 생성
  const tree = {
    name: 'root',
    path: 'root',
    depth: -1,
    children: {},
    memos: []
  };

  // 1. 등록된 모든 폴더 문자열을 스캔하여 빈 트리 구조 조립
  memoFolders.forEach(folderPath => {
    // 시스템 가상 폴더나 최상위가 아닌 것은 패스 (스마트 폴더에서 따로 처리)
    if (folderPath === "전체 메모" || folderPath === "기타") return;

    const parts = folderPath.split('/');
    let currentLevel = tree;

    parts.forEach((part, index) => {
      if (!currentLevel.children[part]) {
        currentLevel.children[part] = {
          name: part,
          path: parts.slice(0, index + 1).join('/'),
          depth: index,
          children: {},
          memos: []
        };
      }
      currentLevel = currentLevel.children[part];
    });
  });

  // 2. 개별 메모들을 알맞은 폴더 잎사귀(Node)에 배정
  memoData.forEach(memo => {
    if (memo.isTrash) return; // 휴지통 데이터 제외
    
    // 기타 메모는 루트에 바로 붙임 (단독 렌더링을 위해)
    if (!memo.folder || memo.folder === "기타" || memo.folder === "전체 메모") {
       tree.memos.push(memo);
       return;
    }

    const parts = memo.folder.split('/');
    let currentLevel = tree;
    
    // 메모의 폴더 경로가 트리에 없으면 강제로 빈 폴더 노드를 만들어 줌
    parts.forEach((part, index) => {
      if (!currentLevel.children[part]) {
        currentLevel.children[part] = {
          name: part,
          path: parts.slice(0, index + 1).join('/'),
          depth: index,
          children: {},
          memos: []
        };
      }
      currentLevel = currentLevel.children[part];
    });

    currentLevel.memos.push(memo);
  });

  // 3. 재귀 함수: 트리 안의 모든 하위 폴더와 메모들을 지정된 기준(sortMap)에 맞춰 정렬
  const sortNode = (node) => {
    // 💡 안전장치: sortMap이 없거나 해당 폴더의 정렬 기준이 없으면 기본값 'name'(이름순) 적용
    const sortType = (sortMap && sortMap[node.path]) ? sortMap[node.path] : 'name';

    // 해당 노드가 가진 메모들을 정렬
    node.memos.sort((a, b) => {
      if (sortType === 'name') return (a.title || "").localeCompare(b.title || "", 'ko-KR');
      if (sortType === 'custom') return (a.sortOrder !== undefined ? a.sortOrder : 9999) - (b.sortOrder !== undefined ? b.sortOrder : 9999);
      return b.updatedAt - a.updatedAt;
    });

    // 해당 노드가 가진 하위 폴더들도 가나다순으로 정렬
    const sortedChildren = {};
    Object.keys(node.children)
      .sort((a, b) => a.localeCompare(b, 'ko-KR'))
      .forEach(key => {
        sortedChildren[key] = node.children[key];
        sortNode(node.children[key]); // 자식 노드로 파고들며 재귀 정렬
      });
      
    node.children = sortedChildren;
  };

  // 루트 노드부터 시작하여 연쇄 정렬 실행
  sortNode(tree);

  return tree;
};