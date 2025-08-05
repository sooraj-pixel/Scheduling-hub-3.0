import { useState } from "react";

const UploadButton = ({
    apiEndPoint,
    getData,
}) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState('');
    // const [scheduleTerm, setScheduleTerm] = useState("" || st);

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
            alert("no file selected");
            return;
        }
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("filename", selectedFileName);

        const res = await fetch(`/api/upload/${apiEndPoint}`, {
            method: "POST",
            body: formData,
        });
        if (res.ok) {
            getData();
            alert("File Uploaded Successfully!");
        }
        setSelectedFile(null);
        setSelectedFileName("");
    };
    return (
        <div className="mt-10 w-full md:!w-1/3">
            <h3 className="h3">Upload New File</h3>
            <label className="flex-center flex-col h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 my-3">
                <img src="./svg/upload.svg" alt="" />
                <p className="mb-1 text-gray-500 font-semibold ">Click to upload</p>
                <p className="text-xs text-gray-500">
                    .xlsx (Excel file only)
                </p>
                <input type="file" hidden
                    onChange={e => handleFileChange(e)} />
            </label>
            {selectedFile
                ? <div>{selectedFileName}</div>
                : <div>No file selected</div>
            }
            <button className="btn-primary mt-5 w-full" onClick={() => uploadFile()}>
                Submit
            </button>
        </div>
    )
}

export default UploadButton