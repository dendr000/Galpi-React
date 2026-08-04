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
  const treeHooks = useMemoTree(props);
  const tagHooks = useMemoTags(props.memoData);

  return { ...folderHooks, ...sortDragHooks, ...menuHooks, ...treeHooks, ...tagHooks };
};