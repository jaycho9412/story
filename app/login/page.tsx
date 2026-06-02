'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // 登入狀態
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // 註冊狀態
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: loginUsername, password: loginPassword }),
    });
    setLoginLoading(false);
    if (res.ok) {
      window.location.href = '/';
    } else {
      const data = await res.json();
      setLoginError(data.error || '登入失敗，請確認帳號密碼');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (regPassword !== regConfirm) {
      setRegError('兩次密碼不一致');
      return;
    }

    setRegLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: regUsername, password: regPassword, confirmPassword: regConfirm }),
    });
    setRegLoading(false);

    if (res.ok) {
      window.location.href = '/'; // 註冊成功自動登入，導回首頁
    } else {
      const data = await res.json();
      setRegError(data.error || '註冊失敗，請稍後再試');
    }
  };

  const switchTab = (t: 'login' | 'register') => {
    setTab(t);
    setLoginError('');
    setRegError('');
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass" style={{ padding: '2.5rem', width: '100%', maxWidth: '420px' }}>

        {/* Tab 切換 */}
        <div style={{ display: 'flex', marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px' }}>
          {(['login', 'register'] as const).map(t => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: '9px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '1rem',
                transition: 'all 0.2s',
                background: tab === t ? 'var(--primary)' : 'transparent',
                color: tab === t ? 'white' : 'var(--text-secondary)',
              }}
            >
              {t === 'login' ? '登入' : '註冊'}
            </button>
          ))}
        </div>

        {/* 登入表單 */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.6rem' }}>歡迎回來 👋</h2>

            {loginError && (
              <div style={{ color: '#f87171', marginBottom: '1rem', background: 'rgba(239,68,68,0.1)', padding: '0.6rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                {loginError}
              </div>
            )}

            <input type="text" placeholder="帳號" className="input-field" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} required />
            <input type="password" placeholder="密碼" className="input-field" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />

            <button type="submit" className="btn btn-primary" disabled={loginLoading} style={{ width: '100%', marginTop: '0.5rem', fontSize: '1.05rem', padding: '0.85rem' }}>
              {loginLoading ? '登入中...' : '登入'}
            </button>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '1.2rem' }}>
              還沒有帳號？
              <button type="button" onClick={() => switchTab('register')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, padding: '0 0.3rem' }}>
                立即註冊
              </button>
            </p>
          </form>
        )}

        {/* 註冊表單 */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.6rem' }}>建立帳號 ✨</h2>

            {regError && (
              <div style={{ color: '#f87171', marginBottom: '1rem', background: 'rgba(239,68,68,0.1)', padding: '0.6rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                {regError}
              </div>
            )}

            <input type="text" placeholder="帳號（至少 4 個字元）" className="input-field" value={regUsername} onChange={e => setRegUsername(e.target.value)} required minLength={4} />
            <input type="password" placeholder="密碼（至少 4 個字元）" className="input-field" value={regPassword} onChange={e => setRegPassword(e.target.value)} required minLength={4} />
            <input type="password" placeholder="確認密碼" className="input-field" value={regConfirm} onChange={e => setRegConfirm(e.target.value)} required />

            {/* 密碼不符即時提示 */}
            {regConfirm && regPassword !== regConfirm && (
              <div style={{ color: '#f87171', fontSize: '0.82rem', marginBottom: '0.5rem', textAlign: 'left' }}>
                ⚠ 兩次密碼不一致
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={regLoading || (!!regConfirm && regPassword !== regConfirm)}
              style={{ width: '100%', marginTop: '0.5rem', fontSize: '1.05rem', padding: '0.85rem' }}
            >
              {regLoading ? '建立中...' : '🚀 建立帳號'}
            </button>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '1.2rem' }}>
              已有帳號？
              <button type="button" onClick={() => switchTab('login')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, padding: '0 0.3rem' }}>
                前往登入
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
