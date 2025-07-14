'use client'
import Layout from '@/components/design/Layout'
import Section from '@/components/Section'
import React, { useEffect, useState } from 'react'
import UploadButton from '@/components/UploadButton'
import { useUserRole } from '@/components/UserContext'
import { notFound } from 'next/navigation'

const Staff = () => {
    const { role } = useUserRole()
    const [scheduleByWeek, setScheduleByWeek] = useState([]);

    if (role != 1) {
        return notFound(); // Triggers Next.js's built-in 404 page
    }
    useEffect(() => {
        getSchedule()
    }, []);

    const getSchedule = async () => {
        const res = await fetch("/api/upload/staff")
        const result = await res.json()

        console.log(result);
        // console.log(groupedByWeek);
        // console.log(groupByDate(result));

        let byweek = groupByDate(result)
        setScheduleByWeek(byweek)
    }
    const groupByDate = (data) => {
        return data.reduce((acc, item) => {
            const dateKey = item.date.split("T")[0]; // Extract YYYY-MM-DD
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(item);
            return acc;
        }, {});
    };
    return (
        <Layout>
            <Section title={"On-site staff schedule"}>
                {role == 1 && <UploadButton apiEndPoint={"staff"} getData={getSchedule} />}

                <div className=" p-4">
                    {Object.entries(scheduleByWeek).map(([date, schedules]) => {
                        // Ensure correct UTC parsing
                        const [year, month, day] = date.split("-").map(Number);
                        const dayName = new Date(Date.UTC(year, month, day - 2)).toLocaleDateString("en-US", { weekday: "long", });
                        return (
                            <div key={date} className="bg-white shadow-md rounded-lg p-6">
                                <h2 className="text-xl font-bold mb-4">
                                    Date: {date} ({dayName})
                                </h2>

                                <table className="table-basic">
                                    <thead>
                                        <tr className="text-left">
                                            <th>Team</th>
                                            <th>Names</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schedules.map(schedule => (
                                            <tr key={schedule.id}>
                                                <td>{schedule.team}</td>
                                                <td>{schedule.name}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    })}
                </div>
            </Section>
        </Layout>
    )
}

export default Staff