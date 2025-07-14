'use client';

import React, { useEffect, useState } from 'react';
import { useUserRole } from '@/components/UserContext'; // Assuming your UserContext provides userName and role

const InstructorScheduleDisplay = () => {
    const { userName, role } = useUserRole(); // Get user info from context

    // Add this console.log for debugging what the component receives
    console.log("InstructorScheduleDisplay: Current user context:", { userName, role });

    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInstructorSchedules = async () => {
            // Check if userName (which is now instructor's email) is available
            if (!userName) {
                setLoading(false);
                console.warn("InstructorScheduleDisplay: No user email found to fetch schedules.");
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Encode the instructorName (which is email) for URL
                const encodedInstructorEmail = encodeURIComponent(userName);
                // CRITICAL: Updated fetch URL to match app/api/schedule/instructor/route.js
                const res = await fetch(`/api/schedule/instructor?instructorName=${encodedInstructorEmail}`);

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
                }

                const result = await res.json();
                setSchedules(result.data);
            } catch (err) {
                console.error("InstructorScheduleDisplay: Failed to fetch schedules:", err);
                setError("Failed to load schedules. Please check your network or try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchInstructorSchedules();
    }, [userName]); // Re-fetch if userName (email) changes

    // Basic Tailwind CSS classes for consistent styling
    const tableHeaderClass = "px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
    const tableCellClass = "px-4 py-2 whitespace-nowrap text-sm text-gray-900";

    if (loading) {
        return <div className="text-center py-4 text-gray-600">Loading your schedules...</div>;
    }

    if (error) {
        return <div className="text-center py-4 text-red-600">Error: {error}</div>;
    }

    // Assuming role 2 is for instructors, adjust as per your UserContext logic
    // This component should ideally only be rendered for instructors, but this check adds robustness.
    if (role !== 2) {
         return <div className="text-center py-4 text-gray-600">You do not have permission to view this section.</div>;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md mt-5">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Assigned Schedules</h2>

            {schedules.length === 0 ? (
                <p className="text-gray-600">No schedules assigned to you at this time.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className={tableHeaderClass}>Start Date</th>
                                <th scope="col" className={tableHeaderClass}>End Date</th>
                                <th scope="col" className={tableHeaderClass}>Days</th>
                                <th scope="col" className={tableHeaderClass}>Start Time</th>
                                <th scope="col" className={tableHeaderClass}>End Time</th>
                                <th scope="col" className={tableHeaderClass}>Campus Address</th>
                                <th scope="col" className={tableHeaderClass}>Program</th>
                                <th scope="col" className={tableHeaderClass}>Course Name</th>
                                {/* You can add 'instructor email' if you want to display it here too */}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {schedules.map((schedule, index) => (
                                <tr key={schedule.id || index}>{/* Removed extra whitespace here */}
                                    {/* Format dates if they are date objects or strings that can be parsed */}
                                    <td className={tableCellClass}>{schedule.start_date ? new Date(schedule.start_date).toLocaleDateString() : 'N/A'}</td>
                                    <td className={tableCellClass}>{schedule.end_date ? new Date(schedule.end_date).toLocaleDateString() : 'N/A'}</td>
                                    <td className={tableCellClass}>{schedule.days || 'N/A'}</td>
                                    <td className={tableCellClass}>{schedule.start_time || 'N/A'}</td>
                                    <td className={tableCellClass}>{schedule.end_time || 'N/A'}</td>
                                    <td className={tableCellClass}>{schedule.campus_address || 'N/A'}</td>
                                    <td className={tableCellClass}>{schedule.program || 'N/A'}</td>
                                    <td className={tableCellClass}>{schedule.course_name || 'N/A'}</td>
                                    {/* <td className={tableCellClass}>{schedule.instructor_email || 'N/A'}</td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default InstructorScheduleDisplay;
