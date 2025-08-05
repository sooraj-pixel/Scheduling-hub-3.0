"use client"
import React from 'react'
import { useUserRole } from './UserContext';

const Section = ({ title, children, className, hideUsername }) => {
    const { userName } = useUserRole();

    return (
        // w-2/3 md:w-3/4 bg-gray-700 text-gray-100 bg-gray-200
        <div className={`relative p-10 w-full  m-4 rounded-md bg-white ${className || ''}`}>
            <div className="flex-between mb-5">
                <h1 className="h1">{title}</h1>
                <span className={hideUsername ? 'hidden' : 'block'}>{userName}</span>
            </div>
            <div>
                {children}
            </div>
        </div>
    )
}

export default Section