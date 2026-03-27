# One Line Retro

GitHub Pages에 배포할 수 있는 Supabase 기반 한줄 회고 앱입니다. React + Vite 프런트에서 Supabase를 직접 사용해 **추가 / 조회 / 삭제**를 연습할 수 있습니다.

## Features

- 한 줄 회고 작성
- 기분 선택
- Supabase DB 저장
- 최신순 조회
- 삭제
- GitHub Pages 배포 가능

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

## 4) GitHub Pages 배포

이 프로젝트는 `gh-pages` 패키지로 배포할 수 있게 설정되어 있습니다.

```bash
npm run deploy
```

처음 배포 전에는 `vite.config.js`의 `base` 값을 저장소 이름에 맞게 둬야 합니다.
현재는 자동으로 `/0327_one-line-retro/` 기준으로 맞춰두었습니다.

## 5) GitHub Actions / Secrets

GitHub Pages에 배포하면서 빌드 시 Supabase env를 주입하려면 repository secrets 또는 actions variables에 아래를 추가하세요.

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Stack

- React
- Vite
- Supabase
- GitHub Pages
