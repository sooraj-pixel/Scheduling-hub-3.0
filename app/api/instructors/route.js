import initSql from "@/lib/db";
import { NextResponse } from "next/server";

const tableName = "schedules";

export async function GET(req) {
  const db = await initSql();

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  console.log("📨 Received email:", email);

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const [rows] = await db.query(
      `SELECT * FROM ${tableName} WHERE instructor_email = ?`,
      [email]
    );

    console.log("✅ Rows returned:", rows);

    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error("❌ Query error:", err);
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }
}
