'use client'
import Layout from '@/components/design/Layout'
import Section from '@/components/Section'
import { useUserRole } from '@/components/UserContext';
import React, { useEffect, useState } from 'react'

// status 
// 0 rejected
// 1 success
// 2 pending

const RoomBook = () => {
    const { userName, email, role } = useUserRole();
    const [roomRequests, setRoomRequests] = useState([]);
    const [userRequests, setUserRequests] = useState([]);

    // const [form, setForm] = useState({
    //     fullName: userName,
    //     email: email,
    //     department: '' || "academics",
    //     purpose: '' || "for event",
    //     date: '' || "2025-11-11",
    //     startTime: '' || "14:00",
    //     endTime: '' || "16:00",
    //     capacity: '' || 25,
    // });

    const [form, setForm] = useState({
        fullName: '',
        email: '',
        department: '',
        purpose: '',
        date: '',
        startTime: '',
        endTime: '',
        capacity: '',
    });
    const [remarks, setRemarks] = useState({})

    useEffect(() => {
    }, [])

    // Run when userName or email updates
    useEffect(() => {
        if (userName && email) {
            setForm(prevForm => ({
                ...prevForm,
                fullName: userName,
                email: email,
            }));
        }
        if (role !== undefined && email) {
            getRoomRequests();
        }
    }, [userName, email]);

    const getRoomRequests = async () => {
        let res;
        // console.log("room get", email);

        if (role == 1) {
            res = await fetch("/api/roombook");
        } else {
            res = await fetch("/api/roombook/nonAdmin/?email=" + email);
        }
        const data = await res.json()
        // console.log(data[0]);
        setRoomRequests(data[0])
    }
    const handleChange = (e) => {
        const { name, value } = e.target;
        // console.log(e.target);
        // console.log(name, value);
        setForm(prevData => (
            { ...prevData, [name]: value }
        ));
    };
    const handleRemarksChange = (id, value) => {
        setRemarks(prevRemarks => ({
            ...prevRemarks,
            [id]: value  // Store remark based on request ID
        }));
    };
    const handleForm = async e => {
        e.preventDefault();
        const response = await fetch("/api/roombook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        if (role !== undefined && email) {
            getRoomRequests();
        }
        if (response.ok) {
            alert("Room request sent successfully!");
            setForm({
                fullName: userName,
                email: email,
                department: '',
                purpose: '',
                date: '',
                startTime: '',
                endTime: '',
                capacity: '',
            })
        } else {
            alert("Failed to book the room.");
        }
    }
    const updateApprovalStatus = async (id, status) => {
        let selectedRemarks = remarks[id];
        console.log(id, status, selectedRemarks);

        const response = await fetch(`/api/roombook/?id=${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status, selectedRemarks }),  // status can be 0, 1, or 2
        });
        const data = await response.json();
        if (data.success) {
            alert('Status updated successfully');
            getRoomRequests();
        } else {
            alert(`Error: ${data.message}`);
        }
    }

    return (
        <Layout>
            <Section title={"Room Booking"}>
                <div className="p-6 rounded-lg w-full text-black flex flex-wrap gap-5">

                    {/* User: Room book form */}
                    {role != 1 && <form onSubmit={e => handleForm(e)} className='w-full shadow-md lg:w-1/2 px-10 py-5'>
                        <h2 className="h2">Book a Room</h2>

                        <label>Full Name</label>
                        <input type='text' name="fullName" value={form.fullName} onChange={e => handleChange(e)} required disabled />

                        <label>Contact Email</label>
                        <input type='text' name="email" value={form.email} onChange={e => handleChange(e)} required disabled />

                        <label>Department</label>
                        <input type='text' name="department" value={form.department} onChange={e => handleChange(e)} required />

                        <label>Capacity Required</label>
                        <input type='number' name="capacity" value={form.capacity} onChange={e => handleChange(e)} required />

                        <label>Purpose</label>
                        <textarea className='input' placeholder="Enter purpose of booking" rows={3} name="purpose" value={form.purpose} onChange={e => handleChange(e)} required />

                        <div className="flex gap-4">
                            <div>
                                <label>Date</label>
                                <input type="date" name='date' value={form.date} onChange={e => handleChange(e)} required />
                            </div>
                            <div>
                                <label>Start Time</label>
                                <input type="time" name='startTime' value={form.startTime} onChange={e => handleChange(e)} required />
                            </div>
                            <div>
                                <label>End Time</label>
                                <input type="time" name='endTime' value={form.endTime} onChange={e => handleChange(e)} required />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary w-full mt-5">
                            Submit Request
                        </button>
                    </form>}

                    {/* Admin: Room book requests */}
                    {/* role == 1 && */}
                    <div className='w-full'>
                        <h2 className="h2">Requests</h2>
                        <div className="flex gap-4  flex-col">
                            {roomRequests?.length > 0 && roomRequests.map(item => (
                                <div key={item.id} className='bg-white shadow-lg mb-4 p-6 rounded-lg '>
                                    <div className="flex justify-between ">
                                        <ul>
                                            <li className="text-lg font-semibold">User Details</li>
                                            <li>{item.fullName}</li>
                                            <li>{item.email}</li>
                                            <li>{item.department}</li>
                                        </ul>
                                        <ul>
                                            <li className="text-lg font-semibold">Booking Details</li>
                                            <li>{item.purpose}</li>
                                            <li>{item.room}</li>
                                            <li>Capacity: {item.capacity}</li>
                                            <li>{item.date.split('T')[0]}</li>
                                            <li>{item.startTime.slice(0, 5)} to {item.endTime.slice(0, 5)}</li>
                                        </ul>

                                        <div className={`flex-center px-3 py-1 rounded-md pointer-events-none ${item.status == 1 ? 'text-green-500' : 'text-red-500'}`}>
                                            {item.status === 1
                                                ? "Done"
                                                : item.status === 2 ? "Pending" : "Rejected"
                                            }
                                        </div>
                                        {role == 1 && item.status == 2 && <div className="flex-center gap-2">
                                            <button className="btn-success" onClick={e => updateApprovalStatus(item.id, 1)}>Approve</button>
                                            <button className="btn-danger" onClick={e => updateApprovalStatus(item.id, 0)}>Reject</button>
                                        </div>}
                                    </div>
                                    {<textarea rows={2} className='w-1/2 !py-1 mt-2 !rounded-sm' type="text" placeholder='Remarks'
                                        value={remarks[item.id] || item.remarks || ""}
                                        onChange={e => handleRemarksChange(item.id, e.target.value)}
                                        disabled={role != 1 || item.status != 2}
                                        required
                                    />}
                                </div>
                            ))}
                            {roomRequests?.length == 0 && <div className="mt-5 text-center text-lg">No requests to display</div>}
                        </div >
                    </div >
                </div >
            </Section >
        </Layout >
    )
};
export default RoomBook