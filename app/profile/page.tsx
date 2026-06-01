'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [journals, setJournals] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', content: '' });
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (!data.user) { router.push('/login'); return; }
      setUser(data.user);
    });
    loadJournals();
  }, []);

  const loadJournals = async () => {
    const res = await fetch('/api/journals');
    if (res.ok) {
      const all = await res.json();
      setJournals(all);
    }
  };

  const myJournals = journals.filter(j => j.user?.id === user?.id);
  const otherJournals = journals.filter(j => j.user?.id !== user?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content.trim()) return alert('內容為必填');
    setSubmitting(true);

    if (editing) {
      await fetch(`/api/journals/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setEditing(null);
    } else {
      await fetch('/api/journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }

    setForm({ title: '', content: '' });
    setShowForm(false);
    setSubmitting(false);
    loadJournals();
  };

  const handleEdit = (journal: any) => {
    setEditing(journal);
    setForm({ title: journal.title || '', content: journal.content });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('確定刪除這篇心得？')) return;
    await fetch(`/api/journals/${id}`, { method: 'DELETE' });
    loadJournals();
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ title: '', content: '' });
    setShowForm(false);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>📝 心得廣場</h1>
        <p style={{ color: 'var(--text-secondary)' }}>分享你的閱讀感受，與書友交流</p>
      </div>

      {/* 發表按鈕 */}
      {user && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
          style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          ✏️ 發表新心得
        </button>
      )}

      {/* 發表/編輯表單 */}
      {showForm && (
        <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: '4px solid var(--primary)' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>{editing ? '✏️ 編輯心得' : '✏️ 發表新心得'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>標題（選填）</label>
              <input
                className="input-field"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="給你的心得一個標題..."
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>內容 *</label>
              <textarea
                className="input-field"
                rows={6}
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                placeholder="分享你的閱讀心得、書評或推薦理由..."
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? '送出中...' : editing ? '💾 儲存修改' : '🚀 發表'}
              </button>
              <button type="button" onClick={handleCancel} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}>
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 我的心得 */}
      {user && myJournals.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>📌 我的心得</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {myJournals.map(j => (
              <div key={j.id} className="glass" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                  <div>
                    {j.title && <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.2rem' }}>{j.title}</div>}
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{formatDate(j.createdAt)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEdit(j)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '0.3rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>✏️ 編輯</button>
                    <button onClick={() => handleDelete(j.id)} style={{ background: '#ef4444', border: 'none', color: 'white', padding: '0.3rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>🗑 刪除</button>
                  </div>
                </div>
                <p style={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{j.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 所有人的心得 */}
      <div>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>🌏 所有心得</h2>
        {journals.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>還沒有任何心得，成為第一個發表的人吧！</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {journals.map(j => (
              <div key={j.id} className="glass" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                  <div>
                    {j.title && <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.2rem' }}>{j.title}</div>}
                    <div style={{ display: 'flex', gap: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <span>👤 {j.user?.username}</span>
                      <span>{formatDate(j.createdAt)}</span>
                    </div>
                  </div>
                  {(user?.id === j.user?.id || user?.role === 'admin') && (
                    <button onClick={() => handleDelete(j.id)} style={{ background: '#ef4444', border: 'none', color: 'white', padding: '0.3rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>🗑</button>
                  )}
                </div>
                <p style={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{j.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
