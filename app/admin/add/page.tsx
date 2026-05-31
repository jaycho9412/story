'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Mode = 'search' | 'manual';

export default function AdminAddNovel() {
  const [mode, setMode] = useState<Mode>('search');
  const router = useRouter();

  return (
    <div className="container" style={{ maxWidth: '700px', margin: '0 auto', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <h2 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '1.5rem' }}>📚 後台管理 — 新增書籍</h2>

      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.4rem' }}>
        <button
          onClick={() => setMode('search')}
          style={{
            flex: 1, padding: '0.7rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, transition: 'all 0.2s',
            background: mode === 'search' ? 'var(--accent)' : 'transparent',
            color: mode === 'search' ? '#fff' : 'var(--text-secondary)',
          }}
        >
          🔍 搜尋書籍
        </button>
        <button
          onClick={() => setMode('manual')}
          style={{
            flex: 1, padding: '0.7rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, transition: 'all 0.2s',
            background: mode === 'manual' ? 'var(--accent)' : 'transparent',
            color: mode === 'manual' ? '#fff' : 'var(--text-secondary)',
          }}
        >
          ✏️ 手動新增
        </button>
      </div>

      {mode === 'search' ? <SearchMode router={router} /> : <ManualMode router={router} />}
    </div>
  );
}

