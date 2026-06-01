'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type SortKey = 'newest' | 'rating' | 'reviews' | 'views';

const SORT_OPTIONS: { key: SortKey; label: string; icon: string }[] = [
  { key: 'newest', label: '最新上架', icon: '🆕' },
  { key: 'rating', label: '評分最高', icon: '⭐' },
  { key: 'reviews', label: '留言最多', icon: '💬' },
  { key: 'views',  label: '瀏覽最多', icon: '👁' },
];

export default function Home() {
  const router = useRouter();
  const [novels, setNovels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [allTags, setAllTags] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [me, setMe] = useState<any>(null);
  const [myBookmarkIds, setMyBookmarkIds] = useState<Set<number>>(new Set());

  const fetchNovels = useCallback((q: string, s: SortKey) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    params.set('sort', s);
    fetch(`/api/novels?${params}`)
      .then(res => res.json())
      .then(data => { setNovels(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  const fetchBookmarks = useCallback(() => {
    fetch('/api/bookmarks').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setMyBookmarkIds(new Set(data.map((b: any) => b.novelId)));
    });
  }, []);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) { setMe(d.user); fetchBookmarks(); }
    });
    fetchNovels('', 'newest');
    fetch('/api/tags').then(r => r.json()).then(data => setAllTags(Array.isArray(data) ? data : []));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedTag('');
    setQuery(searchInput);
    fetchNovels(searchInput, sort);
  };

  const handleTagClick = (tagName: string) => {
    const next = selectedTag === tagName ? '' : tagName;
    setSelectedTag(next);
    setSearchInput(next);
    setQuery(next);
    fetchNovels(next, sort);
  };

  const handleSort = (s: SortKey) => {
    setSort(s);
    fetchNovels(query, s);
  };

  const handleClear = () => {
    setSearchInput(''); setQuery(''); setSelectedTag('');
    fetchNovels('', sort);
  };

  const toggleBookmark = async (e: React.MouseEvent, novelId: number) => {
    e.preventDefault();
    if (!me) return router.push('/login');
    if (myBookmarkIds.has(novelId)) {
      await fetch(`/api/bookmarks/${novelId}`, { method: 'DELETE' });
      setMyBookmarkIds(prev => { const s = new Set(prev); s.delete(novelId); return s; });
    } else {
      await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ novelId }),
      });
      setMyBookmarkIds(prev => new Set([...prev, novelId]));
    }
  };

  return (
    <main className="container">
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '2rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '0.8rem' }}>探索您的下一部小說</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>與社群分享最真實的讀後心得</p>
      </div>

      {/* 搜尋欄 */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.8rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
        <input className="input-field" value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="🔍 搜尋書名、作者或標籤..." style={{ flex: 1 }} />
        <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem', whiteSpace: 'nowrap' }}>搜尋</button>
        {query && <button type="button" onClick={handleClear} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '0 1rem', borderRadius: '8px', cursor: 'pointer' }}>✕</button>}
      </form>

      {/* 標籤快選 */}
      {allTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
          {allTags.map((tag: any) => (
            <button key={tag.id} onClick={() => handleTagClick(tag.name)} style={{ background: selectedTag === tag.name ? 'var(--primary)' : 'rgba(255,255,255,0.08)', border: `1px solid ${selectedTag === tag.name ? 'var(--primary)' : 'var(--glass-border)'}`, color: 'white', padding: '0.3rem 0.9rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}>
              # {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* 排序列 */}
      <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {SORT_OPTIONS.map(opt => (
          <button key={opt.key} onClick={() => handleSort(opt.key)} style={{ background: sort === opt.key ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.05)', border: `1px solid ${sort === opt.key ? 'var(--primary)' : 'var(--glass-border)'}`, color: sort === opt.key ? '#c4b5fd' : 'var(--text-secondary)', padding: '0.4rem 1rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: sort === opt.key ? 700 : 400, transition: 'all 0.2s' }}>
            {opt.icon} {opt.label}
          </button>
        ))}
      </div>

      {query && <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', textAlign: 'center' }}>搜尋「{query}」— 找到 {novels.length} 本書</p>}

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
              const isBookmarked = myBookmarkIds.has(novel.id);

              return (
                <Link href={`/novels/${novel.id}`} key={novel.id} style={{ textDecoration: 'none', color: 'inherit', position: 'relative' }}>
                  <div className="glass glass-card novel-card" style={{ position: 'relative' }}>
                    {/* 收藏按鈕 */}
                    <button
                      onClick={e => toggleBookmark(e, novel.id)}
                      title={isBookmarked ? '取消收藏' : '加入收藏'}
                      style={{ position: 'absolute', top: '8px', right: '8px', background: isBookmarked ? 'rgba(139,92,246,0.3)' : 'rgba(0,0,0,0.5)', border: `1px solid ${isBookmarked ? 'var(--primary)' : 'rgba(255,255,255,0.2)'}`, borderRadius: '8px', color: isBookmarked ? '#c4b5fd' : 'rgba(255,255,255,0.6)', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', zIndex: 1, transition: 'all 0.2s' }}
                    >
                      {isBookmarked ? '🔖' : '📌'}
                    </button>

                    {novel.coverUrl ? (
                      <img src={novel.coverUrl} alt={novel.title} className="novel-cover" />
                    ) : (
                      <div className="novel-cover" style={{ background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📖 無封面</div>
                    )}

                    <div className="novel-info">
                      <div className="novel-title">{novel.title}</div>
                      <div className="novel-author">{novel.author}</div>

                      {/* 標籤 */}
                      {novel.tags?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', margin: '0.4rem 0' }}>
                          {novel.tags.map((tag: any) => (
                            <span key={tag.id} style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', color: '#c4b5fd', padding: '0.1rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem' }}>#{tag.name}</span>
                          ))}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                        <span className="stars">★ {ratingAvg ?? '尚無評分'}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>({novel.reviews?.length || 0} 則)</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        👁 {novel.viewCount ?? 0} 次瀏覽
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
