'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', author: '', coverUrl: '', description: '', booksUrl: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (!data.user) { router.push('/login'); return; }
      setUser(data.user);
      loadWishlists();
    });
  }, []);

  const loadWishlists = async () => {
    const res = await fetch('/api/wishlist/user');
    if (res.ok) setWishlists(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return alert('請填入書名');
    setSubmitting(true);
    const res = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSubmitting(false);
    if (res.ok) {
      setForm({ title: '', author: '', coverUrl: '', description: '', booksUrl: '' });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      loadWishlists();
    } else {
      alert('提交失敗，請重試');
    }
  };

  const statusLabel = (status: string) => {
    if (status === 'done') return { text: '✅ 已處理', color: '#22c55e' };
    return { text: '⏳ 審核中', color: '#f59e0b' };
  };

  return (
    <div className="container">
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⭐ 願望清單</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>推薦你想看的書，管理員審核後會加入書庫！</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* 提交表單 */}
        <div className="glass" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>📝 提交書籍推薦</h2>

          {submitted && (
            <div style={{ background: '#22c55e22', border: '1px solid #22c55e', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', color: '#22c55e' }}>
              ✅ 已成功提交！管理員審核後會加入書庫。
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>書名 *</label>
              <input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="請輸入書名" required />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>作者</label>
              <input className="input-field" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} placeholder="請輸入作者名稱" />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>封面圖片網址</label>
              <input className="input-field" value={form.coverUrl} onChange={e => setForm({ ...form, coverUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>書籍簡介</label>
              <textarea className="input-field" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="簡單介紹這本書..." />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>購買連結（如博客來）</label>
              <input className="input-field" value={form.booksUrl} onChange={e => setForm({ ...form, booksUrl: e.target.value })} placeholder="https://www.books.com.tw/..." />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
              {submitting ? '提交中...' : '🚀 送出推薦'}
            </button>
          </form>
        </div>

        {/* 我的提交紀錄 */}
        <div className="glass" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>📋 我的提交紀錄</h2>
          {wishlists.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>還沒有提交紀錄，快去推薦你喜愛的書吧！</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {wishlists.map((w: any) => {
                const s = statusLabel(w.status);
                return (
                  <div key={w.id} style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 700 }}>{w.title}</span>
                      <span style={{ background: `${s.color}22`, color: s.color, padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem' }}>
                        {s.text}
                      </span>
                    </div>
                    {w.author && <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>作者：{w.author}</div>}
                    {w.description && <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.3rem' }}>{w.description}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
