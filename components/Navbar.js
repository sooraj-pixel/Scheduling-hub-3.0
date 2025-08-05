"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useUserRole } from "./UserContext";

const Navbar = () => {
    const pathName = usePathname();
    const router = useRouter();
    const { role } = useUserRole();

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
                <img src="/navbar/nct-logo-white.svg" width={200} alt="Logo" />
            </div>

            <nav className="flex flex-col gap-2" >
                <div className="mt-5 py-3 border-t-2 border-b-2 border-gray-500">
                    {/* Dashboard */}
                    <Link href={"/dashboard"} className={pathName == "/dashboard" ? activeLink : inactiveLink}>
                        <img className="invert" src="/navbar/dashboard.svg" width={25} height={25} alt="Dashboard" />
                        <span>Dashboard</span>
                    </Link>

                    {/* My Schedule tab (for instructors only) */}
                    {role === 2 && (
                        <Link href={"/instructor/schedule"} className={pathName == "/instructor/schedule" ? activeLink : inactiveLink}>
                            <img className="invert" src="/navbar/schedule.svg" width={25} height={25} alt="Schedule" />
                            <span>My Schedule</span>
                        </Link>
                    )}

                    {/* Admin-only tabs */}
                    {role == 1 && (
                        <>
                            <Link href={"/schedule"} className={pathName == "/schedule" ? activeLink : inactiveLink}>
                                <img className="invert" src="/navbar/schedule.svg" width={25} height={25} alt="Master Schedule" />
                                <span>Master Schedule</span>
                            </Link>
                            <Link href={"/announcements"} className={pathName == "/announcements" ? activeLink : inactiveLink}>
                                <img className="invert" src="/navbar/announcements.svg" width={25} height={25} alt="Announcements" />
                                <span>Announcements</span>
                            </Link>
                            <Link href={"/instructor"} className={pathName == "/instructors" ? activeLink : inactiveLink}>
                                <img className="invert" src="/navbar/instructor.svg" width={20} height={20} alt="Instructors" />
                                <span className="ml-1">Instructors</span>
                            </Link>
                        </>
                    )}

                    {/* Not for instructors (e.g., admin/staff only) */}
                    {role != 2 && (
                        <Link href={"/classrooms"} className={pathName == "/classrooms" ? activeLink : inactiveLink}>
                            <img className="invert" src="/navbar/classroom.svg" width={21} height={21} alt="Classrooms" />
                            <span>Classrooms</span>
                        </Link>
                    )}

                    {/* All roles */}
                    <Link href={"/programs"} className={pathName == "/programs" ? activeLink : inactiveLink}>
                        <img className="invert" src="/navbar/book.svg" width={25} height={25} alt="Programs" />
                        <span>Programs</span>
                    </Link>
                </div>

                <div>
                    {role != 2 && (
                        <Link href={"/staff"} className={pathName == "/staff" ? activeLink : inactiveLink}>
                            <img className="invert" src="/navbar/group.svg" width={25} height={25} alt="Staff" />
                            <span>Staff</span>
                        </Link>
                    )}
                    <Link href={"/roombook"} className={pathName == "/roombook" ? activeLink : inactiveLink}>
                        <img className="invert" src="/navbar/roomRequest.svg" width={25} height={25} alt="Room Requests" />
                        <span>Room Requests</span>
                    </Link>
                    <Link href={"/academicFiles"} className={pathName == "/academicFiles" ? activeLink : inactiveLink}>
                        <img className="invert" src="/navbar/files.svg" width={25} height={25} alt="Academic Files" />
                        <span>Academic Files</span>
                    </Link>
                    {role == 1 && (
                        <Link href={"/users"} className={pathName == "/users" ? activeLink : inactiveLink}>
                            <img className="invert" src="/navbar/users.svg" width={25} height={25} alt="Users" />
                            <span>Users</span>
                        </Link>
                    )}
                </div>

                {/* Footer */}
                <div className="w-full border-t-2 border-gray-500 absolute left-0 bottom-0">
                    <Link href={"/profile"} className={pathName == "/profile" ? activeLink : inactiveLink}>
                        <img className="invert" src="/navbar/avatar.svg" width={25} height={25} alt="My Profile" />
                        <span>My Profile</span>
                    </Link>
                    <button className={inactiveLink} onClick={() => signOut()}>
                        <img className="invert" src="/navbar/signout.svg" width={25} height={25} alt="Sign out" />
                        Sign out
                    </button>
                </div>
            </nav>
        </aside>
    );
};

export default Navbar;
