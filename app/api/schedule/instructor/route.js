import initSql from "@/lib/db";
import { NextResponse } from "next/server";

const tableName = "schedules";

export async function GET(req) {
  const db = await initSql();

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  try {
    const data = await db.query(
      `SELECT * FROM ${tableName} WHERE instructor_email = ?`,
      [email]
    );

    // 🛠 Flatten result if it's a nested array
    const flattened = Array.isArray(data[0]) ? data.flat() : data;

    return NextResponse.json({ data: flattened });
  } catch (error) {
    console.error("Failed to fetch instructor schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}
