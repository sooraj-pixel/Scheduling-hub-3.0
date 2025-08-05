import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import initSql from "@/lib/db";

// Ensure Next.js does not parse the request body automatically
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
        console.log(file);

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }
        // Convert file to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes)

        // Current working directroy (CWD) join with "uploads"
        const uploadDir = path.join(process.cwd(), "public/uploads/academic_files");

        // Ensure the directory exists
        await fs.mkdir(uploadDir, { recursive: true });
        const filepath = path.join(uploadDir, file.name);

        // Copy file to the uploads folder
        await fs.writeFile(filepath, buffer); // filepath, image binary data 

        // Get file type
        const ext = file.name.split('.')[1]
        // console.log(ext);

        return NextResponse.json({
            message: "Schedule uploaded successfully",
            file: {
                name: file.name,
                type: ext
            },
        });
    }
    catch (error) {
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
