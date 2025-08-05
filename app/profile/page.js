'use client'
import Layout from '@/components/design/Layout'
import Section from '@/components/Section'
import { useUserRole } from '@/components/UserContext';
import React, { useState } from 'react'

const Profile = () => {
    const { userName, email, password } = useUserRole();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage("");

        if (password != currentPassword) {
            setMessage("Current Password is incorrect. Try Again!");
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage("New passwords do not match.");
            return;
        }

        const res = await fetch("/api/users/changePassword?email=" + email, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentPassword, newPassword }),
        });

        const data = await res.json();

        if (res.ok) {
            alert("Password updated successfully.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } else {
            setMessage(data.error || "Something went wrong.");
        }
    };

    return (
        <Layout>
            <Section title={"My Profile"}>
                <div className="max-w-md mx-auto mt-10 p-6 bg-n-1/10 shadow-xlxl">
                    <h2 className="h2 text-center">My Profile</h2>

                    {/* Display Username & Email (Read-Only) */}
                    <div className="mb-4">
                        <label className="block font-medium">Username</label>
                        <input type="text" value={userName} disabled />
                    </div>
                    <div className="mb-4">
                        <label className="block font-medium">Email</label>
                        <input type="email" value={email} disabled />
                    </div>

                    {/* Change Password Form */}
                    <form onSubmit={e => handlePasswordChange(e)}>
                        <div className="mb-4">
                            <label className="block font-medium">Current Password</label>
                            <input
                                type="text"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block font-medium">New Password</label>
                            <input
                                type="text"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block font-medium">Confirm New Password</label>
                            <input
                                type="text"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        {message && <p className="text-red-500">{message}</p>}

                        <button type="submit" className="btn-primary w-full mt-2">
                            Update Password
                        </button>
                    </form>
                </div>
            </Section>
        </Layout>
    )
}

export default Profile