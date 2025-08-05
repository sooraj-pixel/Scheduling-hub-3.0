import initSql from "@/lib/db";
import { NextResponse } from "next/server";

const tableName = "master_schedule";

export const GET = async (req) => {
    try {
        const db = await initSql()

        // get all the data
        const query = `SELECT * FROM ${tableName}`;
        const data = await db.query(query);

        // get all the columns
        const getColumnsQuery = `SELECT COLUMN_NAME
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_NAME = '${tableName}';`;
        const columnsData = await db.query(getColumnsQuery);

        // get schedule term
        const [rows] = await db.execute(`SELECT DISTINCT schedule_term FROM ${tableName}`);
        const terms = rows.map(row => row.schedule_term);
        // console.log('terms: ', terms);

        return NextResponse.json({ data, columnsData,terms });
    }
    catch (err) {
        return NextResponse.json({ success: false, message: err.message });
    }
}
export const POST = async (req) => {
    try {
        const db = await initSql()

        const body = await req.json();
        // console.log(body);

        // Extract columns and values dynamically
        const columns = Object.keys(body).join(", ");
        // Extract columns and replace spaces with underscores
        const modColumns = Object.keys(body)
            .map(key => key.replace(/\s+/g, '_'))  // Replace spaces with underscores
            .join(", ");

        const values = Object.values(body);
        const placeholders = values.map(() => "?").join(", ");
        // console.log({ columns, values, placeholders });

        // Insert into MySQL
        const query = `INSERT INTO ${tableName} (${modColumns}) VALUES (${placeholders})`;
        await db.query(query, values)

        return NextResponse.json(data);
    }
    catch (err) {
        return NextResponse.json({ success: false, message: err.message });
    }
}
export const PUT = async (req) => {
    try {
        const db = await initSql()

        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        const body = await req.json();

        // Build the SQL update query dynamically based on the form data
        const fields = Object.keys(body);
        const values = Object.values(body);
        const setClause = fields.map(field => `${field} = ?`).join(', '); // Generate SET clause dynamically
        const query = `UPDATE ${tableName} SET ${setClause} WHERE id = ${id}`;
        // console.log({ fields, values, setClause, query });

        const result = await db.query(query, values);
        return NextResponse.json({ message: "Updated successfully" });
    }
    catch (err) {
        return NextResponse.json({ success: false, message: err.message });
    }
}
export const DELETE = async (req) => {
    try {
        const db = await initSql()

        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        const termToDelete = url.searchParams.get('selectedTerm');
        // console.log({ url, id, termToDelete });
        let data;

        // to delete one entry
        if (id) {
            const query = `DELETE FROM ${tableName} WHERE id=?`;
            data = await db.query(query, [id]); // should be in array format
        }
        // to delete one specific term schedule
        else if (termToDelete) {
            const query = `DELETE FROM ${tableName} WHERE schedule_term=?`;
            data = await db.query(query, [termToDelete]); // should be in array format
        }

        return NextResponse.json({ message: "Deleted successfully", data });
    }
    catch (err) {
        return NextResponse.json({ success: false, message: err.message });
    }
}

