"use client"
import { SessionProvider } from "next-auth/react"

const SessionWrapper = ({ children }) => {

    return (
            {children}
    )
}

export default SessionWrapper;