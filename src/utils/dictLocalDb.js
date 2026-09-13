// 파일 위치: src/utils/dictLocalDb.js
// 기능 요약: 고유명사 사전(11만 건+)을 브라우저 IndexedDB에 한 번만 통째로 적재해두고, Alt+H
// 실시간 순환 치환이 그 인덱스를 조회해서 쓰도록 하는 로컬 캐시 계층. 예전엔 이 사전을 매번
// 서버에서 (그것도 작품별로 잘라서) 받아와 배열에 담고, Alt+H를 누를 때마다 그 배열 전체를
// 문자열 순회(endsWith)했다 — 전체 사전으로 확장하면서 배열 순회 방식은 더 이상 못 쓴다.
// 대신 커서 앞 텍스트에서 "가능한 길이의 접미사" 후보만 몇 개 뽑아 IndexedDB의 word 인덱스로
// 정확히 매치되는 것만 찾는다. 사전이 10만 건이든 100만 건이든 매칭 비용은 항상 일정하다.

const DB_NAME = 'galpi-dict-cache';
const DB_VERSION = 1;
const STORE = 'dicts';
const SEEDED_FLAG_KEY = 'galpi-dict-seeded-v1';

// Alt+H 순환치환 대상 원문의 최대 길이 방어선. 실제 사전 내 최장 원문(역천금강불사지체 등)도
// 10자 안팎이고, "원문(한자)" 순환 형태까지 고려해도 이 정도면 충분히 여유 있다.
const MAX_MATCH_LEN = 24;

let dbPromise = null;

const openDb = () => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('by_word', 'word', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
};

// word 인덱스로 정확히 일치하는 항목들(동음이의 한자 여러 개 가능)을 가져온다.
const lookupWord = async (word) => {
  if (!word) return [];
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const idx = tx.objectStore(STORE).index('by_word');
    const req = idx.getAll(word);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
};

// 이미 로컬에 사전이 적재돼 있는지(초기 1회 적재를 다시 안 하도록) 확인 후, 없으면 서버 전체
// 덤프를 받아 한 번에 채워 넣는다. 재방문 시엔 이 함수가 즉시 반환되어 네트워크 요청이 없다.
export const seedDictIfNeeded = async (apiClient) => {
  if (localStorage.getItem(SEEDED_FLAG_KEY)) return;
  try {
    const res = await apiClient.get('/api/dicts');
    const rows = res.data || [];
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      rows.forEach(row => store.put(row));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    localStorage.setItem(SEEDED_FLAG_KEY, String(Date.now()));
  } catch (e) {
    console.error('[dictLocalDb] 사전 로컬 캐시 초기 적재 실패', e);
  }
};

// 사전 모달에서 새로 등록/수정했을 때 전체 재적재 없이 로컬 캐시만 바로 갱신
export const upsertEntryLocal = async (entry) => {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(entry);
  } catch (e) {
    console.error('[dictLocalDb] 로컬 캐시 갱신 실패', e);
  }
};

// 삭제 시 로컬 캐시에서도 같은 word(+translation) 항목을 제거
export const removeEntryLocal = async (word, translation) => {
  try {
    const rows = await lookupWord(word);
    const targets = translation ? rows.filter(r => r.translation === translation) : rows;
    if (targets.length === 0) return;
    const db = await openDb();
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    targets.forEach(r => store.delete(r.id));
  } catch (e) {
    console.error('[dictLocalDb] 로컬 캐시 삭제 실패', e);
  }
};

// 사전을 통째로 바꿔야 할 때(대량 수정 등) 강제로 다시 적재
export const forceReseedDict = async (apiClient) => {
  localStorage.removeItem(SEEDED_FLAG_KEY);
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  await seedDictIfNeeded(apiClient);
};

// 순환 치환 한 사이클(다음 후보 문자열) 배열: [ 원문, 원문(한자1), 원문(한자2), ... ]
const buildCycleList = (word, matchingDicts) => {
  const cycleList = [word];
  matchingDicts.forEach(dict => {
    const trans = dict.translation;
    const parenMatch = trans.match(/\((.*?)\)/);
    const pureVal = parenMatch ? parenMatch[1] : trans.replace(word, '').replace(/[()]/g, '');
    cycleList.push(`${word}(${pureVal})`);
  });
  return cycleList;
};

// 커서 바로 앞 텍스트(textBefore)를 받아, 그 끝부분이 사전 원문(또는 이미 순환된 "원문(한자)"
// 형태) 중 하나와 일치하는지 찾아 다음 순환 후보로 치환할 정보를 돌려준다. 못 찾으면 null.
// 후보 접미사 길이를 긴 것부터 하나씩 시도하되, 조회 자체는 한 트랜잭션에서 병렬로 처리한다.
export const resolveCycleReplacement = async (textBefore) => {
  if (!textBefore) return null;
  const maxLen = Math.min(MAX_MATCH_LEN, textBefore.length);

  // 후보 접미사별로 "베이스 원문"을 뽑는다: "지체(之體)" 형태면 '(' 앞부분을, 아니면 그대로.
  const candidates = [];
  for (let len = maxLen; len >= 1; len--) {
    const suffix = textBefore.slice(-len);
    const parenIdx = suffix.indexOf('(');
    const base = parenIdx > 0 ? suffix.slice(0, parenIdx) : suffix;
    candidates.push({ suffix, base });
  }

  const uniqueBases = [...new Set(candidates.map(c => c.base))];
  const lookups = await Promise.all(uniqueBases.map(base => lookupWord(base)));
  const baseToRows = new Map(uniqueBases.map((base, i) => [base, lookups[i]]));

  // 긴 접미사부터 확인 — 가장 긴 매칭이 우선이어야 짧은 단어가 긴 단어를 가로채지 않는다.
  for (const { suffix, base } of candidates) {
    const rows = baseToRows.get(base);
    if (!rows || rows.length === 0) continue;

    const cycleList = buildCycleList(base, rows);
    const matchIdx = cycleList.indexOf(suffix);
    if (matchIdx === -1) continue;

    const nextIndex = (matchIdx + 1) % cycleList.length;
    return { matchLength: suffix.length, replacement: cycleList[nextIndex] };
  }

  return null;
};
