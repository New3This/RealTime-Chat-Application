import { useNavigate } from 'react-router-dom';

export default function Navbar() {
    
    const navigate = useNavigate();

    return (
        <div className="flex flex-row justify-between align-middle px-30 py-5 bg-amber-50">
            <div>RealTime Chat</div>
            <div className="flex flex-row justify-end gap-3">
                <div onClick={() => navigate('/login')}>Login</div>
                <div>Signup</div>
            </div>
        </div>
    )
}