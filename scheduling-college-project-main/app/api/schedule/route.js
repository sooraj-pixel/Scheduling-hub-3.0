// app/api/schedule/route.js
import initSql from "@/lib/db";
import { NextResponse } from 'next/server';

export async function GET(request) {
    let db;
    try {
        db = await initSql();
        const { searchParams } = new URL(request.url);
        const instructorEmail = searchParams.get('instructorName');

        if (!instructorEmail) {
            return NextResponse.json({ error: 'Instructor email is required' }, { status: 400 });
        }

        const [rows] = await db.query(
            `SELECT * FROM schedules WHERE instructor_email = ? ORDER BY start_date ASC, start_time ASC`,
            [instructorEmail]
        );

        return NextResponse.json({ data: rows }, { status: 200 });

    } catch (error) {
        console.error('Database or API error (GET):', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    } finally {
        // db.end() is intentionally omitted here to manage connection pooling via initSql
    }
}

export async function PUT(request) {
    let db;
    try {
        db = await initSql();
        
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id'); // Get ID from query parameter

        if (!id) {
            console.error("API PUT: ID is missing in query parameters.");
            return NextResponse.json({ message: 'Schedule ID is required for update' }, { status: 400 });
        }

        const body = await request.json();
        // console.log("API PUT: Received body for update:", body); // DEBUG LOG: Check incoming data

        // Destructure fields you expect to update
        // The PUT method is more dynamic, it only updates fields that are present in the body and match DB columns.
        // So, keeping a comprehensive destructure here is fine, as long as it's not explicitly used to build a static query.
        const {
            schedule_term, s_no, session, program, intake_id, semester, term,
            group_name, block_id, code, course_name, campus, delivery, room_no,
            credits, hours_paid_for_the_class, hours, enrolment_in_class,
            start_date, end_date, days, start_time, end_time, draft,
            schedule_draft, instructor, instructor_email, program_manager,
            capacity, additional_capacity, campus_address_code,
            credentails_and_qulaifications
        } = body;

        // Construct the SET clause for the UPDATE query dynamically
        const updateFields = [];
        const updateValues = [];

        // Add fields to update only if they are provided in the body and correspond to DB columns
        if (schedule_term !== undefined) { updateFields.push('schedule_term = ?'); updateValues.push(schedule_term); }
        if (s_no !== undefined) { updateFields.push('s_no = ?'); updateValues.push(s_no); } // Only if s_no is editable
        if (session !== undefined) { updateFields.push('session = ?'); updateValues.push(session); }
        if (program !== undefined) { updateFields.push('program = ?'); updateValues.push(program); }
        if (intake_id !== undefined) { updateFields.push('intake_id = ?'); updateValues.push(intake_id); }
        if (semester !== undefined) { updateFields.push('semester = ?'); updateValues.push(semester); }
        if (term !== undefined) { updateFields.push('term = ?'); updateValues.push(term); }
        if (group_name !== undefined) { updateFields.push('group_name = ?'); updateValues.push(group_name); }
        if (block_id !== undefined) { updateFields.push('block_id = ?'); updateValues.push(block_id); }
        if (code !== undefined) { updateFields.push('code = ?'); updateValues.push(code); }
        if (course_name !== undefined) { updateFields.push('course_name = ?'); updateValues.push(course_name); }
        if (campus !== undefined) { updateFields.push('campus = ?'); updateValues.push(campus); }
        if (delivery !== undefined) { updateFields.push('delivery = ?'); updateValues.push(delivery); }
        if (room_no !== undefined) { updateFields.push('room_no = ?'); updateValues.push(room_no); }
        if (credits !== undefined) { updateFields.push('credits = ?'); updateValues.push(credits); }
        if (hours_paid_for_the_class !== undefined) { updateFields.push('hours_paid = ?'); updateValues.push(hours_paid_for_the_class); }
        if (hours !== undefined) { updateFields.push('hours = ?'); updateValues.push(hours); }
        if (enrolment_in_class !== undefined) { updateFields.push('final_enrolment = ?'); updateValues.push(enrolment_in_class); }

        if (start_date !== undefined) { updateFields.push('start_date = ?'); updateValues.push(start_date); }
        if (end_date !== undefined) { updateFields.push('end_date = ?'); updateValues.push(end_date); }
        if (days !== undefined) { updateFields.push('days = ?'); updateValues.push(days); }
        if (start_time !== undefined) { updateFields.push('start_time = ?'); updateValues.push(start_time); }
        if (end_time !== undefined) { updateFields.push('end_time = ?'); updateValues.push(end_time); }

        if (draft !== undefined) { updateFields.push('draft = ?'); updateValues.push(draft); }
        if (schedule_draft !== undefined) { updateFields.push('schedule_draft = ?'); updateValues.push(schedule_draft); }
        if (instructor !== undefined) { updateFields.push('instructor = ?'); updateValues.push(instructor); }
        if (instructor_email !== undefined) { updateFields.push('instructor_email = ?'); updateValues.push(instructor_email); }
        if (program_manager !== undefined) { updateFields.push('program_manager = ?'); updateValues.push(program_manager); }
        if (capacity !== undefined) { updateFields.push('capacity = ?'); updateValues.push(capacity); }
        if (additional_capacity !== undefined) { updateFields.push('additional_capacity = ?'); updateValues.push(additional_capacity); }
        if (campus_address_code !== undefined) { updateFields.push('campus_address_code = ?'); updateValues.push(campus_address_code); }
        if (credentails_and_qulaifications !== undefined) { updateFields.push('credentials_qualifications = ?'); updateValues.push(credentails_and_qulaifications); }

        if (updateFields.length === 0) {
            return NextResponse.json({ message: 'No fields provided for update' }, { status: 400 });
        }

        const query = `UPDATE schedules SET ${updateFields.join(', ')} WHERE id = ?`;
        updateValues.push(id); // Add ID to the end of values for WHERE clause

        const [result] = await db.query(query, updateValues);

        if (result.affectedRows === 0) {
            console.warn(`API PUT: No rows affected for ID: ${id}. Schedule might not exist or no changes were made.`);
            return NextResponse.json({ message: 'No schedule found with that ID or no changes applied' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Schedule updated successfully', result: result }, { status: 200 });

    } catch (error) {
        console.error('Database or API error (PUT):', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    } finally {
        // db.end() is intentionally omitted here to manage connection pooling via initSql
    }
}

export async function DELETE(request) {
    let db;
    try {
        db = await initSql();
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ message: 'Schedule ID is required for deletion' }, { status: 400 });
        }

        const [result] = await db.query(
            `DELETE FROM schedules WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: 'No schedule found with that ID' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Schedule deleted successfully', result: result }, { status: 200 });

    } catch (error) {
        console.error('Database or API error (DELETE):', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    } finally {
        // db.end() is intentionally omitted here to manage connection pooling via initSql
    }
}

export async function POST(request) {
    let db;
    try {
        db = await initSql();
        const body = await request.json();
        console.log("API POST: Received body for insert:", body); // DEBUG: Log received body

        // Destructure only the fields that are intended for insertion into 'schedules' table
        const {
            schedule_term = null, // User confirmed this exists and is needed
            block_id = null,      // User confirmed this exists and is needed
            course_name = null,
            start_date = null,
            end_date = null,
            start_time = null,
            end_time = null,
            instructor = null,
            instructor_email = null,
            // All other fields like s_no, session, program, etc. are intentionally excluded
            // from this destructuring and the INSERT query.
            // If they are provided by the frontend, they will be ignored for this INSERT.
        } = body;

        // Define column names and their corresponding values in the correct order for INSERT
        const columns = [
            'schedule_term', 'block_id', 'course_name',
            'start_date', 'end_date', 'start_time', 'end_time',
            'instructor', 'instructor_email'
        ];

        const values = [
            schedule_term, block_id, course_name,
            start_date, end_date, start_time, end_time,
            instructor, instructor_email
        ];

        const placeholders = columns.map(() => '?').join(', ');
        const query = `INSERT INTO schedules (${columns.join(', ')}) VALUES (${placeholders})`;

        console.log("API POST: Executing SQL query:", query); // DEBUG: Log query string
        console.log("API POST: Values for insert:", values); // DEBUG: Log values array

        const [result] = await db.query(query, values);
        console.log("API POST: Database insert result:", result); // DEBUG: Log DB response

        // Return a successful response for the frontend
        return NextResponse.json({ message: 'Schedule added successfully', id: result.insertId }, { status: 201 });

    } catch (error) {
        console.error('Database or API error (POST):', error); // DEBUG: Log full error
        // Return a more informative error message to the frontend
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    } finally {
        // db.end() is intentionally omitted here to manage connection pooling via initSql
    }
}
