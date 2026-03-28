# 원라인 레트로 (One Line Retro)

GitHub Pages에 배포할 수 있는 **Supabase 기반 한줄 회고 앱**입니다.  
React + Vite 프런트엔드에서 Supabase를 직접 연결해 **추가 / 조회 / 삭제(CRUD)** 흐름을 연습할 수 있도록 만들었습니다.

## 주요 기능

- 한 줄 회고 작성
- 기분 선택
- Supabase DB 저장
- 최신순 기록 조회
- 기록 삭제
- GitHub Pages 자동 배포 지원

## 1. Supabase 테이블 만들기

Supabase의 **SQL Editor**에서 아래 SQL을 실행하세요.

```sql
create table if not exists public.retros (
  id uuid primary key default gen_random_uuid(),
  content text not null check (char_length(content) <= 180),
  mood text not null check (mood in ('bright', 'calm', 'mixed', 'tired')),
  created_at timestamptz not null default now()
);
```

## 2. RLS 정책 만들기

연습용 앱이라면 공개 읽기/쓰기/삭제를 허용해도 됩니다.  
다만 실제 서비스로 운영할 때는 **반드시 인증(auth)** 을 붙이는 걸 추천합니다.

```sql
alter table public.retros enable row level security;

create policy "public can read retros"
on public.retros
for select
to anon
using (true);

create policy "public can insert retros"
on public.retros
for insert
to anon
with check (true);

create policy "public can delete retros"
on public.retros
for delete
to anon
using (true);
```

## 3. 로컬에서 실행하기

프로젝트 루트에 `.env.local` 파일을 만들고 아래 값을 넣으세요.

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

그다음 아래 명령으로 실행하면 됩니다.

```bash
npm install
npm run dev
```

## 4. GitHub Pages 자동 배포 설정

이 저장소에는 **GitHub Actions 기반 자동 배포 워크플로**가 포함되어 있습니다.

### 저장소에서 해야 할 설정

1. **Settings → Pages**로 이동
2. **Build and deployment → Source**를 `GitHub Actions`로 변경
3. **Settings → Secrets and variables → Actions**로 이동
4. 아래 **Repository secrets**를 추가
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

이후에는 `main` 브랜치에 push할 때마다 자동으로 빌드 및 배포가 진행됩니다.

## 5. 배포 주소

기본 GitHub Pages 주소는 보통 아래 형식입니다.

```text
https://qutechoi.github.io/0327_one-line-retro/
```

## 기술 스택

- React
- Vite
- Supabase
- GitHub Pages
- GitHub Actions

## 메모

- 이 프로젝트는 **정적 사이트**이므로 GitHub Pages에 바로 배포할 수 있습니다.
- 프런트엔드에서는 **Supabase anon key**를 사용합니다.
- 보안은 **RLS 정책**으로 제어해야 합니다.
