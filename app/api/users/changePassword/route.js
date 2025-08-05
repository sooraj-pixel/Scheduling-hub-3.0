import { NextResponse } from "next/server";
import initSql from "@/lib/db";

// To send a request to admin to reset the password
export async function POST(req) {
    try {
        const db = await initSql();

        const { resetEmail } = await req.json();
        console.log("POST USER REQUEST FOR CHANGE PASSWORD");

        // create table
        let createTableQuery = `CREATE TABLE IF NOT EXISTS password_resets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            status INT DEFAULT 0
        )`;
        // 0: pending, 1: completed, 2: rejected
        await db.query(createTableQuery);

        // Save request in the database
        await db.query("INSERT INTO password_resets (email) VALUES (?)", [resetEmail]);

        return NextResponse.json({ message: "Request submitted" }, { status: 200 });
    }
    catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// To change the password by yourself through the profile section
export async function PATCH(req) {
    try {
        const db = await initSql()
        console.log("pathc request");

        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");
        const { newPassword } = await req.json();

        console.log({ email, newPassword });

        await db.execute("UPDATE users SET password = ? WHERE email = ?", [newPassword, email]);

        return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
    }
    catch (error) {
        console.error("Error updating password:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
