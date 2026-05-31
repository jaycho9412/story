import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    jwt.verify(token, JWT_SECRET);

    const { url } = await request.json();
    if (!url || !url.includes('books.com.tw')) {
      return NextResponse.json({ error: 'Invalid Books.com.tw URL' }, { status: 400 });
    }

    const { data } = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
        'Referer': 'https://www.google.com/',
      },
      maxRedirects: 5,
    });

    const $ = cheerio.load(data);

    // Try multiple selectors for title
    let title =
      $('meta[property="og:title"]').attr('content') ||
      $('h1.mod_b_name').text() ||
      $('h1').first().text() ||
      '';
    title = title.replace(' - 博客來', '').replace('博客來-', '').trim();

    // Try multiple selectors for author
    const author =
      $('.type02_p003 a').first().text().trim() ||
      $('meta[name="author"]').attr('content') ||
      $('[itemprop="author"]').first().text().trim() ||
      '';

    // Cover image
    const coverUrl =
      $('meta[property="og:image"]').attr('content') ||
      $('img#M_BookCover').attr('src') ||
      '';

    // Description
    const description =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      '';

    if (!title) {
      return NextResponse.json(
        { error: '無法從該網址抓取書籍資訊，博客來可能已封鎖自動抓取。請改用手動新增。' },
        { status: 422 }
      );
    }

    const novel = await prisma.novel.create({
      data: {
        title,
        author: author || '未知作者',
        coverUrl,
        description,
        booksUrl: url,
      },
    });

    return NextResponse.json({ message: 'Scraped successfully', novel });
  } catch (error: any) {
    console.error('Scraping error:', error?.response?.status, error?.message);
    if (error?.response?.status === 403 || error?.response?.status === 429) {
      return NextResponse.json(
        { error: '博客來封鎖了自動抓取（403/429）。請改用手動新增書籍。' },
        { status: 422 }
      );
    }
    return NextResponse.json({ error: '抓取失敗，請改用手動新增書籍。' }, { status: 500 });
  }
}
