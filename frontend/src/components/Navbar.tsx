import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Navbar() {
    
    const navigate = useNavigate();
    const { user, setUser } = useAuth();

    const handleLogout = async () => {
        try {
            await axios.post(
                'http://localhost:3000/api/auth/logout',
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
        <div className="flex flex-row justify-between align-middle px-30 py-5 bg-amber-50">
            <div className="hover:cursor-pointer" onClick={() => navigate("/home")}>RealTime Chat</div>
            <div className="flex flex-row justify-end gap-3">
                {user ? (
                    <>
                        <div onClick={() => navigate('/chat')} className="hover:cursor-pointer">Chat</div>
                        <div className='hover:cursor-pointer' onClick={handleLogout}>Logout</div>
                    </>

                ) : (
                    <>
                        <div onClick={() => navigate('/login')} className="hover:cursor-pointer">Login</div>
                        <div onClick={() => navigate('/register')} className="hover:cursor-pointer">Signup</div>
                    </>
                )}
            </div>
        </div>
    )
}