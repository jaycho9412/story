'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/users?q=${encodeURIComponent(query)}`);
    if (res.ok) setResults(await res.json());
    setSearched(true);
    setLoading(false);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('zh-TW');

  return (
    <div className="container" style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍 搜尋用戶</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>搜尋用戶名稱，進入個人版面</p>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem' }}>
        <input
          className="input-field"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="輸入用戶名稱..."
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0 1.5rem', whiteSpace: 'nowrap' }}>
          {loading ? '搜尋中...' : '搜尋'}
        </button>
      </form>

      {searched && (
        results.length === 0 ? (
          <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            找不到「{query}」的用戶
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>找到 {results.length} 位用戶</p>
            {results.map((user: any) => (
              <Link key={user.id} href={`/user/${user.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="glass" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1.2rem', transition: 'transform 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateX(4px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = '')}
                >
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 700, flexShrink: 0 }}>
                    {user.username[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.2rem' }}>
                      {user.username}
                      {user.role === 'admin' && <span style={{ marginLeft: '0.5rem', background: 'rgba(239,68,68,0.2)', color: '#f87171', padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.75rem' }}>管理員</span>}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      📝 {user._count.journals} 篇心得 · 💬 {user._count.reviews} 則書評 · 加入 {formatDate(user.createdAt)}
                    </div>
                  </div>
                  <span style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}
