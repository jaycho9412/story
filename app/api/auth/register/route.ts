import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function POST(request: Request) {
  try {
    const { username, password, confirmPassword } = await request.json();

    // 基本驗證
    if (!username?.trim() || !password) {
      return NextResponse.json({ error: '帳號與密碼為必填' }, { status: 400 });
    }
    if (username.trim().length < 4) {
      return NextResponse.json({ error: '帳號至少需要 4 個字元' }, { status: 400 });
    }
    if (password.length < 4) {
      return NextResponse.json({ error: '密碼至少需要 4 個字元' }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: '兩次密碼不一致' }, { status: 400 });
    }

    // 檢查帳號是否已存在
    const existing = await prisma.user.findUnique({ where: { username: username.trim() } });
    if (existing) {
      return NextResponse.json({ error: '此帳號已被使用，請換一個' }, { status: 409 });
    }

    // 建立帳號
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username: username.trim(), passwordHash, role: 'user' },
    });

    // 自動登入（設定 JWT Cookie）
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    const response = NextResponse.json({
      message: '註冊成功',
      user: { id: user.id, username: user.username, role: user.role },
    }, { status: 201 });

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: '伺服器錯誤，請稍後再試' }, { status: 500 });
  }
}
