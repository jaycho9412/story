import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    const wishlists = await prisma.wishlist.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(wishlists);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch wishlists' }, { status: 500 });
  }
}
