// 파일 위치: src/domains/memo/hooks/useMemoFolder.js
import api from '../../../api/axiosCore';

export const useMemoFolder = ({ memoData, setMemoData, memoFolders, setMemoFolders, currentFolder, setCurrentFolder }) => {
  
  const handleAddFolder = (parentPath = '') => {
    const promptMsg = parentPath 
      ? `[${parentPath}] 하위에 생성할 폴더명:` 
      : "새로운 최상위 폴더 이름을 입력하세요:";
      
    const name = prompt(promptMsg);
    
    if (name && name.trim()) {
      const newPath = parentPath ? `${parentPath}/${name.trim()}` : name.trim();
      
      if (!memoFolders.includes(newPath)) {
        const newFolders = [...memoFolders, newPath];
        setMemoFolders(newFolders);
        localStorage.setItem('galpi-memo-folders', JSON.stringify(newFolders));
        setCurrentFolder(newPath);
      } else {
        alert("이미 존재하는 경로입니다.");
      }
    }
  };

  const handleEditFolder = async (targetPath) => {
    const path = targetPath || currentFolder;
    // ★ 필수 시스템 폴더인 기타'만 남기고 잉여 폴더 락 해제
    if (["기타"].includes(path)) {
      return alert("기본 시스템 폴더는 이름을 수정할 수 없습니다.");
    }

    const oldName = path.split('/').pop();
    const parentPath = path.substring(0, path.lastIndexOf('/'));
    
    const newName = prompt("수정할 폴더 이름을 입력하세요:", oldName);
    
    if (newName && newName.trim() && newName.trim() !== oldName) {
      const finalPath = parentPath ? `${parentPath}/${newName.trim()}` : newName.trim();
      
      if (memoFolders.includes(finalPath)) return alert("이미 존재하는 폴더명입니다.");
      
      const newFolders = memoFolders.map(f => {
        if (f === path) return finalPath;
        if (f.startsWith(`${path}/`)) return f.replace(`${path}/`, `${finalPath}/`);
        return f;
      });
      
      setMemoFolders(newFolders);
      localStorage.setItem('galpi-memo-folders', JSON.stringify(newFolders));
      
      const newData = memoData.map(m => {
        if (m.folder === path) return { ...m, folder: finalPath, updatedAt: Date.now() };
        if (m.folder && m.folder.startsWith(`${path}/`)) return { ...m, folder: m.folder.replace(`${path}/`, `${finalPath}/`), updatedAt: Date.now() };
        return m;
      });
      
      setMemoData(newData);
      localStorage.setItem('galpi-memos', JSON.stringify(newData));
      setCurrentFolder(finalPath);
    }
  };

  const handleDeleteFolder = async (targetPath) => {
    const path = targetPath || currentFolder;
    // ★ 필수 시스템 폴더인 '기타'만 남기고 잉여 폴더 락 해제
    if (["기타"].includes(path)) {
      return alert("기본 시스템 폴더는 삭제할 수 없습니다.");
    }
    
    if (window.confirm(`'${path}' 폴더와 그 하위 폴더를 삭제하시겠습니까?\n(내부에 있던 메모는 모두 '기타' 폴더로 자동 이동됩니다)`)) {
      const newFolders = memoFolders.filter(f => f !== path && !f.startsWith(`${path}/`));
      setMemoFolders(newFolders);
      localStorage.setItem('galpi-memo-folders', JSON.stringify(newFolders));
      
      const newData = memoData.map(m => {
        if (m.folder === path || (m.folder && m.folder.startsWith(`${path}/`))) {
          return { ...m, folder: "기타", updatedAt: Date.now() };
        }
        return m;
      });
      
      setMemoData(newData);
      localStorage.setItem('galpi-memos', JSON.stringify(newData));
      setCurrentFolder("기타");
    }
  };

  return { handleAddFolder, handleEditFolder, handleDeleteFolder };
};