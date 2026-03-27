import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { isSupabaseConfigured, supabase } from './lib/supabase'

const moods = [
  { value: 'bright', emoji: '🌤️', label: '맑음' },
  { value: 'calm', emoji: '🌿', label: '잔잔' },
  { value: 'mixed', emoji: '🌀', label: '복합' },
  { value: 'tired', emoji: '🌙', label: '피곤' },
]

function formatDate(value) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(value))
}

function App() {
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('bright')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const todayCount = useMemo(() => {
    const today = new Date().toDateString()
    return entries.filter((entry) => new Date(entry.created_at).toDateString() === today).length
  }, [entries])

  const loadEntries = async () => {
    setLoading(true)
    setError('')

    const { data, error: fetchError } = await supabase
      .from('retros')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    setEntries(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return

    const bootstrap = async () => {
      await loadEntries()
    }

    bootstrap()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()

    if (!content.trim()) {
      setError('한 줄 회고를 적어줘.')
      return
    }

    if (!isSupabaseConfigured) {
      setError('Supabase 환경 변수가 아직 설정되지 않았어.')
      return
    }

    setSubmitting(true)
    setError('')
    setInfo('')

    const payload = {
      content: content.trim(),
      mood,
    }

    const { data, error: insertError } = await supabase
      .from('retros')
      .insert(payload)
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
      return
    }

    setEntries((current) => [data, ...current])
    setContent('')
    setMood('bright')
    setInfo('회고를 저장했어.')
    setSubmitting(false)
  }

  async function handleDelete(id) {
    if (!isSupabaseConfigured) return

    setError('')
    const previous = entries
    setEntries((current) => current.filter((entry) => entry.id !== id))

    const { error: deleteError } = await supabase.from('retros').delete().eq('id', id)

    if (deleteError) {
      setEntries(previous)
      setError(deleteError.message)
      return
    }

    setInfo('회고를 삭제했어.')
  }

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <span className="eyebrow">0327 DB Practice</span>
          <h1>One Line Retro</h1>
          <p>
            GitHub Pages에 올릴 수 있는 Supabase 기반 한줄 회고 앱이야.
            오늘 기분과 함께 짧게 기록하고, 바로 DB에 저장되는 흐름을 연습할 수 있어.
          </p>
        </div>

        <div className="hero-stats">
          <div className="stat-card">
            <span>오늘 작성 수</span>
            <strong>{todayCount}</strong>
          </div>
          <div className="stat-card">
            <span>전체 기록</span>
            <strong>{entries.length}</strong>
          </div>
          <div className="stat-card accent">
            <span>DB 연결 상태</span>
            <strong>{isSupabaseConfigured ? '준비됨' : '설정 필요'}</strong>
          </div>
        </div>
      </section>

      {!isSupabaseConfigured ? (
        <section className="notice-card warning">
          <strong>Supabase 설정 필요</strong>
          <p>
            `.env.local` 또는 GitHub Actions secret에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`를 넣어야 해.
            README에 SQL과 설정 방법을 적어뒀어.
          </p>
        </section>
      ) : null}

      {error ? <section className="notice-card error">{error}</section> : null}
      {info ? <section className="notice-card info">{info}</section> : null}

      <section className="layout-grid">
        <form className="composer-card" onSubmit={handleSubmit}>
          <div className="section-head">
            <div>
              <p className="mini-label">WRITE</p>
              <h2>오늘의 한 줄</h2>
            </div>
            <span className="helper-chip">DB insert 연습</span>
          </div>

          <label className="field-wrap">
            <span>회고</span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={180}
              rows={5}
              placeholder="예: 집중은 조금 흔들렸지만, 결국 끝까지 밀어붙인 하루였다."
            />
            <small>{content.length}/180</small>
          </label>

          <div className="field-wrap">
            <span>기분</span>
            <div className="mood-grid">
              {moods.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={mood === item.value ? 'mood-pill active' : 'mood-pill'}
                  onClick={() => setMood(item.value)}
                >
                  <span>{item.emoji}</span>
                  <strong>{item.label}</strong>
                </button>
              ))}
            </div>
          </div>

          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? '저장 중…' : '회고 저장'}
          </button>
        </form>

        <section className="timeline-card">
          <div className="section-head">
            <div>
              <p className="mini-label">READ / DELETE</p>
              <h2>저장된 기록</h2>
            </div>
            <button className="ghost-button" type="button" onClick={loadEntries} disabled={loading || !isSupabaseConfigured}>
              {loading ? '불러오는 중…' : '새로고침'}
            </button>
          </div>

          {loading ? <p className="empty-copy">기록을 불러오는 중이야…</p> : null}

          {!loading && entries.length === 0 ? (
            <div className="empty-state">
              <p>아직 저장된 회고가 없어.</p>
              <span>첫 한 줄을 남겨보자.</span>
            </div>
          ) : null}

          <div className="entries">
            {entries.map((entry) => {
              const matchedMood = moods.find((item) => item.value === entry.mood)
              return (
                <article key={entry.id} className="entry-card">
                  <div className="entry-top">
                    <span className="entry-mood">
                      {matchedMood?.emoji} {matchedMood?.label ?? entry.mood}
                    </span>
                    <button type="button" className="delete-button" onClick={() => handleDelete(entry.id)}>
                      삭제
                    </button>
                  </div>
                  <p>{entry.content}</p>
                  <time>{formatDate(entry.created_at)}</time>
                </article>
              )
            })}
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
