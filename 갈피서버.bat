@echo off
rem [시스템 설정] 명령어 출력을 숨겨 콘솔 창을 깨끗하게 유지합니다.
chcp 65001 >nul
title 갈피(galpi) - Spring Boot 백엔드 ^& React 프론트엔드 통합 가동 엔진

echo ============================================================
echo [시스템] 시스템 전역 자바를 차단하고 JDK 17 격리 환경 주입을 완료했습니다.
echo ============================================================

set "JAVA_HOME=C:\Program Files\Java\jdk-17"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo ============================================================
echo [검증 로그] 현재 실행 세션에 주입된 자바 버전을 확인합니다:
java -version
echo ============================================================

echo [콘솔 로그] 백그라운드 찌꺼기 데몬 및 좀비 자바 프로세스 강제 종료 중...
call "C:\dev\Galpi-Backend\gradlew.bat" --stop >nul 2>&1
taskkill /f /im java.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo ============================================================
echo [1단계] React 프론트엔드 서버를 독립된 콘솔 창에서 가동합니다.
echo 경로: C:\dev\Galpi-React
echo ============================================================
rem start 명령어를 사용하여 새로운 cmd 창을 띄우고 Vite 서버를 가동시킵니다.
start "Galpi React Frontend" cmd /k "cd /d C:\dev\Galpi-React && title 갈피(galpi) - React 프론트엔드 && npm run dev"

echo ============================================================
echo [2단계] Spring Boot 백엔드 서버 준비 및 점유된 build 폴더 강제 삭제 중...
echo 경로: C:\dev\Galpi-Backend
echo ============================================================
cd /d "C:\dev\Galpi-Backend"
echo [콘솔 로그] 백엔드 프로젝트 경로 진입 완료: %CD%
rmdir /s /q "C:\dev\Galpi-Backend\build" >nul 2>&1

:restart_loop

echo ============================================================
echo [3단계] 스프링 부트 서버 구동을 개시합니다.
echo (코드 수정 후 Ctrl + C -^> Y 입력 후, 아무 키나 누르면 백엔드가 즉시 재구동됩니다!)
echo ============================================================

call gradlew.bat bootRun --no-daemon -Dfile.encoding=UTF-8

echo.
echo ============================================================
echo [알림] 스프링 부트 서버 인스턴스 가동이 중단되었습니다.
echo [안내] 키보드의 아무 키나 누르시면 즉시 백엔드 서버를 재시작합니다.
echo [안내] 완전한 가동 종료를 원하시면 이 콘솔 창과 프론트엔드 창을 닫아주십시오.
echo ============================================================
pause

goto restart_loop