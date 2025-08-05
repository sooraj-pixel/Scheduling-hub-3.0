import initSql from "@/lib/db";
import { NextResponse } from "next/server";

const tableName = "announcements";

export const GET = async (req) => {
    try {
        const db = await initSql()

        // Check if table exists using SHOW TABLES
        const checkTableQuery = `SHOW TABLES LIKE '${tableName}'`;
        const [tableExists] = await db.query(checkTableQuery);

        if (tableExists.length === 0) {
            return NextResponse.json({ message: "Table does not exist", data: [] });
        }
        const query = `Select * FROM ${tableName}`;
        const data = await db.query(query);

        return NextResponse.json({ data });
    }
    catch (err) {
        return NextResponse.json({ success: false, message: err.message });
    }
}
export const POST = async (req) => {
    try {
        const db = await initSql()
        const { title, description } = await req.json()
        // console.log({ title, description });

        // Ensure the table exists
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS ${tableName} (
                id INTEGER PRIMARY KEY AUTO_INCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await db.query(createTableQuery);

        // Query with parameterized values (Prevents SQL Injection: attacker can manipulate a query by inserting malicious SQL code through user input )
        const insertQuery = `INSERT INTO ${tableName} (title, description) VALUES (?, ?)`;
        const values = [title, description]; // Convert Data into an Array (to avoid any risk of SQL injection)

        const data = await db.query(insertQuery, values);

        return NextResponse.json({ message: "Announcement created successfully", data });
    }
    catch (err) {
        return NextResponse.json({ success: false, message: err.message });
    }
}
export async function DELETE(req) {
    const db = await initSql();

    // Extract the announcement ID from the request
    const { id } = await req.json();

    // Validate ID
    if (!id) {
        return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    try {
        // Delete query
        const deleteQuery = `DELETE FROM ${tableName} WHERE id = ?`;
        const [result] = await db.query(deleteQuery, [id]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "Announcement not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    }
    catch (error) {
        console.error("Error deleting announcement:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

