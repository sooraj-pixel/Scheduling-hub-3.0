'use client'
import { DeleteBtn, EditBtn } from '@/components/design/Icons'
import Layout from '@/components/design/Layout'
import Section from '@/components/Section'
import UploadButton from '@/components/UploadButton'
import React, { useEffect, useState } from 'react'
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import ScheduleForm from '@/components/forms/ScheduleForm'
import { useUserRole } from '@/components/UserContext'
import { notFound } from 'next/navigation'

const Schedules = () => {
    const { role } = useUserRole()
    // console.log(role);

    if (role !== 1) {
        return notFound(); // Triggers Next.js's built-in 404 page
    }
    const [selectedTerm, setSelectedTerm] = useState("winter_2025");
    const [terms, setTerms] = useState([])
    const [scheduleInfo, setScheduleInfo] = useState([]);
    const [filteredSchedule, setFilteredSchedule] = useState([]); // Search
    const [filteredByTermSchedule, setFilteredByTermSchedule] = useState([]); // Term: winter, spring, fall
    const [columns, setColumns] = useState([]);

    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");


    const [searchTerm, setSearchTerm] = useState("");

    const [displayData, setDisplayData] = useState([]);
    // let displayData;
    useEffect(() => {
        if (searchTerm) setDisplayData(filteredSchedule);
        else if (filteredByTermSchedule.length > 0) setDisplayData(filteredByTermSchedule);
        else setDisplayData(scheduleInfo);
    }, [searchTerm, filteredByTermSchedule])



    const [visibleColumns, setVisibleColumns] = useState({});
    const [selectedEntry, setSelectedEntry] = useState(null);  // Track the ID of the entry being edited 
    const [showForm, setShowForm] = useState(false);

    const sortData = (column) => {
        let direction = "asc";
        console.log(column);

        if (sortColumn === column && sortDirection === "asc") {
            direction = "desc";
        }
        const sortKey = columns[column] || column;
        const sorted = [...displayData].sort((a, b) => {
            if (a[sortKey] < b[sortKey]) return direction === "asc" ? -1 : 1;
            if (a[sortKey] > b[sortKey]) return direction === "asc" ? 1 : -1;
            return 0;
        });
        console.log(sorted);

        setSortColumn(column);
        setSortDirection(direction);
        setDisplayData(sorted); // assuming displayData is a state you can set
    };

    // Load schedules and columns visibility when page is loaded
    useEffect(() => {
        const storedColumns = JSON.parse(localStorage.getItem("schedule_visibleCols"));
        // console.log(storedColumns);
        if (storedColumns) {
            setVisibleColumns(storedColumns);
        }
        getSchedule();
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

    // Selected term 
    useEffect(() => {
        let updatedSchedule = scheduleInfo.filter(item =>
            Object.values(item).some(value =>
                value && value.toString().toLowerCase().includes(selectedTerm)
            )
        );
        setFilteredByTermSchedule(updatedSchedule);
    }, [selectedTerm, scheduleInfo]);

    const getSchedule = async () => {
        const res = await fetch('/api/schedule');
        const result = await res.json();
        console.log(result);

        const data = result.data[0];
        const columnsData = result.columnsData[0];
        let modCols = columnsData.map(item => item.COLUMN_NAME);
        let termsData = result.terms;
        // console.log(modCols); // Get column_name
        // console.log(termsData);

        initVisibility(modCols);

        setScheduleInfo(data);
        setColumns(modCols);
        setTerms(termsData);
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
            await fetch(`/api/schedule?id=${id}`, {
                method: 'DELETE',
            });
            getSchedule();
        }
    }
    const deleteSchedule = async (selectedTerm) => {
        let confirmDelete = confirm(`Are you sure you want to delete the "${selectedTerm} schedule"?\nThis action cannot be reversed.`)
        if (confirmDelete) {
            await fetch(`/api/schedule?selectedTerm=${selectedTerm}`, {
                method: 'DELETE',
            });
            getSchedule();
        }
    }
    // Function to Export Data as Excel
    const downloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(displayData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Schedule");

        // Generate Excel file and trigger download
        XLSX.writeFile(workbook, `schedule_${selectedTerm}.xlsx`);
    };

    // Handle column visibility toggle
    const toggleColumnVisibility = (col) => {
        setVisibleColumns(prev => (
            { ...prev, [col]: !prev[col] }
        ));
    };

    // Initialize column visibility: Load from LS or default to true
    const initVisibility = (modCols) => {
        let storedVisibility = JSON.parse(localStorage.getItem('schedule_visibleCols'));

        // If no stored visibility, create default true values
        if (!storedVisibility || Object.keys(storedVisibility).length === 0) {
            storedVisibility = {};
            modCols.forEach(col => storedVisibility[col] = true);
            localStorage.setItem("schedule_visibleCols", JSON.stringify(storedVisibility));
        }
        setVisibleColumns(storedVisibility);
    }
    const saveVisibility = () => {
        localStorage.setItem("schedule_visibleCols", JSON.stringify(visibleColumns)); // Update LS immediately
    }
    return (
        <Layout>
            <Section title={"Master Schedule"}>
                <div>
                    {/* Heading and Schedule dropdown */}
                    <div className="flex-between mb-2">
                        <h2 className="h2 capitalize">{selectedTerm}</h2>
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

                    {/* Column Visibility Toggle Controls and Delete schedule button */}
                    <div className='relative'>
                        {/* Extract all the keys from the object and create an array of them => ['id', 'name', 'course', 'semester']*/}
                        <Sheet>
                            <SheetTrigger asChild>
                                <button className="btn-primary flex-center gap-1">
                                    <img src="./svg/eye.svg" alt="" />
                                    Hide/Unhide
                                </button>
                            </SheetTrigger>
                            <SheetContent className="overflow-auto p-0" aria-describedby={undefined}>
                                <SheetHeader>
                                    <SheetTitle className="px-5 pt-5">Select the columns to display</SheetTitle>
                                </SheetHeader>
                                <div className="mt-5 relative ">
                                    {Object.keys(visibleColumns).map(col => (
                                        <div className="flex items-center px-5" key={col}>
                                            <input
                                                checked={visibleColumns[col]}
                                                onChange={() => toggleColumnVisibility(col)}
                                                type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 focus:ring-2" />
                                            <label className="ms-2 text-sm font-medium text-gray-900">{col}</label>
                                        </div>
                                    ))}
                                </div>
                                <SheetFooter className={'sticky bottom-1 w-full'}>
                                    <SheetClose asChild>
                                        <Button className="w-full" type="submit" onClick={() => saveVisibility()}>Save changes</Button>
                                    </SheetClose>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>

                        {role == 1 && <DeleteBtn
                            text={`Delete`}
                            className="absolute top-0 right-0 gap-2 btn-danger !text-white rounded-md px-3 py-1.5"
                            onClickFunc={() => deleteSchedule(selectedTerm)}
                        />}
                    </div>

                    {/* Edit and Add Dialog */}
                    <ScheduleForm
                        selectedEntry={selectedEntry} setSelectedEntry={setSelectedEntry}
                        showForm={showForm} setShowForm={setShowForm}
                        getData={getSchedule}
                        selectedTerm={selectedTerm}
                    />

                    {/* Table */}
                    <div className="overflow-scroll max-w-[70vw] max-h-[80vh]">
                        <table className="table-basic">
                            <thead>
                                <tr>
                                    {role == 1 && <th>Actions</th>}
                                    {columns?.length > 0 && columns.map((col, index) => (
                                        visibleColumns[col] && (
                                            <th key={index} onClick={() => sortData(col)} className="cursor-pointer select-none">
                                                {col}
                                                {sortColumn === col && (
                                                    sortDirection === "asc" ? " ↑" : " ↓"
                                                )}
                                            </th>
                                        )))}
                                </tr>
                            </thead>
                            <tbody>
                                {displayData?.length > 0 && displayData?.length > 0 && displayData.map((item, idx) => (
                                    <tr key={idx} className='relative'>
                                        {role == 1 && <td className="flex gap-3">
                                            <EditBtn onClickFunc={() => editData(item.id)} />
                                            <DeleteBtn onClickFunc={() => deleteEntry(item.id)} />
                                        </td>}
                                        {columns.map((col, index) =>
                                            visibleColumns[col] && <td key={index}>{item[col]}</td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {displayData?.length == 0 && <div className="mt-5 text-center text-lg">No data to display</div>}
                    </div>

                    {role == 1 && <UploadButton apiEndPoint={"schedules"} getData={getSchedule} />}
                </div>
            </Section>
        </Layout>
    )
}
export default Schedules