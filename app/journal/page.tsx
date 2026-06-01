'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function JournalSquare() {
  const router = useRouter();
  const [journals, setJournals] = useState<any[]>([]);
  const [me, setMe] = useState<any>(null);
  const [form, setForm] = useState({ title: '', content: '' });
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.user) setMe(d.user); });
    loadJournals();
  }, []);

  const loadJournals = async () => {
    const res = await fetch('/api/journals');
    if (res.ok) setJournals(await res.json());
  };

  const handleLike = async (journalId: number) => {
    if (!me) return router.push('/login');
    await fetch(`/api/journals/${journalId}/like`, { method: 'POST' });
    loadJournals();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content.trim()) return alert('內容為必填');
    setSubmitting(true);
    await fetch('/api/journals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ title: '', content: '' });
    setShowForm(false);
    setSubmitting(false);
    loadJournals();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('確定刪除這篇心得？')) return;
    await fetch(`/api/journals/${id}`, { method: 'DELETE' });
    loadJournals();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>📝 心得廣場</h1>
          <p style={{ color: 'var(--text-secondary)' }}>分享你的閱讀感受，與書友交流</p>
        </div>
        {me && !showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            ✏️ 發表心得
          </button>
        )}
      </div>

      {/* 發表表單 */}
      {showForm && (
        <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: '4px solid var(--primary)' }}>
          <h2 style={{ marginBottom: '1.2rem' }}>✏️ 發表新心得</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>標題（選填）</label>
              <input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="給你的心得一個標題..." />
            </div>
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>內容 *</label>
              <textarea className="input-field" rows={5} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="分享你的閱讀心得..." required />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? '送出中...' : '🚀 發表'}</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}>取消</button>
            </div>
          </form>
        </div>
      )}

      {/* 心得列表 */}
      {journals.length === 0 ? (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          還沒有人發表心得，成為第一個吧！
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {journals.map((j: any) => {
            const likeCount = j.likes?.length ?? 0;
            const liked = me ? j.likes?.some((l: any) => l.userId === me.id) : false;
            const isOwner = me?.id === j.user?.id;
            const isAdmin = me?.role === 'admin';

            return (
              <div key={j.id} className="glass" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                  <div>
                    <Link href={`/user/${j.user?.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '0.4rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                        {j.user?.username?.[0]?.toUpperCase()}
                      </div>
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{j.user?.username}</span>
                    </Link>
                    {j.title && <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{j.title}</div>}
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{formatDate(j.createdAt)}</div>
                  </div>
                  {(isOwner || isAdmin) && (
                    <button onClick={() => handleDelete(j.id)} style={{ background: '#ef4444', border: 'none', color: 'white', padding: '0.3rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>🗑</button>
                  )}
                </div>
                <p style={{ lineHeight: 1.75, whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>{j.content}</p>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button
                    onClick={() => handleLike(j.id)}
                    style={{ background: liked ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${liked ? '#f87171' : 'var(--glass-border)'}`, color: liked ? '#f87171' : 'var(--text-secondary)', padding: '0.35rem 0.9rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}
                  >
                    {liked ? '❤️' : '🤍'} {likeCount}
                  </button>
                  <Link href={`/user/${j.user?.id}`} style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>
                    查看個人版面 →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
