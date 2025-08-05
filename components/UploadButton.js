import { useState } from "react";

const UploadButton = ({ apiEndPoint, getData }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState("");

    // Handle file selection
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setSelectedFileName(file.name);
        }
    };

    // Handle file upload
    const uploadFile = async () => {
        if (!selectedFile) {
            alert("No file selected");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("filename", selectedFileName);

        try {
            const res = await fetch(`/api/upload/${apiEndPoint}`, {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                getData();
                alert("File Uploaded Successfully!");
            } else {
                const err = await res.json();
                alert(`Upload failed: ${err.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("An error occurred while uploading the file.");
        }

        setSelectedFile(null);
        setSelectedFileName("");
    };

    return (
        <div className="mt-10 w-full md:!w-1/3">
            <h3 className="h3">Upload New File</h3>
            <div className="flex-center flex-col h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 my-3">
                <label htmlFor="fileUpload" className="flex-center flex-col w-full h-full cursor-pointer">
                    <img src="./svg/upload.svg" alt="Upload Icon" />
                    <p className="mb-1 text-gray-500 font-semibold">Click to upload</p>
                    <p className="text-xs text-gray-500">.xlsx (Excel file only)</p>
                </label>
                <input
                    id="fileUpload"
                    type="file"
                    accept=".xlsx"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />
            </div>
            {selectedFile
                ? <div className="text-sm text-gray-700">{selectedFileName}</div>
                : <div className="text-sm text-gray-500">No file selected</div>
            }
            <button className="btn-primary mt-5 w-full" onClick={uploadFile}>
                Submit
            </button>
        </div>
    );
};

export default UploadButton;
