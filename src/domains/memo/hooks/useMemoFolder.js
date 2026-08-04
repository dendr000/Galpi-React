// 파일 위치: src/domains/memo/hooks/useMemoFolder.js
import api from '../../../api/axiosCore';

export const useMemoFolder = ({ memoData, setMemoData, memoFolders, setMemoFolders, currentFolder, setCurrentFolder }) => {
  const handleAddFolder = () => {
    const name = prompt("새로운 폴더 이름을 입력하세요:");
    if (name && name.trim() && !memoFolders.includes(name.trim())) {
      const newFolders = [...memoFolders, name.trim()];
      setMemoFolders(newFolders);
      localStorage.setItem('galpi-memo-folders', JSON.stringify(newFolders));
      setCurrentFolder(name.trim());
    }
  };

  const handleEditFolder = async () => {
    if (["전체 메모", "설정 아이디어", "기타"].includes(currentFolder)) {
      return alert("기본 폴더는 이름을 수정할 수 없습니다.");
    }
    const newName = prompt("수정할 폴더 이름을 입력하세요:", currentFolder);
    if (newName && newName.trim() && newName.trim() !== currentFolder) {
      const finalName = newName.trim();
      if (memoFolders.includes(finalName)) return alert("이미 존재하는 폴더명입니다.");
      
      const newFolders = memoFolders.map(f => f === currentFolder ? finalName : f);
      setMemoFolders(newFolders);
      localStorage.setItem('galpi-memo-folders', JSON.stringify(newFolders));
      
      const newData = memoData.map(m => m.folder === currentFolder ? { ...m, folder: finalName, updatedAt: Date.now() } : m);
      setMemoData(newData);
      localStorage.setItem('galpi-memos', JSON.stringify(newData));
      setCurrentFolder(finalName);

      const affectedMemos = newData.filter(m => m.folder === finalName);
      Promise.all(affectedMemos.map(m => {
        const isEdit = !String(m.id).startsWith("local_") && String(m.id).length < 13;
        return isEdit ? api.put(`/api/memos/${m.id}`, m) : Promise.resolve();
      })).catch(e => console.warn("폴더 일괄 동기화 통신 거부", e));
    }
  };

  const handleDeleteFolder = async () => {
    if (["전체 메모", "설정 아이디어", "기타"].includes(currentFolder)) {
      return alert("기본 폴더는 삭제할 수 없습니다.");
    }
    if (window.confirm(`'${currentFolder}' 폴더를 삭제하시겠습니까?\n(내부에 있던 메모는 모두 '기타' 폴더로 자동 이동되며 DB에 반영됩니다)`)) {
      const newFolders = memoFolders.filter(f => f !== currentFolder);
      setMemoFolders(newFolders);
      localStorage.setItem('galpi-memo-folders', JSON.stringify(newFolders));
      
      const newData = memoData.map(m => m.folder === currentFolder ? { ...m, folder: "기타", updatedAt: Date.now() } : m);
      setMemoData(newData);
      localStorage.setItem('galpi-memos', JSON.stringify(newData));
      setCurrentFolder("전체 메모");

      const affectedMemos = newData.filter(m => m.folder === "기타");
      Promise.all(affectedMemos.map(m => {
        const isEdit = !String(m.id).startsWith("local_") && String(m.id).length < 13;
        return isEdit ? api.put(`/api/memos/${m.id}`, m) : Promise.resolve();
      })).catch(e => console.warn("폴더 삭제 후 이동 동기화 실패", e));
    }
  };

  return { handleAddFolder, handleEditFolder, handleDeleteFolder };
};