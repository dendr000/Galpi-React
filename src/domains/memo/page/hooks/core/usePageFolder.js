import api from '../../../../../api/axiosCore';

export const usePageFolder = ({ memos, setMemos, folders, setFolders, currentFolder, setCurrentFolder }) => {
  
  const handleAddFolder = (parentPath = '') => {
    const promptMsg = parentPath 
      ? `[${parentPath}] 하위에 생성할 폴더명:` 
      : "새로운 최상위 폴더 이름을 입력하세요:";
    const name = prompt(promptMsg);
    
    if (name && name.trim()) {
      const newPath = parentPath ? `${parentPath}/${name.trim()}` : name.trim();
      if (!folders.includes(newPath)) {
        setFolders(prev => [...prev, newPath]);
        setCurrentFolder(newPath);
      } else {
        alert("이미 존재하는 경로입니다.");
      }
    }
  };

  const handleEditFolder = async (targetPath) => {
    const path = targetPath || currentFolder;
    if (["전체 메모", "기타"].includes(path)) return alert("기본 시스템 폴더는 이름을 수정할 수 없습니다.");
    
    const oldName = path.split('/').pop();
    const parentPath = path.substring(0, path.lastIndexOf('/'));
    const newName = prompt("수정할 폴더 이름을 입력하세요:", oldName);
    
    if (newName && newName.trim() && newName.trim() !== oldName) {
      const finalPath = parentPath ? `${parentPath}/${newName.trim()}` : newName.trim();
      if (folders.includes(finalPath)) return alert("이미 존재하는 폴더명입니다.");
      
      setFolders(prev => prev.map(f => {
        if (f === path) return finalPath;
        if (f.startsWith(`${path}/`)) return f.replace(`${path}/`, `${finalPath}/`);
        return f;
      }));
      
      const newData = memos.map(m => {
        if (m.folder === path) return { ...m, folder: finalPath, updatedAt: Date.now() };
        if (m.folder && m.folder.startsWith(`${path}/`)) return { ...m, folder: m.folder.replace(`${path}/`, `${finalPath}/`), updatedAt: Date.now() };
        return m;
      });
      setMemos(newData);
      setCurrentFolder(finalPath);
      
      const affectedMemos = newData.filter(m => m.folder === finalPath || m.folder?.startsWith(`${finalPath}/`));
      Promise.all(affectedMemos.map(m => {
        const isEdit = !String(m.id).startsWith("local_") && String(m.id).length < 13;
        return isEdit ? api.put(`/api/memos/${m.id}`, m) : Promise.resolve();
      })).catch(e => console.warn("[usePageFolder] 폴더명 변경 동기화 실패", e));
    }
  };

  const handleDeleteFolder = async (targetPath) => {
    const path = targetPath || currentFolder;
    if (["전체 메모", "기타"].includes(path)) return alert("기본 시스템 폴더는 삭제할 수 없습니다.");
    
    if (window.confirm(`'${path}' 폴더를 삭제하시겠습니까?\n(내부에 있던 메모는 모두 '기타' 폴더로 이관됩니다)`)) {
      setFolders(prev => prev.filter(f => f !== path && !f.startsWith(`${path}/`)));
      
      const newData = memos.map(m => {
        if (m.folder === path || (m.folder && m.folder.startsWith(`${path}/`))) {
          return { ...m, folder: "기타", updatedAt: Date.now() };
        }
        return m;
      });
      setMemos(newData);
      setCurrentFolder("기타");

      const affectedMemos = newData.filter(m => m.folder === "기타");
      Promise.all(affectedMemos.map(m => {
        const isEdit = !String(m.id).startsWith("local_") && String(m.id).length < 13;
        return isEdit ? api.put(`/api/memos/${m.id}`, m) : Promise.resolve();
      })).catch(e => console.warn("[usePageFolder] 폴더 삭제 동기화 실패", e));
    }
  };

  return { handleAddFolder, handleEditFolder, handleDeleteFolder };
};