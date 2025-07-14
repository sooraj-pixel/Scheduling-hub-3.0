// components/forms/InstructorForm.js
'use client';

import React, { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// InstructorForm component for adding or editing instructor details
const InstructorForm = ({
    currentInstructor, // Object containing current instructor details if in edit mode
    isEditing,         // Boolean, true if editing, false if adding new
    onClose,           // Callback function to close the form/modal
    onSuccess          // Callback function for successful submission (e.g., refresh list, close modal)
}) => {
    // State to manage form data
    const [formData, setFormData] = useState({
        name: '', // Instructor's full name
        email: '', // Instructor's email (often used as unique ID)
        phone_number: '', // Instructor's phone number
        department: '', // Instructor's department or program association
        credentials_qualifications: '', // Instructor's qualifications/credentials
    });

    // useEffect to populate form data when in editing mode or when currentInstructor changes
    useEffect(() => {
        if (isEditing && currentInstructor) {
            setFormData({
                name: currentInstructor.name || '',
                email: currentInstructor.email || '',
                phone_number: currentInstructor.phone_number || '',
                department: currentInstructor.department || '',
                credentials_qualifications: currentInstructor.credentials_qualifications || '',
            });
        } else {
            // Reset form for adding a new instructor
            setFormData({
                name: '',
                email: '',
                phone_number: '',
                department: '',
                credentials_qualifications: '',
            });
        }
    }, [isEditing, currentInstructor]);

    // Handler for input changes to update form data state
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Handler for form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Data to send to the API. Ensure it matches your backend expectations.
        const dataToSend = {
            ...formData,
            // If email is the unique identifier, you might pass it separately
            // or ensure your backend extracts it from formData.email
        };

        try {
            // Determine API URL and method based on whether we are editing or adding
            const url = isEditing ? `/api/instructors/?id=${currentInstructor.id}` : "/api/instructors";
            const method = isEditing ? "PUT" : "POST";

            console.log("Submitting instructor form data:", dataToSend);
            console.log("API URL:", url, "Method:", method);

            // Make the API call
            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSend),
            });

            // Check if the API call was successful
            if (res.ok) {
                console.log(`Instructor successfully ${isEditing ? 'updated' : 'added'}.`);
                onSuccess(); // Call the onSuccess callback to handle post-submission logic (e.g., close modal, refresh list)
            } else {
                const errorData = await res.json(); // Attempt to parse error message from response
                console.error(`Failed to ${isEditing ? 'update' : 'add'} instructor:`, errorData);
                // In a real app, you might show an alert or a toast message here
            }
        } catch (error) {
            console.error("Error submitting instructor form:", error);
            // In a real app, you might show a generic error message here
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                {/* Name Input */}
                <div className="flex flex-col">
                    <Label htmlFor="name" className="capitalize mb-1">Name</Label>
                    <Input
                        id="name"
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full"
                    />
                </div>

                {/* Email Input */}
                <div className="flex flex-col">
                    <Label htmlFor="email" className="capitalize mb-1">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full"
                        disabled={isEditing} // Prevent changing email when editing (if email is primary key)
                    />
                </div>

                {/* Phone Number Input */}
                <div className="flex flex-col">
                    <Label htmlFor="phone_number" className="capitalize mb-1">Phone Number</Label>
                    <Input
                        id="phone_number"
                        type="text"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        className="w-full"
                    />
                </div>

                {/* Department Input */}
                <div className="flex flex-col">
                    <Label htmlFor="department" className="capitalize mb-1">Department</Label>
                    <Input
                        id="department"
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full"
                    />
                </div>

                {/* Credentials and Qualifications Textarea */}
                <div className="flex flex-col md:col-span-2"> {/* Span both columns for larger input */}
                    <Label htmlFor="credentials_qualifications" className="capitalize mb-1">Credentials & Qualifications</Label>
                    <textarea
                        id="credentials_qualifications"
                        name="credentials_qualifications"
                        rows="4" // Set initial number of rows
                        value={formData.credentials_qualifications}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Form Action Buttons */}
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit">
                    {isEditing ? "Update Instructor" : "Add Instructor"}
                </Button>
            </div>
        </form>
    );
};

export default InstructorForm;
