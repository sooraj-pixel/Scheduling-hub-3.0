'use client'
import { useRouter } from 'next/navigation';
import { createContext, useContext, useState, useEffect, useRef } from 'react'; // Added useRef

const UserRoleContext = createContext();

export const UserRoleProvider = ({ children }) => {
    const router = useRouter();
    const [role, setRole] = useState(0);
    const [userName, setUserName] = useState(''); // This will now store the email ID
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const redirectAttempted = useRef(false); // Flag to prevent multiple redirects

    useEffect(() => {
        const getUser = () => {
            if (redirectAttempted.current) {
                // If a redirect was already attempted, do not re-run this logic
                // to prevent infinite loops or unnecessary state changes.
                return;
            }

            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (!storedUser) {
                console.log("UserContext: No user in localStorage, attempting redirect to login.");
                setLoading(false); // Set loading to false before redirect
                if (router.pathname !== "/") { // Prevent redirecting if already on login page
                    router.push("/");
                    redirectAttempted.current = true; // Mark that a redirect has been attempted
                }
                return;
            }

            // If user is found, populate states and set loading to false
            setRole(storedUser.role);
            setUserName(storedUser.email);
            setEmail(storedUser.email);
            setPassword(storedUser.password); // Be cautious about storing passwords in localStorage
            setLoading(false);
            console.log("UserContext: User found, context loaded.");
        };

        getUser();
    }, [router.pathname]); // Added router.pathname to dependency array to re-check on route changes

    // Optional: Add a logger to see when UserRoleProvider itself re-renders
    useEffect(() => {
        console.log("UserRoleProvider rendered. Loading:", loading, "Role:", role, "UserName:", userName);
    });


    if (loading) {
        return <div className="flex items-center justify-center h-screen text-xl font-semibold text-gray-700">Loading user data...</div>;
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
