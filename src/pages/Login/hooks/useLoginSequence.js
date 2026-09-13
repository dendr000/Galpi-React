// 파일 위치: src/pages/Login/hooks/useLoginSequence.js
// 기능 요약: 4개 로그인 시안이 공유하는 "정해진 두 지점을 순서대로 더블클릭 → 통과 문구 입력"
// 흐름. 정답 인덱스는 여기 코드 어디에도 없다 — 클릭할 때마다 서버로 시퀀스를 보내서
// 맞았는지 물어보고, 틀리면 그냥 조용히 처음부터 다시 시작한다(티 안 나게).
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axiosCore';
import useAuthStore from '../../../store/useAuthStore';

export const useLoginSequence = (theme) => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [sequence, setSequence] = useState([]);
  const [ticket, setTicket] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const hitIndex = useCallback(async (idx) => {
    if (revealed) return;
    const next = [...sequence, idx];
    setSequence(next);
    if (next.length < 2) return;

    try {
      const { data } = await api.post('/api/auth/check-sequence', { theme, sequence: next });
      if (data.ok) {
        setTicket(data.ticket);
        setRevealed(true);
      } else {
        setSequence([]);
      }
    } catch (e) {
      setSequence([]);
    }
  }, [sequence, revealed, theme]);

  const submitPassphrase = useCallback(async (passphrase) => {
    if (!ticket || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post('/api/auth/login', { ticket, passphrase });
      login(data.token);
      navigate('/');
    } catch (e) {
      setError('통과 문구가 일치하지 않습니다.');
    } finally {
      setSubmitting(false);
    }
  }, [ticket, submitting, login, navigate]);

  return { progress: sequence.length, revealed, error, submitting, hitIndex, submitPassphrase };
};
