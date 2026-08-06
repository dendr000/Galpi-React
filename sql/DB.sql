-- 1. 데이터베이스 생성 및 선택
CREATE DATABASE IF NOT EXISTS note DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE note;

-- =================================================================================
-- [독립 테이블 및 마스터 테이블]
-- =================================================================================

-- 2. Note 테이블 (기본 노트)
CREATE TABLE IF NOT EXISTS note (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, -- 기본 키, 자동 증가
    title VARCHAR(255),                   -- 노트(또는 작품)의 제목
    content VARCHAR(255)                  -- 노트의 본문 내용
);

-- 3. TB_WORK 테이블 (작품 마스터)
CREATE TABLE IF NOT EXISTS TB_WORK (
    work_id BIGINT AUTO_INCREMENT PRIMARY KEY, -- 작품 고유 식별자
    title VARCHAR(255) NOT NULL,               -- 작품명 (필수 입력값)
    check_date VARCHAR(255),                   -- 확인(체크) 날짜
    creator VARCHAR(255),                      -- 창작자/저자
    genre VARCHAR(255),                        -- 장르
    rating VARCHAR(255),                       -- 등급
    url VARCHAR(255),                          -- 관련 URL
    status VARCHAR(255),                       -- 상태
    description TEXT                           -- 내용이 긴 작품 소개글
);

-- 4. TB_TAG_MASTER 테이블 (태그 마스터)
CREATE TABLE IF NOT EXISTS TB_TAG_MASTER (
    tag_id BIGINT AUTO_INCREMENT PRIMARY KEY,  -- 태그 고유 일련번호
    tag_type VARCHAR(50) NOT NULL,             -- 태그 대분류 유형 (예: GENRE, MBTI 등)
    tag_name VARCHAR(100) NOT NULL             -- 실제 태그 명칭 (예: 대학, 로맨스 등)
);

-- 5. TB_BOILERPLATE 테이블 (상용구)
CREATE TABLE IF NOT EXISTS TB_BOILERPLATE (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,          -- 상용구 고유 식별자
    category VARCHAR(255) NOT NULL DEFAULT '공통', -- 상용구 폴더(카테고리) 분류
    title VARCHAR(255) NOT NULL,                   -- 상용구 제목
    content TEXT NOT NULL                          -- 상용구 본문 내용
);

-- 6. TB_DICT 테이블 (사전)
CREATE TABLE IF NOT EXISTS TB_DICT (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,      -- 사전 고유 식별자
    work_id VARCHAR(255) NOT NULL,             -- 전역 사전(global) 또는 특정 작품 ID
    word VARCHAR(255) NOT NULL,                -- 원문 (단어)
    translation VARCHAR(255) NOT NULL          -- 한자/영문 번역본
);

-- =================================================================================
-- [TB_WORK에 종속적인 테이블]
-- =================================================================================

-- 7. TB_CHARACTER 테이블 (등장인물)
CREATE TABLE IF NOT EXISTS TB_CHARACTER (
    char_id BIGINT AUTO_INCREMENT PRIMARY KEY, -- 캐릭터 고유 식별자
    work_id BIGINT NOT NULL,                   -- 소속된 작품의 식별자 (FK 역할)
    name VARCHAR(255) NOT NULL,                -- 캐릭터 이름
    age VARCHAR(255),                          -- 나이
    birthday VARCHAR(255),                     -- 생일
    gender VARCHAR(255),                       -- 성별
    species VARCHAR(255),                      -- 종족
    image_code VARCHAR(255),                   -- 이미지 코드
    dynamic_properties JSON                    -- 동적 속성 (JSON 형태로 저장)
);

-- 8. TB_WIKI_PAGE 테이블 (위키 문서)
CREATE TABLE IF NOT EXISTS TB_WIKI_PAGE (
    page_id BIGINT AUTO_INCREMENT PRIMARY KEY, -- 위키 문서 고유 식별자
    work_id BIGINT NOT NULL,                   -- 소속된 작품(세계관) 식별자
    parent_id BIGINT,                          -- 부모 문서 ID (최상위 문서일 경우 NULL)
    title VARCHAR(255) NOT NULL,               -- 문서 제목 (예: 설정, 등장인물 등)
    content TEXT,                              -- 문서 본문 (마크다운 텍스트)
    order_num INT DEFAULT 0                    -- 같은 계층 내 정렬 순서
);

-- =================================================================================
-- [갈피 메모장(Galpi Memo) 관련 테이블]
-- =================================================================================

-- 9. galpi_memo 테이블 (메모 마스터)
CREATE TABLE IF NOT EXISTS galpi_memo (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,                   -- 메모 고유 식별자
    title VARCHAR(255) NOT NULL,                            -- 메모 제목
    content LONGTEXT,                                       -- 메모 본문 내용
    folder VARCHAR(100) DEFAULT '기타',                     -- 폴더 분류
    sort_order INT DEFAULT -1,                              -- 정렬 순서
    canvas_x INT DEFAULT 2500,                              -- 무한 캔버스 X 좌표
    canvas_y INT DEFAULT 2500,                              -- 무한 캔버스 Y 좌표
    theme_color VARCHAR(50) DEFAULT 'var(--surface-color)', -- 메모 테마 색상
    updated_at BIGINT,                                      -- 최근 수정 시간 (타임스탬프)
    is_trash BOOLEAN DEFAULT FALSE,                         -- 휴지통 이동 여부
    is_locked BOOLEAN DEFAULT FALSE,                        -- 메모 잠금 상태 여부
    tags VARCHAR(500)                                       -- 콤마(,)로 구분된 추출 해시태그
);

-- 10. galpi_memo_relation 테이블 (메모 관계선)
CREATE TABLE IF NOT EXISTS galpi_memo_relation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,      -- 관계 고유 식별자
    source_id BIGINT NOT NULL,                 -- 선이 시작되는 메모의 ID
    target_id BIGINT NOT NULL,                 -- 선이 끝나는 메모의 ID
    label VARCHAR(100),                        -- 관계 설명 (정방향 ➔)
    type VARCHAR(20) DEFAULT '->',             -- 선 종류 (->, <->, -- 등)
    desc_rev VARCHAR(100)                      -- 관계 설명 (역방향 ⬅, 양방향일 경우 사용)
);