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

    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    if (decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const wishlists = await prisma.wishlist.findMany({
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(wishlists);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch wishlists' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const { title, author, coverUrl, description, booksUrl } = await request.json();

    if (!title) return NextResponse.json({ error: '書名為必填' }, { status: 400 });

    const wishlist = await prisma.wishlist.create({
      data: { title, author, coverUrl, description, booksUrl, userId: decoded.userId },
    });

    return NextResponse.json(wishlist, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create wishlist' }, { status: 500 });
  }
}
