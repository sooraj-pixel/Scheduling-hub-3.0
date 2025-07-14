import initSql from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    const db = await initSql()
    const [rows1] = await db.query("SELECT COUNT(*) AS total FROM instructors");
    const [rows2] = await db.query("SELECT COUNT(*) AS total FROM classrooms");
    const [rows3] = await db.query("SELECT COUNT(*) AS total FROM password_resets");
    // console.log(rows1, rows2, rows3);

    return NextResponse.json({
        Instructors: rows1[0].total,
        Classes: rows2[0].total,
        ResetRequests: rows3[0].total
    });
}