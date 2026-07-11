import { useNavigate } from 'react-router-dom';
import api from '../api/axiosCore';

export const useBacklinkRouter = () => {
  const navigate = useNavigate();

  const triggerBacklink = async (keyword, currentWorkId) => {
    const rawKeyword = keyword.trim();
    const normalize = (str) => (str || "").replace(/\s+/g, '').toLowerCase();
    const searchKey = normalize(rawKeyword);

    // 1. 같은 작품 내의 캐릭터 먼저 스캔
    if (currentWorkId) {
      try {
        const res = await api.get(`/api/characters?workId=${currentWorkId}`);
        const targetChar = res.data.find(c => normalize(c.name) === searchKey);
        if (targetChar) {
          alert(`캐릭터 '${targetChar.name}' 페이지 내 앵커 이동 기능 구현 예정!`);
          return;
        }
      } catch (err) {
        console.warn("캐릭터 탐색 실패:", err);
      }
    }

    // 2. 캐릭터가 없으면 다른 세계관 작품인지 스캔
    try {
      const res = await api.get('/api/works');
      const targetWork = res.data.find(w => normalize(w.title) === searchKey);
      if (targetWork) {
        window.open(`/work/${targetWork.id}`, '_blank');
        return;
      }
    } catch (err) {
      console.warn("세계관 탐색 실패:", err);
    }

    alert(`'${rawKeyword}'에 해당하는 문서나 캐릭터를 찾을 수 없습니다.\n오타가 없는지 확인해 주세요.`);
  };

  return { triggerBacklink };
};