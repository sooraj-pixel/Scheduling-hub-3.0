"use client";
import React, { useEffect, useState } from "react";
import Layout from "@/components/design/Layout";
import Section from "@/components/Section";
import { DeleteBtn, EditBtn } from "@/components/design/Icons";
import { useUserRole } from "@/components/UserContext";
import { notFound } from "next/navigation";

const Users = () => {
    const { role } = useUserRole();

    if (role !== 1) {
        return notFound(); // Triggers Next.js's built-in 404 page
    }

    const [users, setUsers] = useState([]);
    const [displayData, setDisplayData] = useState(users);
    const [filteredUsers, setFilteredUsers] = useState([]); // SearchTerm

    const [formData, setFormData] = useState({ username: "", email: "", password: "", role: "" });
    const [selectedUserId, setSelectedUserId] = useState(0);
    const [dynamicText, setDynamicText] = useState("Add");

    const [requests, setRequests] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");

    // if (searchTerm) setdisplayData(filteredUsers);
    // else setdisplayData(users);
    // if (searchTerm) setDisplayData(filteredUsers);
    // else setDisplayData(users);

    useEffect(() => {
        getUsers()
        getRequests()
    }, [])

    // SearchTerm for all fields
    useEffect(() => {
        let lowerSearchTermTerm = searchTerm.toLowerCase();
        let updatedUsers = users.filter(item =>
            Object.values(item).some(value =>
                value && value.toString().toLowerCase().includes(lowerSearchTermTerm)
            )
        );
        setFilteredUsers(updatedUsers)
        console.log(updatedUsers);
    }, [searchTerm, users])

    // update the table whenever searchTerm or filteredUsers changes
    useEffect(() => {
        setDisplayData(searchTerm ? filteredUsers : users);
    }, [filteredUsers]);

    const getUsers = async () => {
        const response = await fetch('/api/users');
        const result = await response.json();
        const data = result[0]
        // console.log(data);
        setUsers(data)
    }
    const getRequests = async () => {
        const res = await fetch("/api/users/resetPassword")
        const requestsData = await res.json()
        // console.log(requestsData);
        setRequests(requestsData)
    }
    // const filteredUsers = users.filter(user =>
    //     user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //     user.email.toLowerCase().includes(searchTerm.toLowerCase())
    // )
    // .sort((a, b) => {
    //     const fieldA = a[sortField].toLowerCase();
    //     const fieldB = b[sortField].toLowerCase();
    //     return sortOrder === "asc" ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
    // });
    // console.log(filteredUsers);

    const handleSort = (field) => {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        setSortField(field);
    };
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const editUser = (user) => {
        // console.log(user);
        const displayData = {
            username: user.username,
            email: user.email,
            password: user.password,
            role: user.role
        }
        setFormData(displayData);
        setSelectedUserId(user.id);
        setDynamicText("Update")
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = selectedUserId ? `/api/users/?id=${selectedUserId}` : "/api/users"
        const method = selectedUserId ? "PUT" : "POST";
        // console.log({ formData, selectedUserId });
        console.log(method, url);

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

        getUsers(); // get the updated changes
        resetForm();
    };
    const deleteUser = async (id) => {
        if (!confirm("Are you sure you want to delete this user?")) {
            return;
        }
        const res = await fetch(`/api/users?id=${id}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            alert("Deleted successfully");
            getUsers();
        } else {
            alert("Failed to delete");
        }
    };
    const resetForm = () => {
        setFormData({ username: "", email: "", password: "", role: "" });
        setDynamicText("Add");
    }
    const deleteRequest = async (id) => {
        console.log(id);
        if (!confirm("Are you sure you want to delete this request?")) {
            return;
        }
        const res = await fetch(`/api/users/resetPassword?id=${id}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            alert("Deleted successfully");
            getRequests();
        } else {
            alert("Failed to delete");
        }
    }
    return (
        <Layout>
            <Section title="All Users">
                {/* SearchTerm button and User form */}
                <div>
                    <div className="mb-5 w-1/3">
                        <input type="text" placeholder="Search Users by Name"
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <h3 className="h3">{dynamicText} User</h3>
                    <form onSubmit={e => handleSubmit(e)} className="flex gap-3 h-[36px] mt-3 mb-5">
                        <input type="text" name="username" className=" w-full"
                            required value={formData.username} onChange={handleChange} placeholder="Name"
                        />
                        <input type="email" name="email" className=" w-full"
                            required value={formData.email} onChange={handleChange} placeholder="Email"
                        />
                        <input type="text" name="password" className=" w-full"
                            required value={formData.password} onChange={handleChange} placeholder="Password"
                        />
                        <select name="role" className="input  w-1/2"
                            required value={formData.role} onChange={handleChange}
                        >
                            <option value="">Select Role</option>
                            <option value="1">Admin</option>
                            <option value="2">Instructor</option>
                            <option value="3">Observer</option>
                        </select>
                        <button type="submit" className="btn-primary w-1/2">
                            {dynamicText}
                        </button>
                    </form>
                </div>

                {/* Table */}
                <div className="max-h-[80vh] overflow-y-scroll">
                    <table className="table-basic ">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort("name")}>Name</th>
                                <th>Email</th>
                                <th>Passwords</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* {filteredUsers.map(user => ( */}
                            {displayData?.length > 0 && displayData.map(user => (
                                <tr key={user.id}>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>{user.password}</td>
                                    <td>{user.role}</td>
                                    <td className="flex gap-3">
                                        <EditBtn onClickFunc={() => editUser(user)} />
                                        <DeleteBtn onClickFunc={() => deleteUser(user.id)} />
                                    </td>
                                </tr>
                            ))}
                            {/* ))} */}
                        </tbody>
                    </table>
                </div>

                {/* Reset passwords Requests */}
                <div className="mt-10">
                    <div className="mt-10 p-6 ">
                        <h2 className="h2">Reset Password Requests</h2>
                        {requests?.length > 0 && <ul>
                            {requests.map((req, index) => (
                                <li key={index} className="p-2 my-1 border-b flex gap-3">
                                    <span>{req.email}</span>
                                    <DeleteBtn onClickFunc={e => deleteRequest(req.id)} />
                                </li>
                            ))}
                        </ul>}
                        {requests?.length === 0 && <p>No pending requests.</p>}
                    </div>
                </div>
            </Section>
        </Layout>
    );
};

export default Users;