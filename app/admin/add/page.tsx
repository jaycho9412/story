'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AddNovelForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    title: '',
    author: '',
    coverUrl: '',
    description: '',
    booksUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (!data.user || data.user.role !== 'admin') router.push('/');
    });

    // 從願望清單預填資料
    const title = searchParams.get('title');
    if (title) {
      setForm({
        title: title || '',
        author: searchParams.get('author') || '',
        coverUrl: searchParams.get('coverUrl') || '',
        description: searchParams.get('description') || '',
        booksUrl: searchParams.get('booksUrl') || '',
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return alert('書名為必填');
    setSubmitting(true);
    const res = await fetch('/api/novels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSubmitting(false);
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push('/admin'), 1500);
    } else {
      alert('新增失敗，請重試');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => router.push('/admin')} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '1rem' }}>
          ← 返回後台
        </button>
        <h1 style={{ fontSize: '2rem' }}>➕ 新增書籍</h1>
      </div>

      {success && (
        <div style={{ background: '#22c55e22', border: '1px solid #22c55e', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', color: '#22c55e' }}>
          ✅ 新增成功！正在返回後台...
        </div>
      )}

      <div className="glass" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem' }}>書名 *</label>
            <input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="請輸入書名" required />
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem' }}>作者</label>
            <input className="input-field" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} placeholder="請輸入作者名稱" />
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem' }}>封面圖片網址</label>
            <input className="input-field" value={form.coverUrl} onChange={e => setForm({ ...form, coverUrl: e.target.value })} placeholder="https://..." />
            {form.coverUrl && (
              <img src={form.coverUrl} alt="預覽" style={{ marginTop: '0.8rem', height: '120px', borderRadius: '6px', objectFit: 'cover' }} onError={e => (e.currentTarget.style.display = 'none')} />
            )}
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem' }}>書籍簡介</label>
            <textarea className="input-field" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="請輸入書籍簡介..." />
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem' }}>博客來購買連結</label>
            <input className="input-field" value={form.booksUrl} onChange={e => setForm({ ...form, booksUrl: e.target.value })} placeholder="https://www.books.com.tw/..." />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}>
            {submitting ? '新增中...' : '✅ 新增書籍'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AddNovelPage() {
  return (
    <Suspense fallback={<div className="container">載入中...</div>}>
      <AddNovelForm />
    </Suspense>
  );
}
