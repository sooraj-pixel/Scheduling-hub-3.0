'use client'

import React, { useEffect, useState } from 'react';
import AnnounceContent from '@/components/AnnounceContent';
import Layout from '@/components/design/Layout'; // Assuming this is your main layout wrapper
import Section from '@/components/Section';
import { useUserRole } from '@/components/UserContext';
// Removed InstructorScheduleDisplay import as it will now be exclusively on /schedule page
// import InstructorScheduleDisplay from '@/components/InstructorScheduleDisplay';

const Dashboard = () => {
    const [date, setDate] = useState(new Date());
    const { role, userName } = useUserRole(); // Destructure userName here as well, needed for context

    // These states related to schedule fetching are no longer needed here if InstructorScheduleDisplay is removed
    // const [schedule, setSchedule] = useState();
    // const [columns, setColumns] = useState([]);

    const [count, setCount] = useState({
        Classes: 0,
        Instructors: 0,
        ResetRequests: 0,
    });

    const iconMap = {
        Classes: "./navbar/classroom.svg",
        Instructors: "./navbar/instructor.svg",
        ResetRequests: "./svg/lock.svg",
    };

    // Assuming role 1 is admin, fetch counts
    useEffect(() => {
        if (role === 1) {
            getCount();
        }
    }, [role]);

    const getCount = async () => {
        try {
            const res = await fetch('/api/infoCount');
            if (!res.ok) throw new Error('Failed to fetch counts');
            const data = await res.json();
            setCount(data);
        } catch (error) {
            console.error("Error fetching counts:", error);
        }
    };


    return (
        <Layout>
            <Section>
                <h1 className="text-3xl font-bold mb-4 text-gray-800">Dashboard</h1>
                <p className="text-lg text-gray-600 mb-6">Date : {date.toDateString()}</p>

                {/* Conditional rendering for Admin overview cards */}
                {role === 1 && (
                    <div className='flex gap-10 mb-5'>
                        {Object.entries(count).map(([key, value]) => (
                            <div key={key} className="flex-between w-56 rounded-md bg-gray-100 shadow-md px-5 py-4 hover:bg-gray-200 transition cursor-pointer">
                                <div>
                                    <h3 className='text-xl'>{key}</h3>
                                    <span className='text-2xl font-semibold'>{value}</span>
                                </div>
                                <img src={iconMap[key] || "/icons/default.svg"} width={35} alt={key} />
                            </div>
                        ))}
                    </div>
                )}

                {/* The InstructorScheduleDisplay component is REMOVED from here
                    It will now only be rendered on the /schedule page via app/schedule/page.js
                */}
                {/* {role === 2 && <InstructorScheduleDisplay />} */}


                <div className="mt-8 pt-8 border-t border-gray-200"> {/* Separator for announcements */}
                    <AnnounceContent className="p-0" buttons={role === 1} /> {/* Adjust props as needed */}
                </div>

                {/* You can add other dashboard content here as needed */}
            </Section>
        </Layout>
    );
};

export default Dashboard;
