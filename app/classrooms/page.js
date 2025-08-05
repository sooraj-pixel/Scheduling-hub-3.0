'use client'
import { DeleteBtn, EditBtn } from '@/components/design/Icons'
import Layout from '@/components/design/Layout'
import ClassForm from '@/components/forms/ClassForm'
import Section from '@/components/Section'
import UploadButton from '@/components/UploadButton'
import { useUserRole } from '@/components/UserContext'
import { notFound } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import * as XLSX from "xlsx";

const Classrooms = () => {
    const { role } = useUserRole();
    // console.log(role);

    if (role !== 1) {
        return notFound(); // Triggers Next.js's built-in 404 page
    }
    const [scheduleInfo, setScheduleInfo] = useState([]);
    const [filteredSchedule, setFilteredSchedule] = useState([]); // Search
    const [columns, setColumns] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    let displayData;
    if (searchTerm) displayData = filteredSchedule;
    else displayData = scheduleInfo;

    const [selectedEntry, setSelectedEntry] = useState(null);  // Track the ID of the entry being edited 
    const [showForm, setShowForm] = useState(false);

    // Load schedules when page is loaded
    useEffect(() => {
        getClasses();
    }, []);

    // Search for all fields
    useEffect(() => {
        let lowerSearchTerm = searchTerm.toLowerCase();
        let updatedSchedule = scheduleInfo.filter(item =>
            Object.values(item).some(value =>
                value && value.toString().toLowerCase().includes(lowerSearchTerm)
            )
        );
        setFilteredSchedule(updatedSchedule);
    }, [searchTerm])

    const getClasses = async () => {
        const res = await fetch('/api/classrooms');
        const result = await res.json();
        // console.log(result);

        const data = result.data[0];
        const columnsData = result.columnsData[0];
        let modCols = columnsData.map(item => item.COLUMN_NAME);
        // console.log(modCols);

        setScheduleInfo(data);
        setColumns(modCols);
    }
    const editData = async (id) => {
        setShowForm(true);
        const itemToEdit = scheduleInfo.find(item => item.id === id);
        // console.log(itemToEdit);
        setSelectedEntry(itemToEdit);
    }
    const deleteEntry = async (id) => {
        let confirmDelete = confirm("Are you sure you want to delete this entry?\nThis action cannot be reversed.")
        if (confirmDelete) {
            await fetch(`/api/classrooms?id=${id}`, {
                method: 'DELETE',
            });
            getClasses();
        }
    }
    const deleteSchedule = async () => {
        let confirmDelete = confirm(`Are you sure you want to delete the schedule"?\nThis action cannot be reversed.`)
        if (confirmDelete) {
            await fetch(`/api/classrooms?deleteAll=true`, {
                method: 'DELETE',
            });
            getClasses();
        }
    }
    const downloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(displayData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Schedule");
        XLSX.writeFile(workbook, `classrooms.xlsx`);
    };
    return (
        <Layout>
            <Section title={"Classrooms Details"}>
                <div>
                    {/* Edit and Add Dialog */}
                    <ClassForm
                        selectedEntry={selectedEntry} setSelectedEntry={setSelectedEntry}
                        showForm={showForm} setShowForm={setShowForm}
                        getData={getClasses}
                    />

                    {/* Search and Download Excel & Add Entry buttons */}
                    <div className="flex-between mb-2">
                        <div className="relative">
                            <img className='absolute top-2 left-2' src="./svg/search.svg" alt="" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10 rounded-md "
                            />
                        </div>
                        <div className='flex gap-3'>
                            {role == 1 && <button onClick={() => setShowForm(!showForm)} className='btn-primary flex-center'>
                                <img src="./svg/plus.svg" alt="" />
                                Add Entry
                            </button>}
                            <button className="btn-primary flex" onClick={() => downloadExcel()}>
                                <img src="./svg/download.svg" alt="download icon" />
                                Excel
                            </button>
                        </div>
                    </div>

                    {role == 1 && <div className='flex justify-end mb-2'>
                        <DeleteBtn
                            text={`Delete`}
                            className={'btn-danger !text-white rounded-md px-3 py-1.5'}
                            onClickFunc={() => deleteSchedule()}
                        />
                    </div>}

                    {/* Table */}
                    <div className="overflow-scroll max-w-[70vw] max-h-[80vh]">
                        <table className="table-basic">
                            <thead>
                                <tr>
                                    {role == 1 && <th>Actions</th>}
                                    {columns.map((col, index) => (
                                        <th key={index}>{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {displayData?.length > 0 && displayData.map((item, idx) => (
                                    <tr key={idx} className='relative'>
                                        {role == 1 && <td className="flex gap-3">
                                            <EditBtn onClickFunc={() => editData(item.id)} />
                                            <DeleteBtn onClickFunc={() => deleteEntry(item.id)} />
                                        </td>}
                                        {columns.map((col, index) =>
                                            <td key={index}>{item[col]}</td>
                                        )}
                                    </tr>
                                ))}

                            </tbody>
                        </table>
                        {displayData?.length == 0 && <div className="mt-5 text-center text-lg">No data to display</div>}
                    </div>
                    {role == 1 && <UploadButton apiEndPoint={"classrooms"} getData={getClasses} />}
                </div>
            </Section>
        </Layout>
    )
}

export default Classrooms