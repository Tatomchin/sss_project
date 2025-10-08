// app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET

export async function POST(req) {
  try {
    const { username, password } = await req.json()
    if (!username || !password) {
      return NextResponse.json({ message: 'username and password are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { username } })
    const ok = user?.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false
    if (!ok) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    // payload
    const accessToken = jwt.sign(
      { sub: String(user.id), role: 'admin' },
      SECRET,
      { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
      { sub: String(user.id), typ: 'refresh' },
      SECRET,
      { expiresIn: '7d' }
    )

    const res = NextResponse.json({ message: 'Login success' })
    // set Cookie
    res.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 15, // 15 min
    })
    res.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/api/auth', // restrict path
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    return res
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
