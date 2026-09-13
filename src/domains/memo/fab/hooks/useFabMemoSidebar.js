// 파일 위치: src/domains/memo/fab/hooks/useFabMemoSidebar.js
import { useFabMemoFolder } from './useFabMemoFolder';
import { useFabMemoSortAndDrag } from './useFabMemoSortAndDrag';
import { useFabMemoMenu } from './useFabMemoMenu';
import { useFabMemoTree } from './useFabMemoTree';
import { useFabMemoTags } from './useFabMemoTags';

export const useFabMemoSidebar = (props) => {
  const folderHooks = useFabMemoFolder(props);
  const sortDragHooks = useFabMemoSortAndDrag(props);
  const menuHooks = useFabMemoMenu(props);
  // ★ useFabMemoSortAndDrag는 sortMap을 반환하지 않는다(currentSort/filteredMemos/handleSortChange만
  // 돌려줌) — 예전엔 여기서 sortDragHooks.sortMap(=항상 undefined)으로 덮어써서, 트리 렌더러가
  // 커스텀 정렬 순서를 절대 못 보고 있었다. props.sortMap(FabMemoModal이 들고 있는 진짜 값)을 그대로 쓴다.
  const treeHooks = useFabMemoTree(props);
  const tagHooks = useFabMemoTags(props.memoData);

  return { ...folderHooks, ...sortDragHooks, ...menuHooks, ...treeHooks, ...tagHooks };
};