
## Login code for OAuth
````
{session ? (
                <div>
                    <p>Welcome, {session.user?.name}!</p>
                    <button onClick={() => signOut()} className='btn-default'>Sign Out</button>
                </div>
            ) : (
                <button onClick={() => signIn("azure-ad")}>Sign In with Microsoft</button>
            )}

````

## Code for displaying schedules table data (not dynamic)
````


// s_no: true,
        // session: true,
        // program: true,
        // intakeId: true,
        // course: true,
        // semester: true,
        // name: true,
        // term: true,
        // group: true,
        // code: true,
        // campus: true,
        // delivery: true,
        // roomNo: true,
        // credits: true,
        // hoursPaid: true,
        // hours: true,
        // finalEnrolment: true,
        // startDate: true,
        // endDate: true,
        // draftSchedule: true,
        // instructor: true,
        // instructorEmail: true,
        // programManager: true,
        // capacity: true,
        // additionalCapacity: true,
        // campusAddressCode: true,
        // remarks: true,
        // credentialsAndQualifications: true,


        
  {/* <tr>
                                    {visibleColumns.s_no && <th>S_No</th>}
                                    {visibleColumns.session && <th>Session</th>}
                                    {visibleColumns.program && <th>Program</th>}
                                    {visibleColumns.intakeId && <th>Intake Id</th>}
                                    {visibleColumns.semester && <th>Semester</th>}
                                    {visibleColumns.term && <th>Term</th>}
                                    {visibleColumns.group && <th>Group</th>}
                                    {visibleColumns.code && <th>Code</th>}
                                    {visibleColumns.course && <th>Course_Name</th>}
                                    {visibleColumns.campus && <th>Campus</th>}
                                    {visibleColumns.delivery && <th>Delivery</th>}
                                    {visibleColumns.roomNo && <th>Room No.</th>}
                                    {visibleColumns.credits && <th>Credits</th>}
                                    {visibleColumns.hoursPaid && <th>Hours Paid</th>}
                                    {visibleColumns.hours && <th>Hours</th>}
                                    {visibleColumns.finalEnrolment && <th>Final Enrolment</th>}
                                    {visibleColumns.startDate && <th>Start Date</th>}
                                    {visibleColumns.endDate && <th>End Date</th>}
                                    {visibleColumns.draftSchedule && <th>Draft Schedule</th>}
                                    {visibleColumns.instructor && <th>Instructor</th>}
                                    {visibleColumns.instructorEmail && <th>Instructor Email</th>}
                                    {visibleColumns.programManager && <th>Program Manager</th>}
                                    {visibleColumns.capacity && <th>Capacity</th>}
                                    {visibleColumns.additionalCapacity && <th>Additional Capacity</th>}
                                    {visibleColumns.campusAddressCode && <th>Campus Address Code</th>}
                                    {visibleColumns.remarks && <th>Remarks</th>}
                                    {visibleColumns.credentialsAndQualifications && <th>Credentials & Qualifications</th>}
                                    <th>Actions</th>
                                </tr> */}


