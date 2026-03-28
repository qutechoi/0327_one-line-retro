# One Line Retro

GitHub Pages에 배포할 수 있는 Supabase 기반 한줄 회고 앱입니다. React + Vite 프런트에서 Supabase를 직접 사용해 **추가 / 조회 / 삭제**를 연습할 수 있습니다.

## Features

- 한 줄 회고 작성
- 기분 선택
- Supabase DB 저장
- 최신순 조회
- 삭제
- GitHub Pages 자동 배포 가능

## 1) Supabase table 만들기

Supabase SQL Editor에서 아래 SQL을 실행하세요.

```sql
create table if not exists public.retros (
  id uuid primary key default gen_random_uuid(),
  content text not null check (char_length(content) <= 180),
  mood text not null check (mood in ('bright', 'calm', 'mixed', 'tired')),
  created_at timestamptz not null default now()
);
```

## 2) RLS 정책 만들기

연습용으로는 공개 읽기/쓰기/삭제를 허용할 수 있습니다.
실서비스라면 auth를 꼭 붙여야 해요.

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

## 3) 로컬 실행

`.env.local` 파일 생성:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

실행:

```bash
npm install
npm run dev
```

## 4) GitHub Pages 자동 배포 설정

이 저장소에는 GitHub Actions 기반 자동 배포 워크플로가 포함되어 있습니다.

### 저장소에서 해야 할 설정

1. **Settings → Pages**
2. **Build and deployment → Source**를 `GitHub Actions`로 변경
3. **Settings → Secrets and variables → Actions**로 이동
4. 아래 repository secrets 추가
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

그 뒤에는 `main` 브랜치에 push할 때마다 자동 배포됩니다.

## 5) 배포 URL

기본 Pages URL은 보통 아래 형식입니다.

```text
https://qutechoi.github.io/0327_one-line-retro/
```

## Stack

- React
- Vite
- Supabase
- GitHub Pages
- GitHub Actions
