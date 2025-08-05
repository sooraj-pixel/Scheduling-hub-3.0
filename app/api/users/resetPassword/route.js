import { NextResponse } from "next/server";
import initSql from "@/lib/db";

const tableName = 'password_resets';

export async function GET() {
    try {
        const db = await initSql();
        const [requests] = await db.query(`SELECT * FROM ${tableName} WHERE status = 0`); // pending
        // console.log(requests);

        return NextResponse.json(requests);
    }
    catch (error) {
        console.error("Error fetching requests:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function DELETE(req) {
    const db = await initSql()

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    console.log(id);

    if (id) {
        await db.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
        return new Response("Deleted successfully", { status: 200 });
    }
    return new Response("User does not exist", { status: 404 });
}
