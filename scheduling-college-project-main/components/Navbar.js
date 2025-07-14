"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useUserRole } from "./UserContext";

const Navbar = () => {
    const pathName = usePathname();
    const router = useRouter();
    const { role } = useUserRole();
    // console.log(pathName); // works

    // Classes for dynamic navbar
    const inactiveLink = `text-gray-300 flex gap-3 py-2 px-2.5 rounded-l-lg text-center hover:text-white ml-3 transition`;
    const activeLink = inactiveLink + " invert bg-black";

    const signOut = () => {
        localStorage.removeItem('user');
        router.push("/")
    }
    return (
        <aside className="sticky top-0 left-0 w-1/3 lg:w-1/5 h-screen pt-5 bg-slate-700 text-white">
            {/* Logo */}
            <div className="mx-4">
                <img src="./nct-logo-white.svg" width={200} alt="NCT Logo" />
            </div>

            <nav className="flex flex-col gap-2" >
                <div className="mt-5 py-3 border-t-2 border-b-2 border-gray-500">
                    <Link href={"/dashboard"} className={pathName == "/dashboard" ? activeLink : inactiveLink}>
                        <img className="invert" src="./navbar/dashboard.svg" width={25} height={25} alt="Dashboard icon" />
                        <span>Dashboard</span>
                    </Link>

                    {/* Schedule Link - Conditional based on role */}
                    {role === 1 && ( // For Admin: "Manage Schedules" or "Master Schedule"
                        <Link href={"/schedule"} className={pathName == "/schedule" ? activeLink : inactiveLink} >
                            <img className="invert" src="./navbar/schedule.svg" width={25} height={25} alt="Schedule icon" />
                            <span>Manage Schedules</span> {/* Changed label for Admin */}
                        </Link>
                    )}
                    {role === 2 && ( // For Instructor: "My Schedule"
                        <Link href={"/schedule"} className={pathName == "/schedule" ? activeLink : inactiveLink} >
                            <img className="invert" src="./navbar/schedule.svg" width={25} height={25} alt="My Schedule icon" />
                            <span>My Schedule</span> {/* New label for Instructor */}
                        </Link>
                    )}

                    {role === 1 && <Link href={"/announcements"} className={pathName == "/announcements" ? activeLink : inactiveLink} >
                        <img className="invert" src="./navbar/announcements.svg" width={25} height={25} alt="Announcements icon" />
                        <span>Announcements</span>
                    </Link>}

                    {role === 1 && <Link href={"/instructors"} className={pathName == "/instructors" ? activeLink : inactiveLink} >
                        <img className="invert" src="./navbar/instructor.svg" width={20} height={20} alt="Instructors icon" />
                        <span className="ml-1">Instructors</span>
                    </Link>}

                    {role !== 2 && <Link href={"/classrooms"} className={pathName == "/classrooms" ? activeLink : inactiveLink} >
                        <img className="invert" src="./navbar/classroom.svg" width={21} height={21} alt="Classrooms icon" />
                        <span>Classrooms</span>
                    </Link>}

                    <Link href={"/programs"} className={pathName == "/programs" ? activeLink : inactiveLink} >
                        <img className="invert" src="./navbar/book.svg" width={25} height={25} alt="Programs icon" />
                        <span>Programs</span>
                    </Link>
                </div>

                <div>
                    {role !== 2 && <Link href={"/staff"} className={pathName == "/staff" ? activeLink : inactiveLink} >
                        <img className="invert" src="./navbar/group.svg" width={25} height={25} alt="Staff icon" />
                        <span>Staff</span>
                    </Link>}

                    <Link href={"/roombook"} className={pathName == "/roombook" ? activeLink : inactiveLink} >
                        <img className="invert" src="./navbar/roomRequest.svg" width={25} height={25} alt="Room Requests icon" />
                        <span>Room Requests</span>
                    </Link>

                    <Link href={"/academicFiles"} className={pathName == "/academicFiles" ? activeLink : inactiveLink} >
                        <img className="invert" src="./navbar/files.svg" width={25} height={25} alt="Academic Files icon" />
                        <span>Academic Files</span>
                    </Link>

                    {role === 1 && <Link href={"/users"} className={pathName == "/users" ? activeLink : inactiveLink} >
                        <img className="invert" src="./navbar/users.svg" width={25} height={25} alt="Users icon" />
                        <span>Users</span>
                    </Link>}
                </div>

                <div className="w-full border-t-2 border-gray-500 absolute left-0 bottom-0">
                    <Link href={"/profile"} className={pathName == "/profile" ? activeLink : inactiveLink} >
                        <img className="invert" src="./navbar/avatar.svg" width={25} height={25} alt="My Profile icon" />
                        <span>My Profile</span>
                    </Link>
                    <button className={inactiveLink} onClick={() => signOut()}>
                        <img className="invert" src="./navbar/signout.svg" width={25} height={25} alt="Sign Out icon" />
                        Sign out
                    </button>
                </div>
            </nav>
        </aside>
    );
};

export default Navbar;
