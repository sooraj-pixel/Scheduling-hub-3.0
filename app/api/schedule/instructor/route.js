import initSql, { db } from "@/lib/db"; // Adjust to your DB connection
import { NextResponse } from "next/server";

const tableName = 'master_schedule';

export async function GET(req) {
    const db = await initSql()

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    console.log(email);

    if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    try {
        // get data
        const data = await db.query(`SELECT * FROM ${tableName} WHERE instructor_email_id = ?`, [email]);

        // get all the columns
        const getColumnsQuery = `SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = '${tableName}'
            ORDER BY ORDINAL_POSITION`;
        const columns = await db.query(getColumnsQuery);

        return NextResponse.json({ data, columns });
    }
    catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
    }
}
