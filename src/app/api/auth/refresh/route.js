// app/api/auth/refresh/route.ts
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET

export async function POST(req) {
  try {
    const refresh = (await req.headers.get('cookie'))
      ?.match(/(?:^|;\s*)refresh_token=([^;]+)/)?.[1]

    if (!refresh) {
      return NextResponse.json({ message: 'No refresh token' }, { status: 401 })
    }

    const decoded = jwt.verify(refresh, SECRET)
    if (decoded.typ !== 'refresh') throw new Error('Invalid token type')

    const access = jwt.sign({ sub: decoded.sub, role: decoded.role }, SECRET, { expiresIn: '15m' })
    const res = NextResponse.json({ message: 'refreshed' })
    res.cookies.set('access_token', access, {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 15
    })
    return res
  } catch (e) {
    return NextResponse.json({ message: 'Invalid refresh token' }, { status: 401 })
  }
}
