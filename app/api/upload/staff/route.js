import initSql from "@/lib/db";
import { NextResponse } from "next/server"
import * as XLSX from 'xlsx';

// Define the table name for the database
const tableName = "staff_schedule";

// Ensure Next.js does not parse the request body automatically
// This is necessary for handling file uploads (formData)
export const config = {
    api: {
        bodyParser: false,
    },
};

/**
 * GET handler for fetching staff schedule data.
 * Retrieves all records from the staff_schedule table.
 */
export async function GET() {
    try {
        const db = await initSql(); // Initialize database connection

        // Select all columns from the staff_schedule table
        const [rows] = await db.query(`SELECT * FROM ${tableName}`);
        
        // Return the fetched rows as a JSON response
        return NextResponse.json(rows);
    }
    catch (error) {
        // Log the error for debugging purposes
        console.error("Error fetching data:", error);
        // Return an error response if something goes wrong
        return NextResponse.json({ message: 'Error fetching data', details: error.message }, { status: 500 });
    }
}

/**
 * POST handler for uploading and processing Excel/CSV schedule data.
 * This function handles:
 * 1. Dropping and recreating the staff_schedule table (for fresh data on each upload).
 * 2. Parsing the uploaded Excel or CSV file.
 * 3. Processing the data to include default times.
 * 4. Inserting the processed data into the database.
 */
