'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.refresh();
  };

  return (
    <nav className="navbar">
      <h2>
        <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>
          📖 小說評論網
        </Link>
      </h2>
      <div className="nav-links">
        <Link href="/">首頁</Link>
        {user ? (
          <>
            <Link href="/wishlist" style={{ color: 'var(--star)' }}>⭐ 願望清單</Link>
            <Link href="/profile" style={{ color: '#86efac' }}>📝 心得廣場</Link>
            {user.role === 'admin' && (
              <Link href="/admin" style={{ color: 'var(--accent)' }}>⚙️ 後台管理</Link>
            )}
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {user.username} {user.role === 'admin' ? '(管理員)' : ''}
            </span>
            <button
              onClick={handleLogout}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem' }}
            >
              登出
            </button>
          </>
        ) : (
          <Link href="/login" className="btn btn-primary" style={{ padding: '0.4rem 1rem', marginLeft: '1.5rem' }}>登入</Link>
        )}
      </div>
    </nav>
  );
}
