import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config';

export default function Navbar() {
    
    const navigate = useNavigate();
    const { user, setUser } = useAuth();

    const handleLogout = async () => {
        try {
            await axios.post(
                `${API_URL}/api/auth/logout`,
                {},
                { withCredentials: true }
            );
            setUser(null);
            navigate('/login');
        }
        catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="flex shrink-0 flex-row items-center justify-between gap-4 bg-amber-50 px-4 py-5 sm:px-8 lg:px-30">
            <div className="hover:cursor-pointer text-[15px] md:text-[15px] sm:text-[20px]" onClick={() => navigate("/")}>RealTime Chat</div>
            <div className="flex flex-row justify-end gap-3">
                {user ? (
                    <>
                        <div onClick={() => navigate('/chat')} className="hover:cursor-pointer text-[15px] md:text-[15px] sm:text-[20px]">Chat</div>
                        <div className='hover:cursor-pointer text-[15px] md:text-[15px] sm:text-[20px]' onClick={handleLogout}>Logout</div>
                    </>

                ) : (
                    <>
                        <div onClick={() => navigate('/login')} className="hover:cursor-pointer text-[15px] md:text-[15px] md:px-5 sm:text-[20px]">Login</div>
                        <div onClick={() => navigate('/register')} className="hover:cursor-pointer text-[15px] md:text-[15px] sm:text-[20px]">Signup</div>
                    </>
                )}
            </div>
        </div>
    )
}