'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

export default function Home() {
  const [novels, setNovels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [allTags, setAllTags] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState('');

  const fetchNovels = useCallback((q: string) => {
    setLoading(true);
    const url = q ? `/api/novels?q=${encodeURIComponent(q)}` : '/api/novels';
    fetch(url)
      .then(res => res.json())
      .then(data => { setNovels(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  useEffect(() => {
    fetchNovels('');
    fetch('/api/tags').then(r => r.json()).then(data => setAllTags(Array.isArray(data) ? data : []));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedTag('');
    setQuery(searchInput);
    fetchNovels(searchInput);
  };

  const handleTagClick = (tagName: string) => {
    if (selectedTag === tagName) {
      setSelectedTag('');
      setSearchInput('');
      setQuery('');
      fetchNovels('');
    } else {
      setSelectedTag(tagName);
      setSearchInput(tagName);
      setQuery(tagName);
      fetchNovels(tagName);
    }
  };

  const handleClear = () => {
    setSearchInput('');
    setQuery('');
    setSelectedTag('');
    fetchNovels('');
  };

  return (
    <main className="container">
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', marginTop: '2rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '0.8rem' }}>探索您的下一部小說</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>與社群分享最真實的讀後心得</p>
      </div>

      {/* 搜尋欄 */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.8rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
        <input
          className="input-field"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="🔍 搜尋書名、作者或標籤..."
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem', whiteSpace: 'nowrap' }}>搜尋</button>
        {query && (
          <button type="button" onClick={handleClear} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '0 1rem', borderRadius: '8px', cursor: 'pointer' }}>✕</button>
        )}
      </form>

      {/* 標籤快選 */}
      {allTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
          {allTags.map((tag: any) => (
            <button
              key={tag.id}
              onClick={() => handleTagClick(tag.name)}
              style={{
                background: selectedTag === tag.name ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${selectedTag === tag.name ? 'var(--primary)' : 'var(--glass-border)'}`,
                color: 'white',
                padding: '0.3rem 0.9rem',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'all 0.2s',
              }}
            >
              # {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* 搜尋結果提示 */}
      {query && (
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', textAlign: 'center' }}>
          搜尋「{query}」— 找到 {novels.length} 本書
        </p>
      )}

      {/* 書籍列表 */}
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>載入中...</div>
      ) : (
        <div className="grid">
          {novels.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)', padding: '4rem 0' }}>
              {query ? `找不到「${query}」相關的書籍` : '目前還沒有小說，請管理員新增！'}
            </div>
          ) : (
            novels.map(novel => {
              const ratingAvg = novel.reviews?.length
                ? (novel.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / novel.reviews.length).toFixed(1)
                : null;

              return (
                <Link href={`/novels/${novel.id}`} key={novel.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="glass glass-card novel-card">
                    {novel.coverUrl ? (
                      <img src={novel.coverUrl} alt={novel.title} className="novel-cover" />
                    ) : (
                      <div className="novel-cover" style={{ background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        📖 無封面
                      </div>
                    )}
                    <div className="novel-info">
                      <div className="novel-title">{novel.title}</div>
                      <div className="novel-author">{novel.author}</div>
                      {/* 標籤 */}
                      {novel.tags?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', margin: '0.4rem 0' }}>
                          {novel.tags.map((tag: any) => (
                            <span key={tag.id} style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', color: '#c4b5fd', padding: '0.1rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem' }}>
                              #{tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="stars">★ {ratingAvg ?? '尚無評分'}</span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          ({novel.reviews?.length || 0} 則評論)
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </main>
  );
}
