'use client'
import FileTypeIcon from '@/components/design/FileTypeIcon'
import { DeleteBtn } from '@/components/design/Icons'
import Layout from '@/components/design/Layout'
import Section from '@/components/Section'
import UploadButton from '@/components/UploadButton'
import { useUserRole } from '@/components/UserContext'
import React, { useEffect, useState } from 'react'

const AcademicFiles = () => {
    const { username, role } = useUserRole();
    const [uploadedFiles, setUploadedFiles] = useState([]); // array of strings (containing file info (name and type))

    const getFiles = async () => {
        const res = await fetch('/api/academicFiles')
        const data = await res.json()
        // console.log(data);
        // console.log(`./uploads/academic_files/details.xlsx`);
        setUploadedFiles(data)
    }
    const deleteFile = async (fileName) => {
        const res = await fetch("/api/academicFiles", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: fileName }),
        });
        const data = await res.json();
        // console.log(data);
        getFiles(); // refresh the file useState
    }
    useEffect(() => {
        getFiles()
    }, [])

    useEffect(() => {
        console.log(uploadedFiles);
    }, [uploadedFiles])

    return (
        <Layout>
            <Section title={"Academic Files"}>
                {role == 1 && <UploadButton
                    apiEndPoint={'academicFiles'}
                    getData={getFiles}
                />}
                <h3 className="h3 mt-10 mb-5">Existing Files</h3>
                <div className="flex gap-7 flex-col">
                    {uploadedFiles?.length > 0 && uploadedFiles.map((file, idx) => (
                        <div className="flex-between" key={idx}>
                            <div className="flex items-center gap-3">
                                <FileTypeIcon fileType={file?.type} />
                                {file?.name}
                            </div>
                            <div className='flex gap-2'>
                                {role == 1 && <DeleteBtn onClickFunc={() => deleteFile(file.name)} bg={true} />}
                                <a href={`./uploads/academic_files/${file.name}`} className='btn-primary'>
                                    <img src="./svg/download.svg" alt="download icon" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
                {uploadedFiles.length == 0 && <div>No file </div>}
            </Section>
        </Layout>
    )
}

export default AcademicFiles