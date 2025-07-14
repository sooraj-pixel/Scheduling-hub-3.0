import initSql, { db } from "@/lib/db"; // Adjust to your DB connection
import { NextResponse } from "next/server";

const tableName = 'roombook';

export async function GET(req) {
    const db = await initSql()

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    console.log(email);

    if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const data = await db.query(`SELECT * FROM ${tableName} WHERE email = ?`, [email]);
    return NextResponse.json(data);
}