// <tr key={idx}>
                                    //     {/* {columns} */}
                                    //     {visibleColumns.s_no && <td>{item.s_no}</td>}
                                    //     {visibleColumns.session && <td>{item.session}</td>}
                                    //     {visibleColumns.program && <td>{item.program}</td>}
                                    //     {visibleColumns.intakeId && <td>{item.intake_id}</td>}
                                    //     {visibleColumns.semester && <td>{item.semester}</td>}
                                    //     {visibleColumns.term && <td>{item.term}</td>}
                                    //     {visibleColumns.group && <td>{item.group_name}</td>}
                                    //     {visibleColumns.code && <td>{item.code}</td>}
                                    //     {visibleColumns.course && <td>{item.course_name}</td>}
                                    //     {visibleColumns.campus && <td>{item.campus}</td>}
                                    //     {visibleColumns.delivery && <td>{item.delivery}</td>}
                                    //     {visibleColumns.roomNo && <td>{item.room_no}</td>}
                                    //     {visibleColumns.credits && <td>{item.credits}</td>}
                                    //     {visibleColumns.hoursPaid && <td>{item.hours_paid_for_the_class}</td>}
                                    //     {visibleColumns.hours && <td>{item.hours}</td>}
                                    //     {visibleColumns.finalEnrolment && <td>{item.enrolment_in_class}</td>}
                                    //     {visibleColumns.startDate && <td>{item.start_date}</td>}
                                    //     {visibleColumns.endDate && <td>{item.end_date}</td>}
                                    //     {visibleColumns.draftSchedule && <td>{item.schedule_draft}</td>}
                                    //     {visibleColumns.instructor && <td>{item.instructor}</td>}
                                    //     {visibleColumns.instructorEmail && <td>{item.instructor_email_id}</td>}
                                    //     {visibleColumns.programManager && <td>{item.program_manager}</td>}
                                    //     {visibleColumns.capacity && <td>{item.capacity}</td>}
                                    //     {visibleColumns.additionalCapacity && <td>{item.additional_capacity}</td>}
                                    //     {visibleColumns.campusAddressCode && <td>{item.campus_address_code}</td>}
                                    //     {visibleColumns.campusAddressCode && <td>{item.remarks}</td>}
                                    //     {visibleColumns.credentialsAndQualifications && <td>{item.credentails___qulaifications}</td>}
                                    //     <td className="flex gap-3">
                                    //         <EditBtn onClickFunc={() => editData(item.id)} />
                                    //         <DeleteBtn onClickFunc={() => deleteEntry(item.id)} />
                                    //     </td>
                                    // </tr>

````

## Code for validation in Room request form
````
import { useState } from "react";

const RoomBookingForm = () => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [department, setDepartment] = useState("");
    const [purpose, setPurpose] = useState("");
    const [room, setRoom] = useState("Room 101");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Validation function
    const validateForm = () => {
        let newErrors = {};

        if (!fullName.trim()) newErrors.fullName = "Full Name is required.";
        if (!email.trim()) newErrors.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format.";
        if (!department.trim()) newErrors.department = "Department is required.";
        if (!purpose.trim()) newErrors.purpose = "Purpose is required.";
        if (!date) newErrors.date = "Date is required.";
        if (!time) newErrors.time = "Time is required.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleForm = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        const bookingData = { fullName, email, department, purpose, room, date, time };

        try {
            const response = await fetch("/api/roombook", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingData),
            });

            if (response.ok) {
                alert("Room booked successfully!");
                setFullName("");
                setEmail("");
                setDepartment("");
                setPurpose("");
                setRoom("Room 101");
                setDate("");
                setTime("");
                setErrors({});
            } else {
                alert("Failed to book the room.");
            }
        } catch (error) {
            console.error("Error booking room:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-400 p-6 rounded-lg shadow-lg w-full max-w-md text-black">
            <h2 className="text-xl font-semibold mb-4">Book a Room</h2>
            <form onSubmit={handleForm}>
                <label>Full Name</label>
                <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input"
                />
                {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}

                <label>Contact Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

                <label>Department</label>
                <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="input"
                />
                {errors.department && <p className="text-red-500 text-sm">{errors.department}</p>}

                <label>Purpose</label>
                <textarea
                    className="input"
                    placeholder="Enter purpose of booking"
                    rows={3}
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                ></textarea>
                {errors.purpose && <p className="text-red-500 text-sm">{errors.purpose}</p>}

                <label className="block mb-2 font-medium">Select Room</label>
                <select
                    className="input"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                >
                    <option>Room 101</option>
                    <option>Room 102</option>
                    <option>Room 103</option>
                </select>

                <div className="flex gap-4">
                    <div>
                        <label>Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="input"
                        />
                        {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
                    </div>

                    <div>
                        <label>Time</label>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="input"
                        />
                        {errors.time && <p className="text-red-500 text-sm">{errors.time}</p>}
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn-primary w-full mt-5"
                    disabled={isLoading}
                >
                    {isLoading ? "Booking..." : "Book Now"}
                </button>
            </form>
        </div>
    );
};

export default RoomBookingForm;

````