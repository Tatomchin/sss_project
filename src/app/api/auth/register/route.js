import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcrypt'


// ✅ POST /api/user
export async function POST(req) {
    try {
        const body = await req.json()
        const { username, password, email } = body

        if (!username || !password) {
            return NextResponse.json(
                { message: 'Username and password are required.' },
                { status: 400 }
            )
        }

        // เข้ารหัสรหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, 10)

        console.log('Username:', username)
        console.log('Pass:', password)
        console.log('Hashed Password:', hashedPassword)

        // บันทึกลงฐานข้อมูล
        const newUser = await prisma.user.create({
          data: {
            username: username,
            password: hashedPassword,
          },
        })

        return NextResponse.json(
            { message: 'User created successfully', 
                user: newUser
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json(
            { message: 'Internal server error', error: error.message },
            { status: 500 }
        )
    }
}
