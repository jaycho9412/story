'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NovelDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [novel, setNovel] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/novels/${id}`).then(res => res.json()).then(setNovel);
    // 瀏覽次數 +1
    fetch(`/api/novels/${id}/view`, { method: 'POST' });
    fetch('/api/auth/me').then(res => res.json()).then(data => {
      setUser(data.user);
      if (data.user) {
        fetch('/api/bookmarks').then(r => r.json()).then(bms => {
          if (Array.isArray(bms)) setIsBookmarked(bms.some((b: any) => b.novelId === parseInt(id as string)));
        });
      }
    });
  }, [id]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('請先登入！');
    setSubmitting(true);
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ novelId: id, rating, content })
    });
    setSubmitting(false);
    if (res.ok) {
      setContent('');
      fetch(`/api/novels/${id}`).then(res => res.json()).then(setNovel);
    } else {
      alert('評論失敗，請確認是否登入');
    }
  };

  const toggleBookmark = async () => {
    if (!user) return router.push('/login');
    setBookmarkLoading(true);
    if (isBookmarked) {
      await fetch(`/api/bookmarks/${id}`, { method: 'DELETE' });
      setIsBookmarked(false);
    } else {
      await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ novelId: parseInt(id as string) }),
      });
      setIsBookmarked(true);
    }
    setBookmarkLoading(false);
  };

  if (!novel) return <div className="container" style={{ textAlign: 'center', marginTop: '10vh' }}>Loading...</div>;

  const ratingAvg = novel.reviews?.length 
    ? (novel.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / novel.reviews.length).toFixed(1)
    : '無評分';

  return (
    <div className="container">
      <div className="glass" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
            <img src={novel.coverUrl} alt={novel.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: '2 1 400px', padding: '3rem' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{novel.title}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>作者：{novel.author}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' }}>
              <span className="stars" style={{ fontSize: '1.5rem' }}>★ {ratingAvg}</span>
              <span style={{ color: 'var(--text-secondary)' }}>({novel.reviews?.length || 0} 則評論)</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>👁 {novel.viewCount ?? 0} 次瀏覽</span>
            </div>
            
            <p style={{ marginBottom: '2rem', lineHeight: '1.8', opacity: 0.9 }}>
              {novel.description}
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {novel.booksUrl && (
                <a href={novel.booksUrl} target="_blank" rel="noopener noreferrer" className="btn btn-books" style={{ fontSize: '1.1rem', padding: '0.8rem 1.8rem' }}>
                  🛒 前往博客來購買
                </a>
              )}
              <button
                onClick={toggleBookmark}
                disabled={bookmarkLoading}
                style={{ background: isBookmarked ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.08)', border: `1px solid ${isBookmarked ? 'var(--primary)' : 'var(--glass-border)'}`, color: isBookmarked ? '#c4b5fd' : 'white', padding: '0.8rem 1.8rem', borderRadius: '12px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 600, transition: 'all 0.2s' }}
              >
                {isBookmarked ? '🔖 已收藏' : '📌 加入收藏'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* 評論列表 */}
        <div className="glass" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '2rem' }}>讀者評論</h2>
          {novel.reviews?.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>目前還沒有評論，成為第一個評論的人吧！</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {novel.reviews?.map((r: any) => (
                <div key={r.id} style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <Link href={`/user/${r.user.id}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                      👤 {r.user.username}
                    </Link>
                    <span className="stars">★ {r.rating}</span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.8)' }}>{r.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 發表評論 */}
        <div className="glass" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '2rem' }}>寫下您的評價</h2>
          {user ? (
            <form onSubmit={submitReview}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>評分 (1-5星)</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star} 
                      className={star <= rating ? 'active' : ''} 
                      onClick={() => setRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>留言內容</label>
                <textarea 
                  className="input-field" 
                  rows={5} 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="寫下您對這本書的想法..."
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? '送出中...' : '送出評論'}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
              <p style={{ marginBottom: '1rem' }}>登入後即可發表您的書評</p>
              <button onClick={() => window.location.href='/login'} className="btn btn-primary">前往登入</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
