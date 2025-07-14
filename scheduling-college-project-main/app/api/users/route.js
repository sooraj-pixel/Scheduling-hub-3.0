import initSql from "@/lib/db";
import { NextResponse } from "next/server";

const tableName = 'users';

export const GET = async () => {
    const db = await initSql()

    const query = `Select * FROM ${tableName}`;
    const data = await db.query(query);

    return NextResponse.json(data);
}

export const POST = async (req) => {
    try {
        const db = await initSql();

        const { username, email, password, role } = await req.json();
        // console.log({ name, email, password, role });

        if (!username || !email || !password || !role) {
            return new Response("All fields are required", { status: 400 });
        }
        await db.query(`INSERT INTO ${tableName} (username, email, password, role) VALUES (?, ?, ?, ?)`, [username, email, password, role]);

        return NextResponse.json({ message: "Added successfully." });
    }
    catch (err) {
        return NextResponse.json({ success: false, message: err.message });
    }
}
export const PUT = async (req) => {
    try {
        const db = await initSql();

        const { username, email, password, role } = await req.json();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        console.log({ id }, { username, email, password, role });

        if (!username || !email || !password || !role) {
            return new Response("All fields are required", { status: 400 });
        }
        await db.query(
            `UPDATE ${tableName} 
            SET username = ?, email = ?, password = ?, role = ? WHERE id = ?`,
            [username, email, password, role, id]
        );

        return NextResponse.json({ message: "Added successfully." });
    }
    catch (err) {
        return NextResponse.json({ success: false, message: err.message });
    }
}
export async function DELETE(req) {
    const db = await initSql()

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
        await db.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
        return new Response("Deleted successfully", { status: 200 });
    }
    return new Response("User does not exist", { status: 404 });
}
