import initSql from '@/lib/db'
import { NextResponse } from 'next/server'

// Mock database or replace with real DB query
const mockUsers = [
    { email: 'admin@gmail.com', password: '0000', name: 'admin', id: 1, role: 1 },
    { email: 'instructor@gmail.com', password: '0000', name: 'instructor', id: 2, role: 2 },
    { email: 'staff@gmail.com', password: '0000', name: 'staff', id: 3, role: 3 },
]
export async function POST(request) {
    try {
        const db = await initSql()
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
        }

        // Query MySQL database for user
        const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
        const [rows] = await db.query(query, [email, password]);
        console.log({ rows });

        if (rows.length === 0) {
            return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
        }
        return NextResponse.json(rows[0]); // Return the first user found
    }
    catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}