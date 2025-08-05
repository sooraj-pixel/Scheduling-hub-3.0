'use client'
import AnnounceContent from '@/components/AnnounceContent'
import Layout from '@/components/design/Layout'
import Section from '@/components/Section'
import { useUserRole } from '@/components/UserContext'
import React, { useEffect, useState } from 'react'

const Dashboard = () => {
    const [date, setDate] = useState(new Date())
    const { role, email } = useUserRole();

    const [schedule, setSchedule] = useState([]);
    const [columns, setColumns] = useState([]);

    const [count, setCount] = useState({
        Classes: 0,
        Instructors: 0,
        ResetRequests: 0,
    })
    const iconMap = {
        Classes: "./navbar/classroom.svg",
        Instructors: "./navbar/instructor.svg",
        ResetRequests: "./svg/lock.svg",
    };

    useEffect(() => {
        // console.log(role);
        if (role == 1) getCount()
        else if (role == 2) getSchedule()
    }, [role])

    const getCount = async () => {
        // console.log(role);
        const res = await fetch('/api/infoCount')
        const data = await res.json()
        // console.log(data);
        setCount(data)
    }
    // For instructors only
    const getSchedule = async () => {
        const res = await fetch('/api/schedule/instructor/?email=' + email)
        const result = await res.json();
        const scheduleData = result.data[0];
        const columnsData = result.columns[0];
        let modCols = columnsData.map(item => item.COLUMN_NAME);

        // console.log(result);
        // console.log({ scheduleData, columnsData });
        setSchedule(scheduleData);
        setColumns(modCols);
    }
    return (
        <Layout>
            <Section title={'Dashboard'}>
                <div className='flex justify-center flex-col '>
                    <div className='font-semibold text-lg my-5'>Date: {date.toDateString()}</div>

                    {/* Overview cards */}
                    {role == 1 && <div className='flex gap-10 mb-5'>
                        {Object.entries(count).map(([key, value]) => (
                            <div key={key} className="flex-between w-56 rounded-md bg-gray-100 shadow-md px-5 py-4 hover:bg-gray-200 transition cursor-pointer">
                                <div>
                                    <h3 className='text-xl'>{key}</h3>
                                    <span className='text-2xl font-semibold'>{value}</span>
                                </div>
                                <img src={iconMap[key] || "/icons/default.svg"} width={35} alt={key} />
                            </div>
                        ))}
                    </div>}

                    {/* Instructor Schedule */}
                    {role == 2 &&
                        <div className="overflow-scroll max-w-[70vw] max-h-[80vh]">
                            <h2 className="h2">My Schedule</h2>
                            <table className="table-basic">
                                <thead>
                                    <tr>
                                        {columns.map((col, index) => (
                                            <th key={index}>{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedule?.length > 0 && schedule.map((item, idx) => (
                                        <tr key={idx}>
                                            {columns.map((col, index) =>
                                                <td key={index}>{item[col]}</td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {schedule?.length == 0 && <div className="mt-5 text-center text-lg">No data to display</div>}
                        </div>
                    }
                    <AnnounceContent className='!p-0' hideUsername={true} />
                </div>
            </Section>
        </Layout>
    )
}

export default Dashboard