function SearchMode({ router }: { router: any }) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [fallbackUrl, setFallbackUrl] = useState('');
  const [directUrl, setDirectUrl] = useState('');
  const [scrapeError, setScrapeError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const kw = keyword.trim();
    if (!kw) return;
    setError(''); setResults([]); setFallbackUrl(''); setScrapeError('');
    setSearching(true);
    try {
      const res = await fetch('/api/novels/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: kw }),
      });
      const data = await res.json();
      if (res.ok) {
        setResults(data.results || []);
        if (data.fallbackUrl) setFallbackUrl(data.fallbackUrl);
        if (!data.results?.length) setError(data.message || '找不到結果');
      } else {
        setError(data.error || '搜尋失敗');
      }
    } catch { setError('網路錯誤，請稍後再試'); }
    finally { setSearching(false); }
  };

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = directUrl.trim();
    if (!url) return;
    if (!url.includes('books.com.tw/products/')) {
      setScrapeError('請輸入正確的博客來書籍頁面網址（需含 /products/）');
      return;
    }
    setScrapeError(''); setAdding(true);
    try {
      const res = await fetch('/api/novels/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('✅ 新增成功！');
        router.push(`/novels/${data.novel.id}`);
      } else {
        setScrapeError(data.error || '新增失敗');
      }
    } catch { setScrapeError('網路錯誤，請稍後再試'); }
    finally { setAdding(false); }
  };

  return (
    <>
      {/* Step 1: Keyword Search */}
      <div className="glass" style={{ padding: '2rem', marginBottom: '1.25rem' }}>
        <h3 style={{ marginBottom: '0.4rem', fontSize: '1.1rem' }}>第一步：搜尋書籍（支援中英文）</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
          輸入關鍵字，從 Open Library 搜尋書籍資料庫，再到博客來找到正確書籍連結。
        </p>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text" placeholder="書名或關鍵字，例如：小王子、Harry Potter..."
            className="input-field" value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setResults([]); setError(''); }}
            style={{ flex: 1 }} disabled={searching || adding}
          />
          <button type="submit" className="btn btn-primary"
            style={{ whiteSpace: 'nowrap', padding: '0 1.25rem' }}
            disabled={searching || adding || !keyword.trim()}>
            {searching ? '搜尋中...' : '搜尋'}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', color: '#f87171', fontSize: '0.9rem' }}>
            {error}
            {fallbackUrl && (
              <div style={{ marginTop: '0.4rem' }}>
                <a href={fallbackUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                  → 直接在博客來搜尋「{keyword}」
                </a>
              </div>
            )}
          </div>
        )}

        {results.length > 0 && (
          <div style={{ marginTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>找到 {results.length} 筆結果：</span>
              {fallbackUrl && (
                <a href={fallbackUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: '0.85rem', textDecoration: 'underline' }}>
                  在博客來搜尋全部 →
                </a>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {results.map((book, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
                  {book.thumbnail ? (
                    <img src={book.thumbnail} alt={book.title}
                      style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div style={{ width: '40px', height: '56px', background: 'rgba(255,255,255,0.07)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>📖</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</div>
                    {book.authors && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{book.authors}{book.year ? ` · ${book.year}` : ''}</div>}
                  </div>
                  <a href={book.url} target="_blank" rel="noopener noreferrer"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem', background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: '7px', textDecoration: 'none', color: 'inherit', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    博客來搜尋 →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Paste URL to scrape */}
      <div className="glass" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '0.4rem', fontSize: '1.1rem' }}>第二步：貼上博客來網址自動新增</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem', lineHeight: 1.55 }}>
          從上方搜尋結果進入博客來後，複製書籍頁面網址（如：<code style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.08)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>https://www.books.com.tw/products/XXXXXXXXXX</code>），貼入下方。
        </p>
        <form onSubmit={handleScrape} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="url" placeholder="https://www.books.com.tw/products/..."
            className="input-field" value={directUrl}
            onChange={(e) => { setDirectUrl(e.target.value); setScrapeError(''); }}
            style={{ flex: 1 }} disabled={adding}
          />
          <button type="submit" className="btn btn-primary"
            style={{ whiteSpace: 'nowrap', padding: '0 1.25rem' }}
            disabled={adding || !directUrl.trim()}>
            {adding ? '新增中...' : '✅ 新增'}
          </button>
        </form>
        {scrapeError && (
          <div style={{ marginTop: '0.875rem', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', color: '#f87171', fontSize: '0.9rem' }}>
            {scrapeError}
            <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              💡 如果自動新增一直失敗，請改用上方的「手動新增」標籤。
            </div>
          </div>
        )}
        {adding && <div style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.88rem', textAlign: 'center' }}>正在從博客來抓取書籍資訊，請稍候...</div>}
      </div>
    </>
  );
}

function ManualMode({ router }: { router: any }) {
  const [form, setForm] = useState({ title: '', author: '', coverUrl: '', description: '', booksUrl: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('書名為必填'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/novels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        alert('✅ 新增成功！');
        router.push(`/novels/${data.novel.id}`);
      } else {
        setError(data.error || '新增失敗');
      }
    } catch { setError('網路錯誤，請稍後再試'); }
    finally { setSaving(false); }
  };

  return (
    <div className="glass" style={{ padding: '2rem' }}>
      <h3 style={{ marginBottom: '0.4rem', fontSize: '1.1rem' }}>手動填寫書籍資料</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
        當自動搜尋或抓取失敗時，可直接手動填入書籍資訊。
      </p>

      {error && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', color: '#f87171', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>書名 <span style={{ color: '#f87171' }}>*</span></label>
          <input name="title" type="text" className="input-field" placeholder="例如：小王子" value={form.title} onChange={handleChange} required />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>作者</label>
          <input name="author" type="text" className="input-field" placeholder="例如：Antoine de Saint-Exupéry" value={form.author} onChange={handleChange} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>封面圖片網址</label>
          <input name="coverUrl" type="url" className="input-field" placeholder="https://..." value={form.coverUrl} onChange={handleChange} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>博客來購買連結</label>
          <input name="booksUrl" type="url" className="input-field" placeholder="https://www.books.com.tw/products/..." value={form.booksUrl} onChange={handleChange} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>書籍簡介</label>
          <textarea name="description" className="input-field" placeholder="書籍描述..." value={form.description} onChange={handleChange}
            style={{ minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }} />
        </div>
        <button type="submit" className="btn btn-primary" style={{ fontSize: '1rem', marginTop: '0.5rem' }} disabled={saving}>
          {saving ? '新增中...' : '✅ 確認新增'}
        </button>
      </form>
    </div>
  );
}
