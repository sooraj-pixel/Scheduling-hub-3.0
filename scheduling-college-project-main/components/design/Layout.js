import Navbar from '../Navbar'

const Layout = ({ children }) => {
    return (
        <div className='flex min-h-screen bg-slate-200'>
            <Navbar />
            {children}
        </div>
    )
}
export default Layout