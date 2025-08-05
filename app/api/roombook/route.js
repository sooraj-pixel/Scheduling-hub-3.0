import initSql from "@/lib/db";
import { NextResponse } from "next/server";

const tableName = "roombook";

export const GET = async (req) => {
    const db = await initSql()

    const query = `Select * FROM ${tableName}`;
    const data = await db.query(query);

    return NextResponse.json(data);
}
export const POST = async (req) => {
    try {
        const db = await initSql()
        const body = await req.json()
        // console.log(body);

        // Ensure database table exists and table structure
        await db.query(`
            CREATE TABLE IF NOT EXISTS ${tableName} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                fullName VARCHAR(255),
                email VARCHAR(255),
                department VARCHAR(255),
                purpose TEXT,
                date DATE,
                startTime TIME,
                endTime TIME,
                capacity INT,
                remarks VARCHAR(255) DEFAULT "",
                status INT DEFAULT 2 -- pending 
            )
        `);

        // SQL Query (Using Parameterized Queries to Prevent SQL Injection)
        const query = `INSERT INTO ${tableName} 
        (fullName, email, department, purpose, date, startTime, endTime, capacity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        let values = Object.values(body);
        // console.log({ values, query });
        await db.query(query, values);

        return NextResponse.json({ success: true });
    }
    catch (err) {
        return NextResponse.json({ message: error.message });
    }
}
export const PATCH = async (req) => {
    try {
        const db = await initSql()

        const url = new URL(req.url);  // Get the request URL
        const id = url.searchParams.get('id');  // Get the 'id' query parameter
        const { status, selectedRemarks: remarks } = await req.json();
        console.log({ id, status, remarks });

        const data = await db.query(
            `UPDATE ${tableName} SET status = ?, remarks = ? WHERE id = ?`,
            [status, remarks, id]
        );
        console.log(data);

        return NextResponse.json({ success: true });
    }
    catch (error) {
        return NextResponse.json({ message: error.message });
    }
}
