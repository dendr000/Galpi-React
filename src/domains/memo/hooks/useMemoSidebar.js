// 파일 위치: src/domains/memo/hooks/useMemoSidebar.js
import { useMemoFolder } from './useMemoFolder';
import { useMemoSortAndDrag } from './useMemoSortAndDrag';
import { useMemoMenu } from './useMemoMenu';

export const useMemoSidebar = (props) => {
  const folderHooks = useMemoFolder(props);
  const sortDragHooks = useMemoSortAndDrag(props);
  const menuHooks = useMemoMenu(props);

  return { ...folderHooks, ...sortDragHooks, ...menuHooks };
};