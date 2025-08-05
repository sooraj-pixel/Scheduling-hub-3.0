import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";


export async function GET() {
    try {
        // const body = await req.json()
        // console.log({ body, req, params });

        // Folder where the academic files are saved
        const directoryPath = path.join(process.cwd(), "public/uploads/academic_files");
        console.log(directoryPath);

        // Get all the files in the folder
        const files = fs.readdirSync(directoryPath);

        const fileData = files.map(file => {
            // const ext = path.extname(file); // need to same for both POST and GET request
            const ext = file.split('.')[1]
            // console.log(ext);
            return {
                name: file,
                type: ext || "",
            };
        })
        console.log(fileData);
        return NextResponse.json(fileData);
    }
    catch (error) {
        return NextResponse.json({ error: "Failed to read files", details: error.message }, { status: 500 });
    }
}
export async function DELETE(req) {
    try {
        const { name } = await req.json();
        console.log(name);

        if (!name) {
            return NextResponse.json({ error: "File name is required" }, { status: 400 });
        }

        const filePath = path.join(process.cwd(), "public/uploads/academic_files", name); // Construct file path
        console.log(filePath);

        // File not found in the folder 404
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }
        fs.unlinkSync(filePath); // Delete the file

        return NextResponse.json({ message: "File deleted successfully" });
    }
    catch (error) {
        return NextResponse.json({ error: "Failed to delete file", details: error.message }, { status: 500 });
    }
}