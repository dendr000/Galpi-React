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
  const treeHooks = useFabMemoTree({ ...props, sortMap: sortDragHooks.sortMap });
  const tagHooks = useFabMemoTags(props.memoData);

  return { ...folderHooks, ...sortDragHooks, ...menuHooks, ...treeHooks, ...tagHooks };
};