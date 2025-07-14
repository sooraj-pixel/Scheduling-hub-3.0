import initSql from "@/lib/db";
import { NextResponse } from "next/server"
import * as XLSX from 'xlsx';

const tableName = "staff_schedule";

// Ensure Next.js does not parse the request body automatically
export const config = {
    api: {
        bodyParser: false,
    },
};

export async function GET() {
    try {
        const db = await initSql();

        const [rows] = await db.query(`SELECT * FROM ${tableName}`);
        return NextResponse.json(rows);
        // return NextResponse.json({ success: true });
    }
    catch (error) {
        return NextResponse.json({ message: 'Error fetching data' }, { status: 500 });
    }
}

export const POST = async (req) => {
    const db = await initSql();
    try {
        const formData = await req.formData();
        // console.log(formData);

        // delete table
        await db.query(`DROP TABLE IF EXISTS ${tableName}`);

        // create table
        const createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            week INT,
            team VARCHAR(255),
            day VARCHAR(10),
            date DATE, 
            name VARCHAR(255)
        )`;
        await db.query(createTableQuery);

        const file = formData.get("file");
        // console.log(file);

        // Convert file to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes)

        // Read the Excel file and convert it to JSON
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0]; // Get first sheet
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet); // Convert to JSON
        console.log(jsonData);

        // Call the function
        const processedData = processExcelData(jsonData);
        // console.log(processedData);


        const query = `INSERT INTO ${tableName} (week, team, day, date, name)
            VALUES ?`;

        // Prepare values as an array of arrays
        const values = processedData.map(rec => [
            rec.week,
            rec.team,
            rec.day,
            rec.date,
            rec.name
        ]);
        await db.query(query, [values]);

        return NextResponse.json({ success: true });
    }
    catch (error) {
        return NextResponse.json({ error: error.message });
    }
}
function excelDateToJSDate(serial) {
    // Excel incorrectly treats 1900 as a leap year.
    // 25569 is the number of days between Jan 1, 1900 and Jan 1, 1970.
    const excelLeapYearCorrection = 0;
    const utcDays = serial - 25569 - excelLeapYearCorrection;
    const utcValue = utcDays * 86400; // seconds per day
    return new Date(utcValue * 1000);
}
const processExcelData = (rawData) => {
    const schedule = [];
    let currentWeek = null;

    for (let i = 1; i < rawData.length; i++) {
        const row = rawData[i];

        // Detect a new week (since weeks are stored in the `__EMPTY` key)
        if (typeof row["__EMPTY"] === "number") {
            currentWeek = row["__EMPTY"]; // Store the week number
            continue; // Move to next row
        }

        // If row contains a team (found in `__EMPTY_1`)
        if (row["__EMPTY_1"]) {
            let team = row["__EMPTY_1"];
            let teamMembers = {
                week: currentWeek,
                team: team,
                days: { MON: [], TUE: [], WED: [], THU: [], FRI: [] }
            };

            // Assign names to respective days
            if (row["Mirvish - Winter 2025 Onsite Schedule"]) teamMembers.days.MON.push(row["Mirvish - Winter 2025 Onsite Schedule"]);
            if (row["__EMPTY_2"]) teamMembers.days.TUE.push(row["__EMPTY_2"]);
            if (row["__EMPTY_3"]) teamMembers.days.WED.push(row["__EMPTY_3"]);
            if (row["__EMPTY_4"]) teamMembers.days.THU.push(row["__EMPTY_4"]);
            if (row["__EMPTY_5"]) teamMembers.days.FRI.push(row["__EMPTY_5"]);

            schedule.push(teamMembers);
        } else {
            // If there is no `__EMPTY_1`, it means this row is a continuation of the previous team
            let lastEntry = schedule[schedule.length - 1];

            if (lastEntry) {
                if (row["Mirvish - Winter 2025 Onsite Schedule"]) lastEntry.days.MON.push(row["Mirvish - Winter 2025 Onsite Schedule"]);
                if (row["__EMPTY_2"]) lastEntry.days.TUE.push(row["__EMPTY_2"]);
                if (row["__EMPTY_3"]) lastEntry.days.WED.push(row["__EMPTY_3"]);
                if (row["__EMPTY_4"]) lastEntry.days.THU.push(row["__EMPTY_4"]);
                if (row["__EMPTY_5"]) lastEntry.days.FRI.push(row["__EMPTY_5"]);
            }
        }
    }
    // Convert to SQL insert format
    const formattedSchedule = [];
    schedule.forEach((entry) => {
        Object.entries(entry.days).forEach(([day, names]) => {
            if (names.length > 0) {
                formattedSchedule.push({
                    week: entry.week,
                    team: entry.team,
                    day,
                    date: convertExcelDate(entry.week, day), // Convert Excel serial to Date
                    name: names.join(", ") // Join multiple names with commas
                });
            }
        });
    });

    return formattedSchedule;
};
// Convert Excel serial number to date
const convertExcelDate = (weekNumber, day) => {
    // Example: Suppose week 1 starts on Monday, Jan 1, 2025 (You may need to adjust this)
    const baseDate = new Date("2025-01-06");
    const dayOffsets = { MON: 0, TUE: 1, WED: 2, THU: 3, FRI: 4 };

    return new Date(baseDate.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000 + dayOffsets[day] * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]; // Format YYYY-MM-DD
};


const rawData = [
    {
        __EMPTY: 'WEEK',
        __EMPTY_1: 'Team',
        'Mirvish - Winter 2025 Onsite Schedule': 'MON',
        __EMPTY_2: 'TUE',
        __EMPTY_3: 'WED',
        __EMPTY_4: 'THU',
        __EMPTY_5: 'FRI'
    },
    {
        __EMPTY: 1,
        'Mirvish - Winter 2025 Onsite Schedule': 45663,
        __EMPTY_2: 45664,
        __EMPTY_3: 45665,
        __EMPTY_4: 45666,
        __EMPTY_5: 45667
    },
    {
        __EMPTY_1: 'Academics',
        'Mirvish - Winter 2025 Onsite Schedule': 'Parth',
        __EMPTY_2: 'Shakeeni',
        __EMPTY_3: 'Shakeeni',
        __EMPTY_4: 'Hania ',
        __EMPTY_5: 'Parth'
    },
    {
        'Mirvish - Winter 2025 Onsite Schedule': 'Camille',
        __EMPTY_2: 'Hania ',
        __EMPTY_3: 'Jasdeep',
        __EMPTY_4: 'Nima',
        __EMPTY_5: 'Danielle'
    },
    {
        'Mirvish - Winter 2025 Onsite Schedule': 'Suba ',
        __EMPTY_2: 'Nima',
        __EMPTY_3: 'Suba',
        __EMPTY_4: 'Camille',
        __EMPTY_5: 'Jasdeep'
    },
    {
        'Mirvish - Winter 2025 Onsite Schedule': 'Mahmood',
        __EMPTY_2: 'Danielle',
        __EMPTY_3: 'Mahmood',
        __EMPTY_4: 'Tony'
    },
    { __EMPTY_2: 'Tony' },
    {
        __EMPTY_1: 'Library',
        __EMPTY_3: 'Kristine',
        __EMPTY_4: 'Kristine'
    },
    {
        __EMPTY_1: 'Advisor',
        'Mirvish - Winter 2025 Onsite Schedule': 'Vi',
        __EMPTY_2: 'Priyanka',
        __EMPTY_3: 'Shivanka',
        __EMPTY_4: 'Huma',
        __EMPTY_5: 'Neha'
    },
    { __EMPTY_1: 'Mentor' },
    {
        __EMPTY_1: 'AA',
        'Mirvish - Winter 2025 Onsite Schedule': 'Amandeep PM Shift'
    }
];


// working code for week 1 only

// // Get header rows
// const headerRow = rawData[0];
// const dateRow = rawData[1];
// const week = dateRow.__EMPTY; // Week number

// // Prepare a mapping of day to Excel serial date converted to JS Date
// const dayMapping = {
//     MON: excelDateToJSDate(dateRow['Mirvish - Winter 2025 Onsite Schedule']),
//     TUE: excelDateToJSDate(dateRow.__EMPTY_2),
//     WED: excelDateToJSDate(dateRow.__EMPTY_3),
//     THU: excelDateToJSDate(dateRow.__EMPTY_4),
//     FRI: excelDateToJSDate(dateRow.__EMPTY_5)
// };
// // Initialize an object to group data by team and day
// const groupedData = {}; // { team: { MON: [], TUE: [], ... } }

// let currentTeam = null;

// // Process each data row starting from index 2
// for (let i = 2; i < rawData.length; i++) {
//     const row = rawData[i];

//     // If a team value is provided in __EMPTY_1, update currentTeam.
//     if (row.__EMPTY_1) {
//         currentTeam = row.__EMPTY_1.trim();
//     }
//     // Skip row if no team info is available.
//     if (!currentTeam) continue;

//     // Initialize grouping for team if it doesn't exist.
//     if (!groupedData[currentTeam]) {
//         groupedData[currentTeam] = { MON: [], TUE: [], WED: [], THU: [], FRI: [] };
//     }

//     // For each day column, if there is a value, add it to the array.
//     if (row['Mirvish - Winter 2025 Onsite Schedule']) {
//         groupedData[currentTeam].MON.push(row['Mirvish - Winter 2025 Onsite Schedule'].trim());
//     }
//     if (row.__EMPTY_2) {
//         groupedData[currentTeam].TUE.push(row.__EMPTY_2.trim());
//     }
//     if (row.__EMPTY_3) {
//         groupedData[currentTeam].WED.push(row.__EMPTY_3.trim());
//     }
//     if (row.__EMPTY_4) {
//         groupedData[currentTeam].THU.push(row.__EMPTY_4.trim());
//     }
//     if (row.__EMPTY_5) {
//         groupedData[currentTeam].FRI.push(row.__EMPTY_5.trim());
//     }
// }

// // Now, prepare records to insert into the database.
// // Each record is: { week, team, day, date, name } where "name" is a comma-separated list.
// const records = [];
// for (const team in groupedData) {
//     const days = groupedData[team];
//     for (const day in days) {
//         // Skip if there are no names for that day.
//         if (days[day].length === 0) continue;
//         records.push({
//             week: week,
//             team: team,
//             day: day,
//             date: dayMapping[day].toISOString().split('T')[0], // Format as YYYY-MM-DD
//             name: days[day].join(", ")
//         });
//     }
// }

// console.log(records);