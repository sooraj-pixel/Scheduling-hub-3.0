/* eslint-disable react-hooks/rules-of-hooks */
'use client';
import { DeleteBtn, EditBtn } from '@/components/design/icons';
import Layout from '@/components/design/Layout';
import ClassForm from '@/components/forms/ClassForm';
import Section from '@/components/Section';
import UploadButton from '@/components/UploadButton';
import { useUserRole } from '@/components/UserContext';
import { notFound, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

const Classrooms = () => {
    const { role } = useUserRole();
    const router = useRouter();

    if (role !== 1) {
        return notFound();
    }

    const [scheduleInfo, setScheduleInfo] = useState([]);
    const [filteredSchedule, setFilteredSchedule] = useState([]);
    const [columns, setColumns] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const displayData = searchTerm ? filteredSchedule : scheduleInfo;

    useEffect(() => {
        getClasses();
    }, []);

    useEffect(() => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const updatedSchedule = scheduleInfo.filter((item) =>
            Object.values(item).some(
                (value) =>
                    value && value.toString().toLowerCase().includes(lowerSearchTerm)
            )
        );
        setFilteredSchedule(updatedSchedule);
    }, [searchTerm]);

    const getClasses = async () => {
        const res = await fetch('/api/classrooms');
        const result = await res.json();
        const data = result.data[0];
        const columnsData = result.columnsData[0];
        const modCols = columnsData.map((item) => item.COLUMN_NAME);
        setScheduleInfo(data);
        setColumns(modCols);
    };

    const editData = (id) => {
        setShowForm(true);
        const itemToEdit = scheduleInfo.find((item) => item.id === id);
        setSelectedEntry(itemToEdit);
    };

    const deleteEntry = async (id) => {
        const confirmDelete = confirm(
            'Are you sure you want to delete this entry?\nThis action cannot be reversed.'
        );
        if (confirmDelete) {
            await fetch(`/api/classrooms?id=${id}`, {
                method: 'DELETE',
            });
            getClasses();
        }
    };

    const deleteSchedule = async () => {
        const confirmDelete = confirm(
            'Are you sure you want to delete the schedule?\nThis action cannot be reversed.'
        );
        if (confirmDelete) {
            await fetch(`/api/classrooms?deleteAll=true`, {
                method: 'DELETE',
            });
            getClasses();
        }
    };

    const downloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(displayData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedule');
        XLSX.writeFile(workbook, `classrooms.xlsx`);
    };

    return (
        <Layout>
            <Section title={'Classrooms Details'}>
                <div>
                    {/* Form */}
                    <ClassForm
                        selectedEntry={selectedEntry}
                        setSelectedEntry={setSelectedEntry}
                        showForm={showForm}
                        setShowForm={setShowForm}
                        getData={getClasses}
                    />

                    {/* Search & Top Buttons */}
                    <div className="flex-between mb-2">
                        <div className="relative">
                            <img
                                className="absolute top-2 left-2"
                                src="./svg/search.svg"
                                alt="search"
                            />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 rounded-md"
                            />
                        </div>

                        {role === 1 && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowForm(!showForm)}
                                    className="btn-primary flex-center"
                                >
                                    Add Entry
                                </button>

                                <button
                                    onClick={() => {
                                        console.log('Schedule View Clicked');
                                        // router.push('/schedule-view'); // Enable if you create a schedule-view page
                                    }}
                                    className="border border-gray-300 rounded-md px-4 py-2 bg-white text-black hover:bg-gray-100 transition"
                                >
                                    Schedule View
                                </button>

                                <button
                                    className="btn-primary flex"
                                    onClick={downloadExcel}
                                >
                                    Excel
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Delete All Button */}
                    {role === 1 && (
                        <div className="flex justify-end mb-2">
                            <DeleteBtn
                                text={`Delete`}
                                className={'btn-danger !text-white rounded-md px-3 py-1.5'}
                                onClickFunc={deleteSchedule}
                            />
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-scroll max-w-[70vw] max-h-[80vh]">
                        <table className="table-basic">
                            <thead>
                                <tr>
                                    {role === 1 && <th>Actions</th>}
                                    {columns.map((col, index) => (
                                        <th key={index}>{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {displayData?.length > 0 ? (
                                    displayData.map((item, idx) => (
                                        <tr key={idx} className="relative">
                                            {role === 1 && (
                                                <td className="flex gap-3">
                                                    <EditBtn onClickFunc={() => editData(item.id)} />
                                                    <DeleteBtn onClickFunc={() => deleteEntry(item.id)} />
                                                </td>
                                            )}
                                            {columns.map((col, index) => (
                                                <td key={index}>{item[col]}</td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={columns.length + 1}
                                            className="text-center py-4"
                                        >
                                            No data to display
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Upload */}
                    {role === 1 && (
                        <UploadButton apiEndPoint={'classrooms'} getData={getClasses} />
                    )}
                </div>
            </Section>
        </Layout>
    );
};

export default Classrooms;
