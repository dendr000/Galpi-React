// 파일 위치: src/domains/memo/hooks/useMemoSidebar.js
import { useMemoFolder } from './useMemoFolder';
import { useMemoSortAndDrag } from './useMemoSortAndDrag';
import { useMemoMenu } from './useMemoMenu';
import { useMemoTree } from './useMemoTree';
import { useMemoTags } from './useMemoTags';

export const useMemoSidebar = (props) => {
  const folderHooks = useMemoFolder(props);
  const sortDragHooks = useMemoSortAndDrag(props);
  const menuHooks = useMemoMenu(props);
  
  // ★ 트리 렌더러가 가나다순/최신순 정렬을 수행할 수 있도록 sortMap 데이터를 명시적으로 주입
  const treeHooks = useMemoTree({ ...props, sortMap: sortDragHooks.sortMap });
  
  const tagHooks = useMemoTags(props.memoData);

  return { ...folderHooks, ...sortDragHooks, ...menuHooks, ...treeHooks, ...tagHooks };
};