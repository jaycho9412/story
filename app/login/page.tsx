'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      window.location.href = '/';
    } else {
      const data = await res.json();
      setError(data.error || '登入失敗');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass" style={{ padding: '2.5rem', width: '100%', maxWidth: '420px' }}>

        {/* Tab 切換 */}
        <div style={{ display: 'flex', marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px' }}>
          <button
            onClick={() => { setTab('login'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: '9px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '1rem',
              transition: 'all 0.2s',
              background: tab === 'login' ? 'var(--primary)' : 'transparent',
              color: tab === 'login' ? 'white' : 'var(--text-secondary)',
            }}
          >
            登入
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: '9px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '1rem',
              transition: 'all 0.2s',
              background: tab === 'register' ? 'var(--primary)' : 'transparent',
              color: tab === 'register' ? 'white' : 'var(--text-secondary)',
            }}
          >
            註冊
          </button>
        </div>

        {/* 登入表單 */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.6rem' }}>歡迎回來 👋</h2>

            {error && (
              <div style={{ color: 'var(--danger)', marginBottom: '1rem', background: 'rgba(239,68,68,0.1)', padding: '0.6rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            <input
              type="text"
              placeholder="帳號"
              className="input-field"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="密碼"
              className="input-field"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', fontSize: '1.05rem', padding: '0.85rem' }}>
              登入
            </button>
          </form>
        )}

        {/* 註冊（暫無功能） */}
        {tab === 'register' && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.6rem' }}>建立帳號 ✨</h2>

            <input type="text" placeholder="帳號" className="input-field" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            <input type="password" placeholder="密碼" className="input-field" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            <input type="password" placeholder="確認密碼" className="input-field" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />

            <button
              disabled
              style={{ width: '100%', marginTop: '0.5rem', fontSize: '1.05rem', padding: '0.85rem', borderRadius: '10px', border: 'none', background: 'rgba(139,92,246,0.3)', color: 'rgba(255,255,255,0.4)', cursor: 'not-allowed' }}
            >
              註冊（即將開放）
            </button>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '1.2rem' }}>
              🚧 註冊功能開發中，敬請期待
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
