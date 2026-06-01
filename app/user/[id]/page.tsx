'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [wallComments, setWallComments] = useState<any[]>([]);
  const [me, setMe] = useState<any>(null);
  const [commentInput, setCommentInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.user) setMe(d.user); });
    loadProfile();
    loadWall();
  }, [id]);

  const loadProfile = async () => {
    const res = await fetch(`/api/users/${id}`);
    if (res.ok) setProfile(await res.json());
    setLoading(false);
  };

  const loadWall = async () => {
    const res = await fetch(`/api/users/${id}/comments`);
    if (res.ok) setWallComments(await res.json());
  };

  const handleLike = async (journalId: number) => {
    if (!me) return router.push('/login');
    const res = await fetch(`/api/journals/${journalId}/like`, { method: 'POST' });
    if (res.ok) loadProfile();
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setSubmitting(true);
    await fetch(`/api/users/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: commentInput }),
    });
    setCommentInput('');
    setSubmitting(false);
    loadWall();
  };

  const deleteComment = async (commentId: number) => {
    if (!confirm('確定刪除這則留言？')) return;
    await fetch(`/api/users/${id}/comments/${commentId}`, { method: 'DELETE' });
    loadWall();
  };

  const deleteJournal = async (journalId: number) => {
    if (!confirm('確定刪除這篇心得？')) return;
    await fetch(`/api/journals/${journalId}`, { method: 'DELETE' });
    loadProfile();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) return <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>載入中...</div>;
  if (!profile) return <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>找不到此用戶</div>;

  const isMe = me?.id === profile.id;

  return (
    <div className="container">
      {/* 用戶資訊卡 */}
      <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
          {profile.username[0].toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>
            {profile.username}
            {profile.role === 'admin' && <span style={{ marginLeft: '0.7rem', background: 'rgba(239,68,68,0.2)', color: '#f87171', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem' }}>管理員</span>}
          </h1>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>加入於 {formatDate(profile.createdAt)}</div>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.8rem', fontSize: '0.9rem' }}>
            <span>📝 <strong>{profile._count.journals}</strong> 篇心得</span>
            <span>💬 <strong>{profile._count.reviews}</strong> 則書評</span>
          </div>
        </div>
        {isMe && (
          <button onClick={() => router.push('/profile/edit')} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
            ✏️ 管理心得
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
        {/* 心得列表 */}
        <div>
          <h2 style={{ marginBottom: '1.2rem', fontSize: '1.3rem' }}>📝 {isMe ? '我的心得' : `${profile.username} 的心得`}</h2>
          {profile.journals.length === 0 ? (
            <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              {isMe ? '還沒有心得，去心得廣場發表吧！' : '此用戶還沒有發表任何心得'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {profile.journals.map((j: any) => {
                const likeCount = j.likes?.length ?? 0;
                const liked = me ? j.likes?.some((l: any) => l.userId === me.id) : false;
                return (
                  <div key={j.id} className="glass" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                      <div>
                        {j.title && <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.2rem' }}>{j.title}</div>}
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{formatDate(j.createdAt)}</div>
                      </div>
                      {(isMe || me?.role === 'admin') && (
                        <button onClick={() => deleteJournal(j.id)} style={{ background: '#ef4444', border: 'none', color: 'white', padding: '0.3rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>🗑</button>
                      )}
                    </div>
                    <p style={{ lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>{j.content}</p>
                    <button
                      onClick={() => handleLike(j.id)}
                      style={{ background: liked ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${liked ? '#f87171' : 'var(--glass-border)'}`, color: liked ? '#f87171' : 'var(--text-secondary)', padding: '0.35rem 0.9rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}
                    >
                      {liked ? '❤️' : '🤍'} {likeCount}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 留言牆 */}
        <div>
          <h2 style={{ marginBottom: '1.2rem', fontSize: '1.3rem' }}>💬 留言牆</h2>

          {/* 留言輸入 */}
          {me ? (
            <form onSubmit={handleComment} style={{ marginBottom: '1.2rem' }}>
              <textarea
                className="input-field"
                rows={3}
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                placeholder={`留言給 ${profile.username}...`}
                style={{ marginBottom: '0.6rem' }}
              />
              <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
                {submitting ? '送出中...' : '💬 留言'}
              </button>
            </form>
          ) : (
            <div className="glass" style={{ padding: '1rem', textAlign: 'center', marginBottom: '1.2rem' }}>
              <Link href="/login" style={{ color: 'var(--primary)' }}>登入</Link>後才能留言
            </div>
          )}

          {/* 留言列表 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {wallComments.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>還沒有人留言，快來打招呼！</p>
            ) : wallComments.map((c: any) => (
              <div key={c.id} className="glass" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <Link href={`/user/${c.author.id}`} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
                    👤 {c.author.username}
                  </Link>
                  {(me?.id === c.authorId || me?.id === profile.id || me?.role === 'admin') && (
                    <button onClick={() => deleteComment(c.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem' }}>🗑</button>
                  )}
                </div>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>{c.content}</p>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.4rem' }}>{formatDate(c.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
