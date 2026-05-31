'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [novels, setNovels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/novels')
      .then(res => res.json())
      .then(data => {
        setNovels(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container" style={{textAlign: 'center', marginTop: '10vh'}}>Loading...</div>;

  return (
    <main className="container">
      <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '2rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem' }}>探索您的下一部小說</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>與社群分享最真實的讀後心得</p>
      </div>

      <div className="grid">
        {novels.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)' }}>
            目前還沒有小說，請管理員新增！
          </div>
        ) : (
          novels.map(novel => {
            const ratingAvg = novel.reviews?.length 
              ? (novel.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / novel.reviews.length).toFixed(1)
              : '無評分';

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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="stars">★ {ratingAvg}</span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        ({novel.reviews?.length || 0} 則評論)
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </main>
  );
}
