'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (!data.user) {
        router.push('/login');
      } else {
        router.replace(`/user/${data.user.id}`);
      }
    });
  }, []);

  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      載入中...
    </div>
  );
}
