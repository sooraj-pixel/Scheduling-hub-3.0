// app/api/schedule/instructor/route.js

import initSql from "@/lib/db"; // IMPORTANT: Using your existing DB connection utility
import { NextResponse } from 'next/server'; // Import NextResponse for App Router APIs

export async function GET(request) { // Use 'request' instead of 'req' for App Router
    let db; // Declare db connection variable outside try block
    try {
        db = await initSql(); // Get database connection from your central utility

        // Get instructorEmail from the URL's search parameters.
        // We're keeping the parameter name 'instructorName' for frontend consistency,
        // but it now expects the instructor's email ID.
        const { searchParams } = new URL(request.url);
        const instructorEmail = searchParams.get('instructorName'); // This will contain the email ID

        if (!instructorEmail) {
            return NextResponse.json({ error: 'Instructor email is required' }, { status: 400 });
        }

        // --- FINAL CRITICAL UPDATE: Filtering by 'instructor email' column ---
        // Query to fetch schedules for a specific instructor from the 'schedules' table.
        // Using the EXACT column name 'instructor email' from your 'schedules' table,
        // enclosed in backticks because it contains a space.
        // Ordering by start_date and start_time for a logical schedule display.
        const [rows] = await db.query( // Using db.query from initSql
            `SELECT * FROM schedules WHERE \`instructor email\` = ? ORDER BY start_date ASC, start_time ASC`,
            [instructorEmail]
        );

        return NextResponse.json({ data: rows }, { status: 200 });

    } catch (error) {
        console.error('Database or API error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    } finally {
        if (db) {
            // If your initSql returns a direct connection, you might need to close it.
            // If it manages a connection pool, db.end() might not be necessary or could be harmful.
            // Check your @/lib/db implementation. For mysql2/promise, connection.end() is usually needed.
            // Assuming initSql provides a connection that needs to be ended for a direct connection,
            // otherwise, you might remove this line if it's a persistent pool.
            if (typeof db.end === 'function') {
                db.end();
            }
        }
    }
}
