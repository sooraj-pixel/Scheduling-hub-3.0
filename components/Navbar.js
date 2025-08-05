'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserRole } from './UserContext'; // Assuming UserContext is correctly located

const Navbar = () => {
    const pathName = usePathname();
    const router = useRouter();
    const { role } = useUserRole();

    const inactiveLink = `text-gray-300 flex gap-3 py-2 px-2.5 rounded-l-lg text-center hover:text-white ml-3 transition`;
    const activeLink = inactiveLink + ' invert bg-black';

    const signOut = () => {
        localStorage.removeItem('user');
        router.push('/');
    };

    return (
        <aside className="sticky top-0 left-0 w-1/3 lg:w-1/5 h-screen pt-5 bg-slate-700 text-white">
            {/* Logo */}
            <div className="mx-4">
                <img src="./nct-logo-white.svg" width={200} alt="NCT Logo" />
            </div>

            <nav className="flex flex-col gap-2">
                <div className="mt-5 py-3 border-t-2 border-b-2 border-gray-500">
                    <Link href={"/dashboard"} className={pathName == "/dashboard" ? activeLink : inactiveLink}>
                        <img className="invert" src="./navbar/dashboard.svg" width={25} height={25} alt="Dashboard Icon" />
                        <span>Dashboard</span>
                    </Link>

                    {role == 1 && (
                        <>
                            <Link href={"/schedule"} className={pathName == "/schedule" ? activeLink : inactiveLink}>
                                <img className="invert" src="./navbar/schedule.svg" width={25} height={25} alt="Master Schedule Icon" />
                                <span>Master Schedule</span>
                            </Link>
                            {/* REMOVED: Link to the Master Schedule Calendar Page as requested */}
                            {/*
                            <Link href={"/master-schedule-calendar"} className={pathName == "/master-schedule-calendar" ? activeLink : inactiveLink}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="25"
                                    height="25"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-calendar-check"
                                >
                                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                    <line x1="16" x2="16" y1="2" y2="6" />
                                    <line x1="8" x2="8" y1="2" y2="6" />
                                    <line x1="3" x2="21" y1="10" y2="10" />
                                    <path d="m9 16 2 2 4-4" />
                                </svg>
                                <span>Master Schedule Calendar</span>
                            </Link>
                            */}
                            {/* Updated: Renamed existing Calendar link for clarity */}
                            <Link href={"/calendar"} className={pathName == "/calendar" ? activeLink : inactiveLink}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="25"
                                    height="25"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-calendar"
                                >
                                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                    <line x1="16" x2="16" y1="2" y2="6" />
                                    <line x1="8" x2="8" y1="2" y2="6" />
                                    <line x1="3" x2="21" y1="10" y2="10" />
                                </svg>
                                <span>General Events</span>
                            </Link>
                        </>
                    )}

                    {role == 1 && (
                        <Link href={"/announcements"} className={pathName == "/announcements" ? activeLink : inactiveLink}>
                            <img className="invert" src="./navbar/announcements.svg" width={25} height={25} alt="Announcements Icon" />
                            <span>Announcements</span>
                        </Link>
                    )}

                    {role == 1 && (
                        <Link href={"/instructors"} className={pathName == "/instructors" ? activeLink : inactiveLink}>
                            <img className="invert" src="./navbar/instructor.svg" width={20} height={20} alt="Instructor Icon" />
                            <span className="ml-1">Instructors</span>
                        </Link>
                    )}

                    {role != 2 && (
                        <Link href={"/classrooms"} className={pathName == "/classrooms" ? activeLink : inactiveLink}>
                            <img className="invert" src="./navbar/classroom.svg" width={21} height={21} alt="Classroom Icon" />
                            <span>Classrooms</span>
                        </Link>
                    )}

                    <Link href={"/programs"} className={pathName == "/programs" ? activeLink : inactiveLink}>
                        <img className="invert" src="./navbar/book.svg" width={25} height={25} alt="Programs Icon" />
                        <span>Programs</span>
                    </Link>
                </div>

                <div>
                    {role != 2 && (
                        <Link href={"/staff"} className={pathName == "/staff" ? activeLink : inactiveLink}>
                            <img className="invert" src="./navbar/group.svg" width={25} height={25} alt="Staff Icon" />
                            <span>Staff</span>
                        </Link>
                    )}

                    <Link href={"/inventory"} className={pathName == "/inventory" ? activeLink : inactiveLink} >
                        <img className="invert" src="https://gimgs2.nohat.cc/thumb/f/640/inventory-png-photos-inventory-icon-free--m2H7G6b1A0A0G6Z5.jpg" width={35} height={25} alt="Inventory Icon" style={{ opacity: 0.5 }} />
                        <span>Inventory</span>
                    </Link>

                    <Link href={"/roombook"} className={pathName == "/roombook" ? activeLink : inactiveLink}>
                        <img className="invert" src="./navbar/roomRequest.svg" width={25} height={25} alt="Room Requests Icon" />
                        <span>Room Requests</span>
                    </Link>

                    <Link href={"/academicFiles"} className={pathName == "/academicFiles" ? activeLink : inactiveLink}>
                        <img className="invert" src="./navbar/files.svg" width={25} height={25} alt="Academic Files Icon" />
                        <span>Academic Files</span>
                    </Link>

                    {role == 1 && (
                        <Link href={"/users"} className={pathName == "/users" ? activeLink : inactiveLink}>
                            <img className="invert" src="./navbar/users.svg" width={25} height={25} alt="Users Icon" />
                            <span>Users</span>
                        </Link>
                    )}
                </div>

                <div className="w-full border-t-2 border-gray-500 absolute left-0 bottom-0">
                    <Link href={"/profile"} className={pathName == "/profile" ? activeLink : inactiveLink}>
                        <img className="invert" src="./navbar/avatar.svg" width={25} height={25} alt="My Profile Icon" />
                        <span>My Profile</span>
                    </Link>

                    <button className={inactiveLink} onClick={() => signOut()}>
                        <img className="invert" src="./navbar/signout.svg" width={25} height={25} alt="Sign Out Icon" />
                        Sign out
                    </button>
                </div>
            </nav>
        </aside>
    );
};

export default Navbar;
