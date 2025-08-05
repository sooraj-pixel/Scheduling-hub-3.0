'use client'
import { useRouter } from 'next/navigation';
import { createContext, useContext, useState, useEffect } from 'react';

const UserRoleContext = createContext();

export const UserRoleProvider = ({ children }) => {
    const router = useRouter();
    const [role, setRole] = useState(0);
    const [userName, setUserName] = useState('')
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     getUser()
    // }, []);

    useEffect(() => {
        getUser()
    }, [role, userName, email, password]);

    const getUser = () => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser) {
            setLoading(false);
            router.push("/");
            return;
        }
        setRole(storedUser.role);
        setUserName(storedUser.username);
        setEmail(storedUser.email);
        setPassword(storedUser.password);
        setLoading(false);
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <UserRoleContext.Provider value={{ role, userName, email, password, setRole, setUserName }}>
            {children}
        </UserRoleContext.Provider>
    )
}
// Custom hook to access the userDetails
export const useUserRole = () => {
    return useContext(UserRoleContext);
};