'use client'
import { DeleteBtn, EditBtn } from '@/components/design/Icons'
import Layout from '@/components/design/Layout'
import Section from '@/components/Section'
import UploadButton from '@/components/UploadButton'
import React, { useEffect, useState } from 'react'
import * as XLSX from "xlsx";
import InstructorForm from '@/components/forms/InstructorForm'
import { useUserRole } from '@/components/UserContext'
import { notFound } from 'next/navigation'

const Instructors = () => {
    const { role } = useUserRole();

    if (role !== 1) {
        return notFound(); // Triggers Next.js's built-in 404 page
    }

    const [selectedTerm, setSelectedTerm] = useState("fall_2024");
    const [terms, setTerms] = useState([])
    const [scheduleInfo, setScheduleInfo] = useState([]);
    const [filteredSchedule, setFilteredSchedule] = useState([]); // Search
    const [filteredByTermSchedule, setFilteredByTermSchedule] = useState([]); // Term: winter, spring, fall
    const [columns, setColumns] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");

    let displayData;
    if (searchTerm) displayData = filteredSchedule;
    else if (filteredByTermSchedule.length > 0) displayData = filteredByTermSchedule;
    else displayData = scheduleInfo;

    const [selectedEntry, setSelectedEntry] = useState(null);  // Track the ID of the entry being edited 
    const [showForm, setShowForm] = useState(false);

    // Load schedules when page is loaded
    useEffect(() => {
        getInstructors();
    }, []);

    // Search for all fields
    useEffect(() => {
        let lowerSearchTerm = searchTerm.toLowerCase();
        let updatedSchedule = filteredByTermSchedule.filter(item =>
            Object.values(item).some(value =>
                value && value.toString().toLowerCase().includes(lowerSearchTerm)
            )
        );
        setFilteredSchedule(updatedSchedule);
    }, [searchTerm])

    // Selected term 
    useEffect(() => {
        let updatedSchedule = scheduleInfo.filter(item =>
            Object.values(item).some(value =>
                value && value.toString().toLowerCase().includes(selectedTerm)
            )
        );
        setFilteredByTermSchedule(updatedSchedule);
    }, [selectedTerm, scheduleInfo]);

    const getInstructors = async () => {
        const res = await fetch('/api/instructors');
        const result = await res.json();
        // console.log(result);

        const data = result.data[0];
        const columnsData = result.columnsData[0];
        let modCols = columnsData.map(item => item.COLUMN_NAME);
        // console.log(modCols); // Get column_name
        let termsData = result.terms;
        console.log(termsData);

        setScheduleInfo(data);
        setColumns(modCols);
        setTerms(termsData)
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
            await fetch(`/api/instructors?id=${id}`, {
                method: 'DELETE',
            });
            getInstructors();
        }
    }
    const deleteSchedule = async (selectedTerm) => {
        let confirmDelete = confirm(`Are you sure you want to delete the "${selectedTerm} schedule"?\nThis action cannot be reversed.`)
        if (confirmDelete) {
            await fetch(`/api/instructors?selectedTerm=${selectedTerm}`, {
                method: 'DELETE',
            });
            getInstructors();
        }
    }
    const downloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(displayData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Schedule");
        XLSX.writeFile(workbook, `instructors_${selectedTerm}.xlsx`);
    };

    return (
        <Layout>
            <Section title={"Instructors Details"}>
                <div>
                    {/* Heading and Schedule dropdown */}
                    <div className="flex-between mb-2">
                        <h2 className="h2">Winter 2025</h2>
                        <div>
                            <select className='input' value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>
                                {terms?.length > 0 && terms.map(term => (
                                    <option key={term} value={term}>{term}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {/* Search and Download Excel & Add Entry buttons */}
                    <div className="flex-between my-5">
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
                            <button onClick={() => setShowForm(!showForm)} className='btn-primary flex-center'>
                                <img src="./svg/plus.svg" alt="" />
                                Add Entry
                            </button>
                            <button className="btn-primary flex" onClick={() => downloadExcel()}>
                                <img src="./svg/download.svg" alt="download icon" />
                                Excel
                            </button>
                        </div>
                    </div>
                    <div className='flex justify-end mb-5'>
                        <DeleteBtn
                            text={`Delete`}
                            className="btn-danger !text-white rounded-md px-3 py-1.5"
                            onClickFunc={() => deleteSchedule(selectedTerm)}
                        />
                    </div>

                    {/* Edit and Add Dialog */}
                    <InstructorForm
                        selectedEntry={selectedEntry} setSelectedEntry={setSelectedEntry}
                        showForm={showForm} setShowForm={setShowForm}
                        getData={getInstructors}
                        selectedTerm={selectedTerm}
                    />

                    {/* Table */}
                    <div className="overflow-scroll max-w-[70vw] max-h-[80vh]">
                        <table className="table-basic">
                            <thead>
                                <tr>
                                    <th>Actions</th>
                                    {columns.map((col, index) => (
                                        <th key={index}>{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {displayData?.length > 0 && displayData.map((item, idx) => (
                                    <tr key={idx} className='relative'>
                                        <td className="flex gap-3">
                                            <EditBtn onClickFunc={() => editData(item.id)} />
                                            <DeleteBtn onClickFunc={() => deleteEntry(item.id)} />
                                        </td>
                                        {columns.map((col, index) =>
                                            <td key={index}>{item[col]}</td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {displayData?.length == 0 && <div className="mt-5 text-center text-lg">No data to display</div>}
                    </div>

                    <UploadButton apiEndPoint={"instructors"} getData={getInstructors} />
                </div>
            </Section>
        </Layout>
    )
}
export default Instructors