export const POST = async (req) => {
    const db = await initSql(); // Initialize database connection
    try {
        const formData = await req.formData(); // Get form data from the request
        
        // Delete the existing table to ensure a clean slate for new data
        await db.query(`DROP TABLE IF EXISTS ${tableName}`);

        // Create the table with updated schema to include full datetime for start and end
        // 'start_date' and 'end_date' are now DATETIME to store both date and time
        const createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            week INT,
            team VARCHAR(255),
            day VARCHAR(10),
            start_date DATETIME,   -- Changed from DATE to DATETIME
            end_date DATETIME,     -- New column for end time
            name VARCHAR(255)
        )`;
        await db.query(createTableQuery);

        const file = formData.get("file"); // Get the uploaded file from form data
        if (!file) {
            return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        let processedData = [];
        const fileType = file.type; // e.g., "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" for XLSX, "text/csv" for CSV

        if (fileType === 'text/csv' || file.name.endsWith('.csv')) {
            // Process CSV file
            const workbook = XLSX.read(buffer, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 0 }); // header: 0 means first row is headers
            console.log("Raw JSON data from CSV (POST):", jsonData);
            processedData = processCsvData(jsonData); // Use new CSV processing function
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.endsWith('.xlsx')) {
            // Process XLSX file (existing logic)
            const workbook = XLSX.read(buffer, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // header: 1 means second row is data headers
            console.log("Raw JSON data from Excel (POST):", jsonData);
            processedData = processExcelData(jsonData); // Use existing Excel processing function
        } else {
            return NextResponse.json({ message: 'Unsupported file type. Please upload a .csv or .xlsx file.' }, { status: 400 });
        }
        
        console.log("Processed data for database insertion (POST):", processedData);

        // Define the SQL query for inserting data
        const query = `INSERT INTO ${tableName} (week, team, day, start_date, end_date, name)
            VALUES ?`;

        // Prepare values as an array of arrays, matching the table columns
        const values = processedData.map(rec => [
            rec.week,
            rec.team,
            rec.day,
            rec.start_date, // Use the full datetime string
            rec.end_date,   // Use the full datetime string
            rec.name
        ]);

        // Execute the batch insert query
        await db.query(query, [values]);

        return NextResponse.json({ success: true, message: "Schedule uploaded and processed successfully." });
    }
    catch (error) {
        console.error("Error processing file or inserting data:", error);
        return NextResponse.json({ message: 'Error processing file', details: error.message }, { status: 500 });
    }
}

/**
 * Converts an Excel serial date number to a JavaScript Date object.
 * Corrects for Excel's 1900 leap year bug.
 * @param {number} serial The Excel date serial number.
 * @returns {Date} A JavaScript Date object (in UTC).
 */
function excelDateToJSDate(serial) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // Dec 30, 1899, 00:00:00 UTC
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    let date = new Date(excelEpoch.getTime() + serial * millisecondsPerDay);

    // Correct for Excel's 1900 leap year bug (Excel treats 1900 as a leap year, which it wasn't)
    // Serial 60 corresponds to Feb 29, 1900. Dates after this need correction.
    if (serial > 60) {
        date = new Date(date.getTime() - millisecondsPerDay); // Subtract one day
    }
    return date; // This Date object is in UTC
}

/**
 * Processes raw JSON data from an Excel sheet into a structured schedule format.
 * Assigns default start and end times to each staff entry.
 * @param {Array<Array<any>>} rawData The raw JSON data from the Excel sheet (array of arrays).
 * @returns {Array<Object>} An array of formatted schedule records.
 */
const processExcelData = (rawData) => {
    const schedule = [];
    
    // Assuming the first row is headers and the second row contains week number and dates
    const headerRow = rawData[0]; // e.g., ['WEEK', 'Team', 'MON', 'TUE', ...]
    const dateRow = rawData[1];   // e.g., [1, undefined, 45663, 45664, ...]

    // Extract week number from the second row, first column
    const currentWeek = dateRow[0]; 

    // Map Excel column headers to their corresponding day strings and Excel serial dates
    const dayMapping = {};
    const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
    
    // Dynamically find column indices for MON, TUE, etc., from the first header row
    const monColIndex = headerRow.indexOf('MON');
    const tueColIndex = headerRow.indexOf('TUE');
    const wedColIndex = headerRow.indexOf('WED');
    const thuColIndex = headerRow.indexOf('THU');
    const friColIndex = headerRow.indexOf('FRI');

    // Populate dayMapping with JavaScript Date objects for each day, using Excel serial dates
    if (monColIndex !== -1 && typeof dateRow[monColIndex] === 'number') dayMapping.MON = excelDateToJSDate(dateRow[monColIndex]);
    if (tueColIndex !== -1 && typeof dateRow[tueColIndex] === 'number') dayMapping.TUE = excelDateToJSDate(dateRow[tueColIndex]);
    if (wedColIndex !== -1 && typeof dateRow[wedColIndex] === 'number') dayMapping.WED = excelDateToJSDate(dateRow[wedColIndex]);
    if (thuColIndex !== -1 && typeof dateRow[thuColIndex] === 'number') dayMapping.THU = excelDateToJSDate(dateRow[thuColIndex]);
    if (friColIndex !== -1 && typeof dateRow[friColIndex] === 'number') dayMapping.FRI = excelDateToJSDate(dateRow[friColIndex]);

    // Define default start and end times for onsite schedule (e.g., 9 AM to 5 PM)
    // These times are in UTC to avoid local timezone issues during storage and retrieval.
    const DEFAULT_START_HOUR_UTC = 9; 
    const DEFAULT_END_HOUR_UTC = 17; 

    let currentTeam = null; // To track the current team for multi-row entries

    // Process data rows starting from the third row (index 2)
    for (let i = 2; i < rawData.length; i++) {
        const row = rawData[i];
        // The team name is in the second column of the raw data (index 1)
        const teamInRow = row[1]; 
        
        // If a team value is provided, update currentTeam
        if (teamInRow && typeof teamInRow === 'string' && teamInRow.trim() !== '') {
            currentTeam = teamInRow.trim();
        }
        
        // Skip row if no team info is available (e.g., empty rows or header rows already processed)
        if (!currentTeam) continue;

        // Iterate through days of the week to extract staff names
        dayNames.forEach(day => {
            const colIndex = headerRow.indexOf(day); // Get the column index for the current day
            if (colIndex !== -1) {
                const staffName = row[colIndex]; // Get staff name from the corresponding column
                
                // If a staff name exists for this day and it's a non-empty string
                if (staffName && typeof staffName === 'string' && staffName.trim() !== '') {
                    const baseDate = dayMapping[day]; // Get the base Date object for this day
                    
                    if (baseDate) {
                        // Create start and end datetime objects by combining the base date with default times (UTC)
                        const startDate = new Date(baseDate);
                        startDate.setUTCHours(DEFAULT_START_HOUR_UTC, 0, 0, 0); // Set to 9:00 AM UTC

                        const endDate = new Date(baseDate);
                        endDate.setUTCHours(DEFAULT_END_HOUR_UTC, 0, 0, 0);   // Set to 5:00 PM UTC

                        // Ensure dates are valid before pushing
                        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                            console.error(`Invalid date generated for ${staffName} on ${day}. Skipping entry.`);
                            return; // Skip this entry if dates are invalid
                        }

                        // Add the formatted record to the schedule
                        schedule.push({
                            week: currentWeek,
                            team: currentTeam,
                            day: day,
                            start_date: startDate.toISOString(), 
                            end_date: endDate.toISOString(),     
                            name: staffName.trim()
                        });
                    } else {
                        console.warn(`Date mapping not found for day: ${day} in week: ${currentWeek}. Skipping staff: ${staffName}`);
                    }
                }
            }
        });
    }

    // The schedule array now contains the fully formatted data with full start_date and end_date
    return schedule;
};

/**
 * Processes raw JSON data from a CSV file into a structured schedule format.
 * Assigns default start and end times to each staff entry and handles multiple names.
 * @param {Array<Object>} rawData The raw JSON data from the CSV file (array of objects).
 * @returns {Array<Object>} An array of formatted schedule records.
 */
const processCsvData = (rawData) => {
    const schedule = [];
    const DEFAULT_START_HOUR_UTC = 9; 
    const DEFAULT_END_HOUR_UTC = 17; 

    rawData.forEach(row => {
        const { id, week, team, day, date, name } = row;

        // Basic validation for required fields
        if (!week || !team || !day || !date || !name) {
            console.warn(`Skipping CSV row due to missing required data: ${JSON.stringify(row)}`);
            return;
        }

        // Parse the date string from CSV (e.g., "2025-01-06")
        const baseDate = new Date(date); 
        if (isNaN(baseDate.getTime())) {
            console.warn(`Invalid date format in CSV for row: ${JSON.stringify(row)}. Skipping.`);
            return;
        }

        // Split multiple names if present (e.g., "Parth, Camille, Suba")
        const names = name.split(',').map(n => n.trim()).filter(n => n !== '');

        names.forEach(staffName => {
            const startDate = new Date(baseDate);
            startDate.setUTCHours(DEFAULT_START_HOUR_UTC, 0, 0, 0); // Set to 9:00 AM UTC

            const endDate = new Date(baseDate);
            endDate.setUTCHours(DEFAULT_END_HOUR_UTC, 0, 0, 0);   // Set to 5:00 PM UTC

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                console.error(`Invalid date generated for CSV entry: ${staffName} on ${date}. Skipping entry.`);
                return;
            }

            schedule.push({
                week: parseInt(week), // Ensure week is a number
                team: team,
                day: day,
                start_date: startDate.toISOString(), 
                end_date: endDate.toISOString(),     
                name: staffName
            });
        });
    });
    return schedule;
};
