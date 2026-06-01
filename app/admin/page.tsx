'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [novels, setNovels] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'novels' | 'reviews' | 'wishlist'>('novels');
  const [expandedNovel, setExpandedNovel] = useState<number | null>(null);
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (!data.user || data.user.role !== 'admin') router.push('/');
      else setUser(data.user);
    });
    loadData();
  }, []);

  const loadData = async () => {
    const [n, r, w, t] = await Promise.all([
      fetch('/api/novels').then(r => r.json()),
      fetch('/api/reviews').then(r => r.json()),
      fetch('/api/wishlist').then(r => r.json()),
      fetch('/api/tags').then(r => r.json()),
    ]);
    setNovels(Array.isArray(n) ? n : []);
    setReviews(Array.isArray(r) ? r : []);
    setWishlists(Array.isArray(w) ? w : []);
    setAllTags(Array.isArray(t) ? t : []);
  };

  const deleteNovel = async (id: number) => {
    if (!confirm('確定刪除這本書？所有相關評論也會一起刪除。')) return;
    await fetch(`/api/novels/${id}`, { method: 'DELETE' });
    loadData();
  };

  const deleteReview = async (id: number) => {
    if (!confirm('確定刪除這則留言？')) return;
    await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    loadData();
  };

  const markWishlistDone = async (id: number, current: string) => {
    const newStatus = current === 'done' ? 'pending' : 'done';
    await fetch(`/api/wishlist/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    loadData();
  };

  const deleteWishlist = async (id: number) => {
    if (!confirm('確定刪除這筆願望？')) return;
    await fetch(`/api/wishlist/${id}`, { method: 'DELETE' });
    loadData();
  };

  const createTag = async () => {
    if (!newTagName.trim()) return;
    await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTagName.trim() }),
    });
    setNewTagName('');
    loadData();
  };

  const addTagToNovel = async (novelId: number, tagId: number) => {
    await fetch(`/api/novels/${novelId}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tagId }),
    });
    loadData();
  };

  const removeTagFromNovel = async (novelId: number, tagId: number) => {
    await fetch(`/api/novels/${novelId}/tags`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tagId }),
    });
    loadData();
  };

  const tabs = [
    { key: 'novels', label: `📚 書籍管理 (${novels.length})` },
    { key: 'reviews', label: `💬 留言管理 (${reviews.length})` },
    { key: 'wishlist', label: `⭐ 願望清單 (${wishlists.filter(w => w.status === 'pending').length} 待處理)` },
  ];

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚙️ 管理員後台</h1>
        <p style={{ color: 'var(--text-secondary)' }}>管理書籍、留言與用戶願望清單</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{ background: activeTab === tab.key ? 'var(--primary)' : 'transparent', border: activeTab === tab.key ? 'none' : '1px solid var(--glass-border)', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: activeTab === tab.key ? 700 : 400, transition: 'all 0.2s' }}>
            {tab.label}
          </button>
        ))}
        <button onClick={() => router.push('/admin/add')} style={{ marginLeft: 'auto', background: 'var(--accent)', border: 'none', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
          ＋ 新增書籍
        </button>
      </div>

      {/* 書籍管理 */}
      {activeTab === 'novels' && (
        <div>
          {/* 標籤管理區 */}
          <div className="glass" style={{ padding: '1.2rem', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.8rem' }}>🏷️ 標籤管理</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.8rem' }}>
              {allTags.map(tag => (
                <span key={tag.id} style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', color: '#c4b5fd', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.85rem' }}>#{tag.name}</span>
              ))}
              {allTags.length === 0 && <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>尚無標籤</span>}
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <input className="input-field" value={newTagName} onChange={e => setNewTagName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createTag()} placeholder="新增標籤（如：奇幻、推理）" style={{ flex: 1 }} />
              <button onClick={createTag} className="btn btn-primary" style={{ padding: '0 1rem', whiteSpace: 'nowrap' }}>＋ 新增</button>
            </div>
          </div>

          {/* 書籍列表 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {novels.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>目前沒有書籍</p> : novels.map((novel: any) => (
              <div key={novel.id} className="glass" style={{ padding: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  {novel.coverUrl && <img src={novel.coverUrl} alt={novel.title} style={{ width: '50px', height: '70px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{novel.title}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>{novel.author} · {novel.reviews?.length ?? 0} 則評論</div>
                    {/* 現有標籤 */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {novel.tags?.map((tag: any) => (
                        <span key={tag.id} style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', color: '#c4b5fd', padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          #{tag.name}
                          <button onClick={() => removeTagFromNovel(novel.id, tag.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: '0.9rem' }}>✕</button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button onClick={() => setExpandedNovel(expandedNovel === novel.id ? null : novel.id)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      🏷️ 標籤
                    </button>
                    <button onClick={() => router.push(`/novels/${novel.id}`)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>查看</button>
                    <button onClick={() => deleteNovel(novel.id)} style={{ background: '#ef4444', border: 'none', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>🗑</button>
                  </div>
                </div>

                {/* 展開：加入標籤 */}
                {expandedNovel === novel.id && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                    <div style={{ fontSize: '0.9rem', marginBottom: '0.6rem', color: 'var(--text-secondary)' }}>選擇要加入的標籤：</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {allTags.filter(t => !novel.tags?.some((nt: any) => nt.id === t.id)).map(tag => (
                        <button key={tag.id} onClick={() => addTagToNovel(novel.id, tag.id)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '16px', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.15s' }}>
                          + #{tag.name}
                        </button>
                      ))}
                      {allTags.filter(t => !novel.tags?.some((nt: any) => nt.id === t.id)).length === 0 && (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>已加入所有標籤</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 留言管理 */}
      {activeTab === 'reviews' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>目前沒有留言</p> : reviews.map((review: any) => (
            <div key={review.id} className="glass" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 700 }}>{review.user?.username}</span>
                  <span style={{ color: '#fbbf24' }}>{'★'.repeat(review.rating)}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>《{review.novel?.title}》</span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>{review.content}</div>
              </div>
              <button onClick={() => deleteReview(review.id)} style={{ background: '#ef4444', border: 'none', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}>🗑 刪除</button>
            </div>
          ))}
        </div>
      )}

      {/* 願望清單 */}
      {activeTab === 'wishlist' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {wishlists.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>目前沒有願望清單</p> : wishlists.map((w: any) => (
            <div key={w.id} className="glass" style={{ padding: '1.5rem', borderLeft: `4px solid ${w.status === 'done' ? '#22c55e' : '#f59e0b'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                <div>
                  <span style={{ background: w.status === 'done' ? '#22c55e22' : '#f59e0b22', color: w.status === 'done' ? '#22c55e' : '#f59e0b', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', marginRight: '0.8rem' }}>
                    {w.status === 'done' ? '✅ 已處理' : '⏳ 待處理'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>由 {w.user?.username} 提交</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => markWishlistDone(w.id, w.status)} style={{ background: w.status === 'done' ? '#6b7280' : '#22c55e', border: 'none', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    {w.status === 'done' ? '↩ 標回待處理' : '✓ 標為已處理'}
                  </button>
                  <button onClick={() => router.push(`/admin/add?title=${encodeURIComponent(w.title)}&author=${encodeURIComponent(w.author || '')}&coverUrl=${encodeURIComponent(w.coverUrl || '')}&description=${encodeURIComponent(w.description || '')}&booksUrl=${encodeURIComponent(w.booksUrl || '')}`)} style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    ＋ 新增到書庫
                  </button>
                  <button onClick={() => deleteWishlist(w.id)} style={{ background: '#ef4444', border: 'none', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>🗑</button>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.3rem' }}>{w.title}</div>
              {w.author && <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>作者：{w.author}</div>}
              {w.description && <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>{w.description}</div>}
              {w.booksUrl && <a href={w.booksUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>🔗 購買連結</a>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
