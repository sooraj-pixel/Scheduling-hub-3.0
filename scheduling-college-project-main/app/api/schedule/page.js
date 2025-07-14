

import initSql from "@/lib/db"; // IMPORTANT: Using your existing DB connection utility
import { NextResponse } from 'next/server'; // Import NextResponse for App Router APIs

export async function GET(request) { // Use 'request' instead of 'req' for App Router
    let db; // Declare db connection variable outside try block
    try {
        db = await initSql(); // Get database connection from your central utility

        // Get instructorEmail from the URL's search parameters.
        const { searchParams } = new URL(request.url);
        const instructorEmail = searchParams.get('instructorName'); // This will contain the email ID

        if (!instructorEmail) {
            return NextResponse.json({ error: 'Instructor email is required' }, { status: 400 });
        }

        // --- FIX: Corrected the column name to 'instructor_email' ---
        // Query to fetch schedules for a specific instructor from the 'schedules' table.
        // Using the EXACT column name 'instructor_email' from your 'schedules' table.
        const [rows] = await db.query( // Using db.query from initSql
            `SELECT * FROM schedules WHERE instructor_email = ? ORDER BY start_date ASC, start_time ASC`,
            [instructorEmail]
        );

        return NextResponse.json({ data: rows }, { status: 200 });

    } catch (error) {
        console.error('Database or API error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    } finally {
        // --- FIX: Removing db.end() from here ---
        // If initSql() returns a shared connection or manages a connection pool,
        // calling db.end() in every request's finally block will prematurely close the connection/pool.
        // The connection should only be ended when the application completely shuts down.
        // Assuming initSql provides a persistent pool or singleton connection, this line is removed.
        // if (db && typeof db.end === 'function') {
        //     db.end();
        // }
    }
}
