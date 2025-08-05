import { NextResponse } from "next/server";
import * as XLSX from 'xlsx';
import initSql from "@/lib/db";

const tableName = "instructors";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const POST = async (req) => {
  const db = await initSql();

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const fileNameRaw = formData.get('filename') || "unknown_term.xlsx";
    const fileName = fileNameRaw.split('.xlsx')[0].toLowerCase().replace(/\s+/g, '_');

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const headers = raw[0].map(h => h.toString().trim().replace(/[\s.&]/g, "_").toLowerCase());
    const rows = raw.slice(1);

    const jsonData = rows
      .filter(row => row.some(cell => cell !== undefined && cell !== null && cell !== ''))
      .map(row => {
        const entry = {};
        headers.forEach((h, i) => {
          entry[h] = row[i];
        });
        return entry;
      });

    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json({ error: "Excel file contains no data" }, { status: 400 });
    }

    // Optional: add schedule_term if needed
    jsonData.forEach(row => {
      row.schedule_term = fileName;
    });

    const columns = Object.keys(jsonData[0]);

    const columnDefinitions = columns.map(col => `\`${col}\` TEXT`).join(", ");
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ${columnDefinitions}
      );
    `;
    await db.query(createTableQuery);

    for (const row of jsonData) {
      const values = columns.map(col =>
        row[col] !== undefined && row[col] !== null
          ? `'${row[col].toString().replace(/'/g, "''")}'`
          : 'NULL'
      ).join(", ");

      const insertQuery = `
        INSERT INTO ${tableName} (${columns.join(', ')})
        VALUES (${values})
      `;
      await db.query(insertQuery);
    }

    return NextResponse.json({ success: true, columns });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
