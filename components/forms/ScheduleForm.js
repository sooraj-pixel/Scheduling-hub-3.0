'use client';
import { useEffect, useState } from "react";

const ScheduleForm = ({
    selectedEntry: existingEntry,
    setSelectedEntry: setExistingEntry,
    showForm,
    setShowForm,
    getData,
    selectedTerm
}) => {
    const [formData, setFormData] = useState(existingEntry || {
        schedule_term: selectedTerm,
        s_no: "",
        session: "",
        program: "",
        intake_id: "",
        semester: "",
        term: "",
        group_name: "",
        block_id: "",
        code: "",
        course_name: "",
        campus: "",
        delivery: "",
        room_no: "",
        credits: "",
        hours_paid_for_the_class: "",
        hours: "",
        enrolment_in_class: "",
        start_date: "",
        end_date: "",
        days: "",
        start_time: "",
        end_time: "",
        draft: "",
        schedule_draft: "",
        instructor: "",
        instructor_email_id: "",
        program_manager: "",
        capacity: "",
        additional_capacity: "",
        campus_address_code: "",
        credentails_and_qulaifications: "",
    });
    // console.log(existingEntry);

    // To load schedule term
    useEffect(() => {
        if (!existingEntry) { // Only update for new entries
            setFormData(prev => ({
                ...prev,
                schedule_term: selectedTerm,
            }));
        }
    }, [selectedTerm]);

    // If existingEntry is passed, update formData
    useEffect(() => {
        if (existingEntry) {
            setFormData({
                schedule_term: existingEntry.schedule_term || selectedTerm,
                session: existingEntry.session || "",
                program: existingEntry.program || "",
                intake_id: existingEntry.intake_id || "",
                semester: existingEntry.semester || "",
                term: existingEntry.term || "",
                group_name: existingEntry.group_name || "",
                block_id: existingEntry.block_id || "",
                code: existingEntry.code || "",
                course_name: existingEntry.course_name || "",
                campus: existingEntry.campus || "",
                delivery: existingEntry.delivery || "",
                room_no: existingEntry.room_no || "",
                credits: existingEntry.credits || "",
                hours_paid_for_the_class: existingEntry.hours_paid_for_the_class || "",
                hours: existingEntry.hours || "",
                enrolment_in_class: existingEntry.enrolment_in_class || "",
                start_date: existingEntry.start_date || "",
                end_date: existingEntry.end_date || "",
                days: existingEntry.days || "",
                start_time: existingEntry.start_time || "",
                end_time: existingEntry.end_time || "",
                draft: existingEntry.draft || "",
                schedule_draft: existingEntry.schedule_draft || "",
                instructor: existingEntry.instructor || "",
                instructor_email_id: existingEntry.instructor_email_id || "",
                program_manager: existingEntry.program_manager || "",
                capacity: existingEntry.capacity || "",
                additional_capacity: existingEntry.additional_capacity || "",
                campus_address_code: existingEntry.campus_address_code || "",
                credentails_and_qulaifications: existingEntry.credentails_and_qulaifications || "",
            });
        }
        // console.log({ existingEntry });
    }, [existingEntry]);
    // console.log(formData);


    const handleChange = (e) => {
        const { name, value } = e.target;
        // console.log(e.target);
        // console.log(name, value);

        setFormData((prevData) => {
            // console.log(prevData); // It should log the previous state correctly
            return {
                ...prevData,
                [name]: value,
            };
        });
    };
    const resetForm = () => {
        setExistingEntry(null);
        setFormData({
            s_no: "",
            session: "",
            program: "",
            intake_id: "",
            semester: "",
            term: "",
            group_name: "",
            block_id: "",
            code: "",
            course_name: "",
            campus: "",
            delivery: "",
            room_no: "",
            credits: "",
            hours_paid_for_the_class: "",
            hours: "",
            enrolment_in_class: "",
            start_date: "",
            end_date: "",
            days: "",
            start_time: "",
            end_time: "",
            draft: "",
            schedule_draft: "",
            instructor: "",
            instructor_email_id: "",
            program_manager: "",
            capacity: "",
            additional_capacity: "",
            campus_address_code: "",
            credentails_and_qulaifications: "",
        });
    }
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent page refresh
        // console.log(formData);

        try {
            const url = existingEntry ? `/api/schedule/?id=${existingEntry.id}` : "/api/schedule"
            const method = existingEntry ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (res.ok && method == 'POST') {
                alert("Successfully added.")
            }
            else if (res.ok && method == 'PUT') {
                alert("Successfully Updated.")
            }
            // const result = await res.json();
            // console.log("Success:", result);

            getData(); // get the updated changes
            setShowForm(false);
            resetForm();

        } catch (error) {
            console.error("Error:", error);
        }
    };


    return (
        <div className={`${showForm ? 'fixed' : 'hidden'} top-0 left-0 overflow-auto w-screen h-screen flex items-center justify-center z-10`}>
            {/* Overlay Background */}
            <div className="absolute bg-black opacity-50 w-full h-full" onClick={() => setShowForm(false)} />

            {/* Modal form */}
            <div className="relative bg-white rounded-lg overflow-auto h-[80vh] shadow-lg w-full max-w-3xl z-10">
                <h2 className="h2 text-center mt-10">
                    {existingEntry ? 'Edit the data' : 'Add new Data'}
                </h2>
                <form onSubmit={e => handleSubmit(e)}>
                    <div className="grid grid-cols-2 gap-5 py-6 px-10">
                        {Object.keys(formData).map((key) => (
                            <div key={key} className="flex flex-col">
                                <label className="capitalize">{key.replace(/_/g, " ")}</label>
                                <input
                                    type={
                                        key.includes("date") ? "date" :
                                            key.includes("time") ? "time" :
                                                key.includes("email") ? "email" :
                                                    "text"
                                    }
                                    name={key}
                                    required
                                    value={formData[key]} onChange={e => handleChange(e)}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex-between px-10 gap-2 sticky bottom-0 left-0 bg-gray-200  p-5">
                        <button type="button" onClick={() => resetForm()} className="sticky bottom-0 left-0 btn-default">Clear</button>
                        <button type="submit" className="btn-primary ">Submit</button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default ScheduleForm;
