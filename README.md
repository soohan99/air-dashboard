# 전국 대기질 대시보드

한국환경공단 에어코리아 공공데이터를 활용한 실시간 대기오염 정보 대시보드 서비스입니다.

## 주요 기능

- **Google OAuth 로그인**: 허용된 계정만 접근 가능한 접근 제어 구현
- **실시간 대기질 현황**: 전국 17개 시도의 PM10 / PM2.5 평균 농도 및 등급 표시
- **시도별 측정소 상세**: 시도 카드 클릭 시 해당 지역 측정소별 상세 데이터(O₃, NO₂, CO, SO₂ 포함)
- **시각화 차트**: Recharts 기반 PM10 / PM2.5 시도별 비교 막대 그래프
- **Turso DB 연동**: 허용 회원 목록을 Turso(libsql) 데이터베이스에 저장 및 관리

## 기술 스택

| 역할 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 인증 | NextAuth.js v4 + Google OAuth |
| 데이터베이스 | Turso (libsql) |
| 차트 | Recharts |
| 스타일 | Tailwind CSS |
| 배포 | Vercel |
| 데이터 출처 | 한국환경공단 에어코리아 (data.go.kr) |

## 환경 변수 설정

`.env.local` 파일을 생성하고 아래 값을 입력하세요:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
AIR_QUALITY_API_KEY=...
```

## 로컬 실행

```bash
npm install
npm run dev
```

서버 실행 후 `http://localhost:3000/api/init` 에 한 번 접속하면 Turso DB 테이블이 초기화됩니다.

## 배포

GitHub에 push하면 Vercel에 자동 배포됩니다. Vercel 프로젝트 환경 변수에 위 값들을 동일하게 설정하세요.
