// 파일 위치: src/components/layout/fab/memo/useMemoSidebar.js
import { useMemoFolder } from './hooks/useMemoFolder';
import { useMemoSortAndDrag } from './hooks/useMemoSortAndDrag';
import { useMemoMenu } from './hooks/useMemoMenu';

export const useMemoSidebar = (props) => {
  const folderHooks = useMemoFolder(props);
  const sortDragHooks = useMemoSortAndDrag(props);
  const menuHooks = useMemoMenu(props);

  return { ...folderHooks, ...sortDragHooks, ...menuHooks };
};