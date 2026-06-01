'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BookmarksPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (!data.user) { router.push('/login'); return; }
      loadBookmarks();
    });
  }, []);

  const loadBookmarks = async () => {
    const res = await fetch('/api/bookmarks');
    if (res.ok) setBookmarks(await res.json());
    setLoading(false);
  };

  const removeBookmark = async (novelId: number) => {
    await fetch(`/api/bookmarks/${novelId}`, { method: 'DELETE' });
    setBookmarks(prev => prev.filter(b => b.novelId !== novelId));
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>載入中...</div>;

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>🔖 我的收藏</h1>
        <p style={{ color: 'var(--text-secondary)' }}>你收藏了 {bookmarks.length} 本書</p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>還沒有收藏任何書籍</p>
          <Link href="/" className="btn btn-primary">去首頁找書</Link>
        </div>
      ) : (
        <div className="grid">
          {bookmarks.map((b: any) => {
            const novel = b.novel;
            const ratingAvg = novel.reviews?.length
              ? (novel.reviews.reduce((s: number, r: any) => s + r.rating, 0) / novel.reviews.length).toFixed(1)
              : null;

            return (
              <div key={b.id} style={{ position: 'relative' }}>
                <Link href={`/novels/${novel.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="glass glass-card novel-card">
                    {novel.coverUrl ? (
                      <img src={novel.coverUrl} alt={novel.title} className="novel-cover" />
                    ) : (
                      <div className="novel-cover" style={{ background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📖 無封面</div>
                    )}
                    <div className="novel-info">
                      <div className="novel-title">{novel.title}</div>
                      <div className="novel-author">{novel.author}</div>
                      {novel.tags?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', margin: '0.4rem 0' }}>
                          {novel.tags.map((tag: any) => (
                            <span key={tag.id} style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', color: '#c4b5fd', padding: '0.1rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem' }}>#{tag.name}</span>
                          ))}
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                        <span className="stars">★ {ratingAvg ?? '尚無評分'}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>👁 {novel.viewCount}</span>
                      </div>
                    </div>
                  </div>
                </Link>
                {/* 移除收藏按鈕 */}
                <button
                  onClick={() => removeBookmark(novel.id)}
                  title="取消收藏"
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(239,68,68,0.2)', border: '1px solid #f87171', color: '#f87171', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', zIndex: 1 }}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
