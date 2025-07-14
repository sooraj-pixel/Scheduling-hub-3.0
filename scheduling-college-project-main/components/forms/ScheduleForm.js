// components/forms/ScheduleForm.js
'use client';

import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import moment from "moment"; // Ensure moment is available for date formatting

const ScheduleForm = ({
    currentSchedule, // Object containing current schedule details (REQUIRED for this version)
    isEditing,         // Boolean, true if viewing an existing schedule (should always be true for this component now)
    onClose,           // Callback function to close the modal
    onSuccess          // This callback is no longer relevant for this read-only component
}) => {
    // DEBUG LOGS: Trace props received by ScheduleForm
    console.log("ScheduleForm rendered (Strictly Read-Only). isEditing prop:", isEditing);
    console.log("ScheduleForm rendered. currentSchedule prop:", currentSchedule);

    // State to manage form data - this will now only be used to populate the read-only view
    const [formData, setFormData] = useState(() => {
        if (currentSchedule) { // Always expect currentSchedule for this component's purpose
            return {
                ...currentSchedule,
                start_date: currentSchedule.start_date ? moment(currentSchedule.start_date).format('YYYY-MM-DD') : '',
                end_date: currentSchedule.end_date ? moment(currentSchedule.end_date).format('YYYY-MM-DD') : '',
                start_time: currentSchedule.start_time || '',
                end_time: currentSchedule.end_time || '',
                instructor_email: currentSchedule.instructor_email || currentSchedule.instructor_email_id || "",
            };
        }
        return {}; // Return empty object if no currentSchedule, though it implies error
    });

    // useEffect to re-populate form data if currentSchedule changes
    useEffect(() => {
        console.log("ScheduleForm useEffect triggered. currentSchedule:", currentSchedule);
        if (currentSchedule) {
            setFormData({
                ...currentSchedule,
                start_date: currentSchedule.start_date ? moment(currentSchedule.start_date).format('YYYY-MM-DD') : '',
                end_date: currentSchedule.end_date ? moment(currentSchedule.end_date).format('YYYY-MM-DD') : '',
                start_time: currentSchedule.start_time || '',
                end_time: currentSchedule.end_time || '',
                instructor_email: currentSchedule.instructor_email || currentSchedule.instructor_email_id || "",
            });
        }
    }, [currentSchedule]);

    // Since this component is now strictly read-only, handleChange and handleSubmit are removed
    // from this component. Any editing or adding logic will be handled elsewhere (e.g., admin view)
    // or not at all for instructors as per the new requirement.

    // Determine which fields to display: Iterate over formData keys for existing data
    const fieldsToDisplay = Object.keys(formData); 

    return (
        <div className="p-4 space-y-4"> {/* Removed form tag as no submission */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                {/* Render Read-Only Details View */}
                {fieldsToDisplay.map((key) => {
                    // Exclude internal fields or fields that should not be displayed
                    if (key === 'id' || key === '__v') return null;

                    const value = formData[key];

                    // Only display if value is not null, undefined, or empty string
                    if (value === null || value === undefined || String(value).trim() === '') {
                        return null;
                    }

                    // Map backend column names to more user-friendly labels
                    let displayLabel = key.replace(/_/g, " ");
                    if (key === 'hours_paid') displayLabel = 'Hours Paid';
                    if (key === 'final_enrolment') displayLabel = 'Enrolment in Class';
                    if (key === 'credentials_qualifications') displayLabel = 'Credentials & Qualifications';
                    if (key === 'instructor_email') displayLabel = 'Instructor Email';


                    return (
                        <div key={key} className="flex flex-col">
                            <Label className="capitalize mb-1">
                                {displayLabel}:
                            </Label>
                            <div className="p-2 text-gray-800 break-words font-medium bg-gray-50 rounded-md">
                                {/* Format dates/times for display */}
                                {key.includes('date') && value ? moment(value).format('MMMM D, YYYY') :
                                 key.includes('time') && value ? moment(value, 'HH:mm:ss').format('h:mm A') :
                                 value}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Form Action Buttons - Only "Close" button for read-only view */}
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
                <Button type="button" onClick={onClose}>
                    Close
                </Button>
            </div>
        </div>
    );
};

export default ScheduleForm;
