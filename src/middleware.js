import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

// เส้นทางที่ต้องป้องกัน (ปรับตามระบบจริง)
const protectedPaths = ['/dashboard', '/api/protected']

export async function middleware(req) {
  const { pathname } = req.nextUrl

  // ข้ามถ้าไม่ใช่เส้นทางที่ป้องกัน
  if (!protectedPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // อ่าน access token จากคุกกี้
  const token = req.cookies.get('access_token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    const { payload } = await jwtVerify(token, SECRET)
    const res = NextResponse.next()
    // แนบ header บางตัวถ้าจำเป็นไปยัง server components/api ภายใน
    if (payload?.sub) res.headers.set('x-user-id', String(payload.sub))
    if (payload?.role) res.headers.set('x-user-role', String(payload.role))
    return res
  } catch {
    // access token ไม่ผ่าน/หมดอายุ -> ให้ไปหน้า login
    // (หรือจะ redirect ไปเพจที่กดเรียก /api/auth/refresh อัตโนมัติก็ได้)
    return NextResponse.redirect(new URL('/login', req.url))
  }
}
