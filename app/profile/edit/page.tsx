'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ManageJournals() {
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 新增心得
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  // 編輯心得
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: '', content: '' });
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (!data.user) { router.push('/login'); return; }
      setMe(data.user);
      loadJournals();
    });
  }, []);

  const loadJournals = async () => {
    const res = await fetch('/api/journals');
    if (res.ok) {
      const all = await res.json();
      const mine = all.filter((j: any) => j.user?.id === undefined
        ? false
        : true); // will filter after me loads
      setJournals(all);
    }
    setLoading(false);
  };

  // 等 me 載入後過濾自己的心得
  const myJournals = me ? journals.filter((j: any) => j.userId === me.id || j.user?.id === me.id) : [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content.trim()) return;
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

  const openEdit = (j: any) => {
    setEditingId(j.id);
    setEditForm({ title: j.title || '', content: j.content || '' });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.content.trim()) return;
    setEditSaving(true);
    await fetch(`/api/journals/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    setEditingId(null);
    setEditSaving(false);
    loadJournals();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('確定刪除這篇心得？')) return;
    await fetch(`/api/journals/${id}`, { method: 'DELETE' });
    loadJournals();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) return <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>載入中...</div>;

  return (
    <div className="container" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>📝 管理我的心得</h1>
          <p style={{ color: 'var(--text-secondary)' }}>共 {myJournals.length} 篇心得</p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              ✏️ 新增心得
            </button>
          )}
          <button
            onClick={() => me && router.push(`/user/${me.id}`)}
            style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
          >
            ← 回個人版面
          </button>
        </div>
      </div>

      {/* 新增表單 */}
      {showForm && (
        <div className="glass" style={{ padding: '1.8rem', marginBottom: '2rem', borderLeft: '4px solid var(--primary)' }}>
          <h2 style={{ marginBottom: '1.2rem', fontSize: '1.2rem' }}>✏️ 新增心得</h2>
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: '1rem' }}>
              <input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="標題（選填）" />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <textarea className="input-field" rows={5} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="寫下你的閱讀心得..." required />
            </div>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? '送出中...' : '🚀 發表'}</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>取消</button>
            </div>
          </form>
        </div>
      )}

      {/* 心得列表 */}
      {myJournals.length === 0 ? (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✍️</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>還沒有任何心得</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">寫第一篇心得</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {myJournals.map((j: any) => (
            <div key={j.id} className="glass" style={{ padding: '1.5rem' }}>
              {editingId === j.id ? (
                /* 編輯模式 */
                <form onSubmit={handleEdit}>
                  <div style={{ marginBottom: '0.8rem' }}>
                    <input className="input-field" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} placeholder="標題（選填）" />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <textarea className="input-field" rows={5} value={editForm.content} onChange={e => setEditForm({ ...editForm, content: e.target.value })} placeholder="內容..." required />
                  </div>
                  <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={editSaving} style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>{editSaving ? '儲存中...' : '💾 儲存'}</button>
                    <button type="button" onClick={() => setEditingId(null)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>取消</button>
                  </div>
                </form>
              ) : (
                /* 檢視模式 */
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                    <div>
                      {j.title && <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.2rem' }}>{j.title}</div>}
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{formatDate(j.createdAt)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEdit(j)} style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.5)', color: '#93c5fd', padding: '0.3rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>✏️ 編輯</button>
                      <button onClick={() => handleDelete(j.id)} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #f87171', color: '#f87171', padding: '0.3rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>🗑 刪除</button>
                    </div>
                  </div>
                  <p style={{ lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{j.content}</p>
                  <div style={{ marginTop: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    ❤️ {j.likes?.length ?? 0} 個讚
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
